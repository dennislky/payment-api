import HttpStatus from 'http-status';
import ErrorCode from './config/errorcode';

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {number} errorCode - Error code of application
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode = ErrorCode.SUCCESS,
    isPublic = true,
  ) {
    super(message, status, isPublic);
    this.errorCode = errorCode;
  }
}

export default APIError;
