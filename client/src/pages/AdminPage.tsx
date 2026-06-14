import { queueRows } from '../data';
import { Skeleton } from '../components/Skeleton';

function FormRow({ label, helper }: { label: string; helper?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
      <Skeleton className="input-skeleton" />
    </label>
  );
}

export function AdminPage() {
  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Product operations</h2>
          <p className="page-lead">
            This page is laid out for create, review, and moderation workflows. The controls are rendered as skeletons
            now so the structure is ready for real data later.
          </p>
        </div>
        <span className="status-chip status-chip-cool">Draft workflow</span>
      </header>

      <section className="split-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Create</p>
              <h3>New product form</h3>
            </div>
          </div>

          <div className="form-skeleton-grid" aria-hidden="true">
            <FormRow label="Name" />
            <FormRow label="Seller" />
            <FormRow label="Category" helper="Select a listing category." />
            <FormRow label="Price" />
            <FormRow label="Discount" />
            <FormRow label="Published date" />
            <label className="field field-wide">
              <span>Description</span>
              <Skeleton className="textarea-skeleton" />
            </label>
            <div className="toggle-row">
              <Skeleton className="toggle-skeleton" />
              <Skeleton className="line line-sm" />
            </div>
            <Skeleton className="button-skeleton button-skeleton-wide" />
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Queue</p>
              <h3>Approval list</h3>
            </div>
          </div>

          <div className="table-stack">
            {queueRows.map((row) => (
              <article key={row.title} className="queue-row">
                <div>
                  <strong>{row.title}</strong>
                  <span>{row.owner}</span>
                </div>
                <div>
                  <span className="meta-chip">{row.stage}</span>
                  <small>{row.time}</small>
                </div>
              </article>
            ))}

            <article className="queue-row queue-row-skeleton" aria-hidden="true">
              <div>
                <Skeleton className="line line-md" />
                <Skeleton className="line" />
              </div>
              <div>
                <Skeleton className="pill pill-wide" />
                <Skeleton className="line line-sm" />
              </div>
            </article>
            <article className="queue-row queue-row-skeleton" aria-hidden="true">
              <div>
                <Skeleton className="line line-md" />
                <Skeleton className="line" />
              </div>
              <div>
                <Skeleton className="pill pill-wide" />
                <Skeleton className="line line-sm" />
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  );
}
