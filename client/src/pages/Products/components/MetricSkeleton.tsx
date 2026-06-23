import { Skeleton } from '../../../components/Skeleton';

export function MetricSkeleton() {
  return (
    <article className="metric-card metric-card-skeleton">
      <Skeleton className="line line-sm" />
      <Skeleton className="line line-xl" />
      <Skeleton className="line" />
    </article>
  );
}
