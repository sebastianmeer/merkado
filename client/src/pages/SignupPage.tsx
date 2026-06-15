import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { Skeleton } from '../components/Skeleton';

export function SignupPage() {
  return (
    <AuthShell
      eyebrow="Create access"
      title="Open a marketplace account."
      description="The signup experience is already split into a clear information column and a form card."
    >
      <div className="auth-form-shell" aria-hidden="true">
        <div className="auth-form-head">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-subtitle">Fill in the details below to get started</p>
        </div>
        <label className="field">
          <span>Name</span>
          <Skeleton className="input-skeleton" />
        </label>
        <label className="field">
          <span>Email</span>
          <Skeleton className="input-skeleton" />
        </label>
        <label className="field">
          <span>Role</span>
          <Skeleton className="input-skeleton" />
        </label>
        <label className="field">
          <span>Password</span>
          <Skeleton className="input-skeleton" />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <Skeleton className="input-skeleton" />
        </label>
        <Skeleton className="button-skeleton button-skeleton-wide" />
      </div>

      <div className="auth-footer-row">
        <Link to="/login" className="text-link">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
