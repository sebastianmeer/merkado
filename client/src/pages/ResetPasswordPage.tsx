import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { Skeleton } from '../components/Skeleton';

export function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Reset password flow."
      description="This layout is split for email capture and token reset so the eventual functionality has a clear home."
    >
      <div className="reset-grid" aria-hidden="true">
        <section className="auth-form-shell">
          <div className="auth-form-head">
            <Skeleton className="line line-lg" />
            <Skeleton className="line" />
          </div>
          <label className="field">
            <span>Email</span>
            <Skeleton className="input-skeleton" />
          </label>
          <Skeleton className="button-skeleton button-skeleton-wide" />
        </section>

        <section className="auth-form-shell">
          <div className="auth-form-head">
            <Skeleton className="line line-lg" />
            <Skeleton className="line" />
          </div>
          <label className="field">
            <span>Token</span>
            <Skeleton className="input-skeleton" />
          </label>
          <label className="field">
            <span>New password</span>
            <Skeleton className="input-skeleton" />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <Skeleton className="input-skeleton" />
          </label>
          <Skeleton className="button-skeleton button-skeleton-wide" />
        </section>
      </div>

      <div className="auth-footer-row">
        <Link to="/login" className="text-link">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
