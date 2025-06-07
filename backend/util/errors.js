export class NotAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAuthError';
    this.status = 401;
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 422;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}