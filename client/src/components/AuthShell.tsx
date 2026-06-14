import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { authNav } from '../data';
import { Skeleton } from './Skeleton';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-summary">{description}</p>

        <div className="auth-highlights" aria-hidden="true">
          <article className="mini-surface">
            <span>Seller queue</span>
            <Skeleton className="line line-lg" />
            <Skeleton className="line" />
          </article>
          <article className="mini-surface">
            <span>Account state</span>
            <Skeleton className="line line-md" />
            <Skeleton className="line" />
          </article>
        </div>

        <div className="auth-links-row">
          {authNav.map((item) => (
            <Link key={item.to} to={item.to} className={item.tone === 'accent' ? 'text-link text-link-accent' : 'text-link'}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="auth-card">{children}</section>
    </main>
  );
}
