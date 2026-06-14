import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';

import connectDB from './db/connect';
import productRouter from './routes/productRoutes';
import authRouter from './routes/authRoutes';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE) {
  dotenv.config({ path: path.join(__dirname, 'config.env') });
}

const app = express();

app.set('query parser', 'extended');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  const { default: morgan } = await import('morgan');
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again in one hour.',
  },
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', limiter);
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const makeSanitizedFieldsWritable = (req: Request, res: Response, next: NextFunction) => {
  ['query', 'params'].forEach((field) => {
    if (req[field as keyof Request] !== undefined) {
      Object.defineProperty(req, field, {
        value: req[field as keyof Request],
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  });
  next();
};

app.use(makeSanitizedFieldsWritable);
app.use(mongoSanitize());
app.use((req, res, next) => {
  if (typeof req.body?.password === 'string' && req.body.password.length < 8) {
    return next(new AppError('A password must have 8 characters or more', 400));
  }
  next();
});
app.use(xss());
app.use(
  hpp({
    whitelist: ['price', 'priceDiscount', 'category', 'seller', 'name', 'postedDate'],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const ensureDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
};

app.use('/api', ensureDatabaseConnection);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);

const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
