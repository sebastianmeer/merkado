import { Skeleton } from '../components/Skeleton';

function ProfileField({ label }: { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <Skeleton className="input-skeleton" />
    </label>
  );
}

export function ProfilePage() {
  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Account</p>
          <h2>Profile and settings</h2>
          <p className="page-lead">
            The account area is designed for profile updates, password changes, and deletion flow confirmation.
          </p>
        </div>
        <span className="status-chip">Personal space</span>
      </header>

      <section className="split-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Identity</p>
              <h3>Profile details</h3>
            </div>
          </div>

          <div className="profile-stack" aria-hidden="true">
            <div className="profile-banner">
              <div className="profile-avatar-wrapper">
                <Skeleton className="avatar-skeleton avatar-skeleton-xl" />
              </div>
              <div className="profile-banner-info">
                <Skeleton className="line line-lg" />
                <Skeleton className="line" />
              </div>
            </div>
            <ProfileField label="Name" />
            <ProfileField label="Email" />
            <ProfileField label="Photo" />
            <Skeleton className="button-skeleton button-skeleton-wide" />
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Security</p>
              <h3>Password and account</h3>
            </div>
          </div>

          <div className="profile-stack" aria-hidden="true">
            <ProfileField label="Current password" />
            <ProfileField label="New password" />
            <ProfileField label="Confirm password" />
            <Skeleton className="button-skeleton button-skeleton-wide" />
          </div>

          <div className="danger-note">
            <div className="danger-note-content">
              <h4>Delete account</h4>
              <p>Space reserved for the destructive confirmation flow.</p>
            </div>
            <Skeleton className="button-skeleton button-skeleton-small" />
          </div>
        </section>
      </section>
    </div>
  );
}
