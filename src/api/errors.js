export class ApiError extends Error {
  constructor(message, { status, isUnauthorized = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isUnauthorized = isUnauthorized;
  }
}
