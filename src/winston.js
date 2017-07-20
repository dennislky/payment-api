import winston from 'winston';

const consoleLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true,
    }),
  ],
});

export default consoleLogger;
