import { marketplaceMetrics, listingCards } from '../data';
import { Skeleton } from '../components/Skeleton';

function MetricSkeleton() {
  return (
    <article className="metric-card metric-card-skeleton">
      <Skeleton className="line line-sm" />
      <Skeleton className="line line-xl" />
      <Skeleton className="line" />
    </article>
  );
}

function ListingSkeleton({ index }: { index: number }) {
  return (
    <article className="listing-card listing-card-skeleton">
      <Skeleton className="listing-image-skeleton" />
      <div className="listing-card-body">
        <div className="listing-card-head">
          <Skeleton className="pill" />
          <Skeleton className="pill pill-wide" />
        </div>
        <Skeleton className="line line-lg" />
        <Skeleton className="line" />
        <Skeleton className="line line-short" />
        <div className="listing-card-foot">
          <Skeleton className="pill pill-xl" />
          <Skeleton className="button-skeleton button-skeleton-small" aria-label={`loading action ${index + 1}`} />
        </div>
      </div>
    </article>
  );
}

const statusToneMap: Record<string, string> = {
  Live: 'status-chip-live',
  Queued: 'status-chip-queued',
  Draft: 'status-chip-draft',
};

export function ProductsPage() {
  return (
    <div className="page-stack">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Browse</p>
          <h2>Marketplace products</h2>
          <p className="page-lead">
            The production data layer can slot in later. For now, this is a polished skeleton for product discovery,
            cards, and detail handling.
          </p>
        </div>
        <div className="hero-actions" aria-hidden="true">
          <Skeleton className="input-skeleton" />
          <Skeleton className="input-skeleton input-skeleton-wide" />
        </div>
      </header>

      <section className="metric-grid" aria-label="Marketplace summary">
        {marketplaceMetrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <span className="metric-label">{metric.label}</span>
            <strong className="metric-value">{metric.value}</strong>
            <small className="metric-detail">{metric.detail}</small>
          </article>
        ))}
        <MetricSkeleton />
      </section>

      <section className="content-grid">
        <div className="content-stack">
          <div className="section-header">
            <div>
              <p className="eyebrow">Listings</p>
              <h3>Featured inventory</h3>
            </div>
            <span className="status-chip status-chip-warm">Loading flow</span>
          </div>

          <div className="listing-grid">
            {listingCards.map((listing) => (
              <article key={listing.title} className="listing-card">
                <div className="listing-image-placeholder" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="listing-card-body">
                  <div className="listing-card-head">
                    <span className={`status-chip ${statusToneMap[listing.status] || ''}`}>{listing.status}</span>
                    <span className="meta-chip">{listing.category}</span>
                  </div>
                  <h4>{listing.title}</h4>
                  <p>{listing.summary}</p>
                  <div className="listing-card-foot">
                    <strong>{listing.price}</strong>
                    <span>{listing.seller}</span>
                  </div>
                </div>
              </article>
            ))}
            <ListingSkeleton index={0} />
            <ListingSkeleton index={1} />
            <ListingSkeleton index={2} />
          </div>
        </div>

        <aside className="side-stack">
          <section className="panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Preview</p>
                <h3>Detail panel</h3>
              </div>
            </div>

            <div className="detail-skeleton" aria-hidden="true">
              <Skeleton className="media-skeleton" />
              <Skeleton className="line line-xl" />
              <Skeleton className="line" />
              <Skeleton className="line line-md" />
              <div className="detail-pair-grid">
                <Skeleton className="tile-skeleton" />
                <Skeleton className="tile-skeleton" />
                <Skeleton className="tile-skeleton" />
                <Skeleton className="tile-skeleton" />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Activity</p>
                <h3>Recent updates</h3>
              </div>
            </div>

            <ul className="activity-list" aria-hidden="true">
              <li>
                <Skeleton className="avatar-skeleton" />
                <div>
                  <Skeleton className="line line-sm" />
                  <Skeleton className="line" />
                </div>
              </li>
              <li>
                <Skeleton className="avatar-skeleton" />
                <div>
                  <Skeleton className="line line-sm" />
                  <Skeleton className="line" />
                </div>
              </li>
              <li>
                <Skeleton className="avatar-skeleton" />
                <div>
                  <Skeleton className="line line-sm" />
                  <Skeleton className="line" />
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
