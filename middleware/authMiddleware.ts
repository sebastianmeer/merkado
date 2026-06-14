import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

const cleanToken = (rawToken: string) =>
  rawToken
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = cleanToken(req.headers.authorization);
  } else if (req.cookies && req.cookies.jwt) {
    token = cleanToken(req.cookies.jwt);
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  if (token.includes('{{') || token.includes('}}')) {
    return next(
      new AppError(
        'Postman did not resolve your token variable. Log in or sign up, then paste the returned JWT as the Bearer Token value.',
        401
      )
    );
  }

  if (token === 'undefined' || token === 'null' || token.split('.').length !== 3) {
    return next(
      new AppError(
        'The Bearer Token value is not a JWT. Use only the token string returned by login or signup, without quotes and without another Bearer prefix.',
        401
      )
    );
  }

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(payload);
    });
  });

  const currentUser = await User.findById((decoded as any).id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if ((currentUser as any).changedPasswordAfter((decoded as any).iat)) {
    return next(new AppError('User recently changed password. Please log in again.', 401));
  }

  req.user = currentUser as any;
  res.locals.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req.user as any).role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
