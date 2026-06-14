import type { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      _queryDefaults?: Record<string, string>;
      user?: Document & {
        _id: unknown;
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        photo?: string;
        password?: string;
        passwordConfirm?: string;
        passwordChangedAt?: Date;
        passwordResetToken?: string;
        passwordResetExpires?: Date;
        active?: boolean;
        correctPassword?: (candidatePassword: string, userPassword: string) => Promise<boolean>;
        changedPasswordAfter?: (JWTTimestamp: number) => boolean;
        createPasswordResetToken?: () => string;
      };
    }
  }
}

export {};
