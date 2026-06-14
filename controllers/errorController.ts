import AppError from '../utils/appError';
import type { ErrorRequestHandler } from 'express';

const sendErrorDev = (err: any, req: any, res: any) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, req: any, res: any) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR:', err);

  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

const handleCastErrorDB = (err: any) => new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err: any) => {
  const value = Object.values(err.keyValue || {})[0] || 'field value';
  return new AppError(`Duplicate field value: ${value}. Please use another value.`, 409);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const globalErrorHandler: ErrorRequestHandler = (err: any, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.create(Object.getPrototypeOf(err));
  error = Object.assign(error, err);
  error.message = err.message;
  error.stack = err.stack;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(error, req, res);
  }

  sendErrorProd(error, req, res);
};

export default globalErrorHandler;
