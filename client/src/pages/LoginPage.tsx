import { Link } from 'react-router-dom';
import { authFields } from '../data';
import { AuthShell } from '../components/AuthShell';
import { Skeleton } from '../components/Skeleton';

export function LoginPage() {
  return (
    <AuthShell
      eyebrow="Access"
      title="Sign in to the marketplace."
      description="This login screen is a polished skeleton for the auth stack. Form logic can land later without reworking the layout."
    >
      <div className="auth-form-shell" aria-hidden="true">
        <div className="auth-form-head">
          <Skeleton className="line line-lg" />
          <Skeleton className="line" />
        </div>
        {authFields.map((field) => (
          <label key={field.label} className="field">
            <span>{field.label}</span>
            {field.helper ? <small>{field.helper}</small> : null}
            <Skeleton className="input-skeleton" />
          </label>
        ))}
        <Skeleton className="button-skeleton button-skeleton-wide" />
      </div>

      <div className="auth-footer-row">
        <Link to="/signup" className="text-link">
          Create account
        </Link>
        <Link to="/reset-password" className="text-link">
          Forgot password
        </Link>
      </div>
    </AuthShell>
  );
}
