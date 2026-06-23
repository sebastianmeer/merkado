import { Skeleton } from '../../../components/Skeleton';

export function ProfileField({ label }: { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <Skeleton className="input-skeleton" />
    </label>
  );
}
