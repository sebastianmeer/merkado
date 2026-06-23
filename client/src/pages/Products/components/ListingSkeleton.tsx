import { Skeleton } from '../../../components/Skeleton';

export function ListingSkeleton({ index }: { index: number }) {
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
