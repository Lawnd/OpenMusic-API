const ClientError = require('./ClientError');

class InternalServerError extends ClientError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

module.exports = InternalServerError;
