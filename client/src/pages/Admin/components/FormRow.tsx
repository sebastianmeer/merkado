import { Skeleton } from '../../../components/Skeleton';

export function FormRow({ label, helper }: { label: string; helper?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
      <Skeleton className="input-skeleton" />
    </label>
  );
}
