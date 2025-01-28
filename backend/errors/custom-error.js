/**
 * CustomError extends the built-in Error class to create application-specific errors
 * with additional properties like statusCode. This helps maintain consistent error
 * handling throughout the application.
 * 
 * @extends Error
 */
class CustomError extends Error {
    /**
     * Creates a new CustomError instance
     * @param {string} message - The error message to display
     * @param {number} statusCode - The HTTP status code associated with this error
     */
    constructor(message, statusCode) {
      // Call the parent Error constructor with the message
      super(message);
  
      // Set the status code for this error
      this.statusCode = statusCode;
  
      // Maintain proper stack trace for where the error was thrown
      Error.captureStackTrace(this, this.constructor);
  
      // Set the error name to the class name for better error identification
      this.name = this.constructor.name;
    }
  }
  
  module.exports = CustomError;