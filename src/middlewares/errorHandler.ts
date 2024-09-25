// errorHandler.ts
import { Request, Response, NextFunction } from "express";
import CustomError from "./customError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500; // Default to 500 if no status code is set
  const message = err.message || "Internal Server Error";
  const details = err.details || null; // Optional details

  // Standardized error response
  const response = {
    code: statusCode,
    status: false,
    message,
    details,
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
