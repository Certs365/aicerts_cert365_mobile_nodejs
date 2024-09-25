// customError.ts
class CustomError extends Error {
  statusCode: number;
  details?: any; // Optional details property

  constructor(message: string, statusCode: number, details?: any) {
      super(message);
      this.statusCode = statusCode;
      this.details = details; // Assign the details if provided
      Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
