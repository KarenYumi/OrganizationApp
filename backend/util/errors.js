export class NotFoundError {
  constructor(message) {
    this.message = message;
    this.status = 404;
  }
}

export class NotAuthError {
  constructor(message) {
    this.message = message;
    this.status = 401;
  }
}
