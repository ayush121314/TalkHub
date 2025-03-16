const { StatusCodes } = require('http-status-codes');
const CustomError = require('./custom-error');

class BadRequestError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

module.exports = {
  BadRequestError,
  NotFoundError
}; 