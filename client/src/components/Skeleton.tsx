import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'soft';
};

export function Skeleton({ className, tone = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cx('skeleton', tone === 'soft' && 'skeleton-soft', className)}
      role="presentation"
      {...props}
    />
  );
}
