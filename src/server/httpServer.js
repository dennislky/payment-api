import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import helmet from 'helmet';
import apiV1 from '../server/api/v1/routes/index.route';

export default class {
  constructor({
    config,
    mongoose,
    braintreeGateway,
    paypalGateway,
    fetch,
    validate,
    APIError,
    ErrorCode,
    ParamValidation,
  }) {
    Object.assign(this, {
      config,
      mongoose,
      braintreeGateway,
      paypalGateway,
      fetch,
      validate,
      APIError,
      ErrorCode,
      ParamValidation,
    });

    const app = express();
    this.app = app;

    if (config.get('env') === 'development') {
      app.use(logger('dev'));
    }

    // parse body params and attache them to req.body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());

    // secure apps by setting various HTTP headers
    app.use(helmet());

    // enable CORS - Cross Origin Resource Sharing
    app.use(cors());

    app.use((req, res, next) => {
      if (res.formatSend == null) {
        res.formatSend = (status, data = null, errorCode = 0, errorMsg = 'success') => {
          res.status(status).send({
            status: httpStatus[status],
            errorCode: (errorCode.code) ? errorCode.code : errorCode,
            errorMsg,
            data,
          });
        };
      }
      next();
    });

    // mount all routes on /api path
    const v1 = apiV1({
      config,
      mongoose,
      express,
      braintreeGateway,
      paypalGateway,
      fetch,
      validate,
      APIError,
      ErrorCode,
      ParamValidation,
    });

    app.use('/v1', v1);

    // if error is not an instanceOf APIError, convert it.
    app.use((err, req, res, next) => {
      // console.log("errrr", err);
      if (err instanceof validate.ValidationError) {
        // validation error contains errors which is an array of error each containing message[]
        const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
        const error = new APIError(unifiedErrorMessage, 200, -1, true);
        return next(error);
      } else if (!(err instanceof APIError)) {
        const apiError = new APIError(err.message, 200, err.errorCode, err.isPublic);
        return next(apiError);
      }
      return next(err);
    });

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new APIError('API not found', httpStatus.NOT_FOUND);
      return next(err);
    });

    // error handler, send stacktrace only during development
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
      const message = (err.errorCode.message) ? err.errorCode.message : err.message;
      res.formatSend(err.status, {
        // message: err.message,
        message: (err.isPublic) ? message : httpStatus[err.status],
        // systemMessage: err.isPublic ? err.message : httpStatus[err.status],
        stack: config.get('env') === 'development' ? err.stack : {},
      }, err.errorCode, err.message);
    });
  }

  start() {
    const port = this.config.get('server.port');
    this.app.listen(port, () => {
      console.log(`server started listening on ${port}`);
    });
  }
}
