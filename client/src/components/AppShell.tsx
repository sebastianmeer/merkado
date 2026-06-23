import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { marketNav } from '../data';
import { cx } from '../utils/cx';
import type { NavItem } from '../types';

type AppShellProps = {
  title: string;
  subtitle: string;
  nav?: NavItem[];
};

const navIcons: Record<string, ReactNode> = {
  Products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Account: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

function ShellNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="shell-nav" aria-label="Primary">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cx('shell-nav-link', item.tone === 'accent' && 'shell-nav-link-accent', isActive && 'is-active')
          }
        >
          <span className="shell-nav-link-content">
            {navIcons[item.label] || null}
            <span>{item.label}</span>
          </span>
          <span className="shell-nav-link-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ title, subtitle, nav = marketNav }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">M</div>
          <div>
            <p className="eyebrow">Marketplace</p>
            <h1>Local Market</h1>
          </div>
        </div>

        <div className="sidebar-copy">
          <p className="sidebar-kicker">{title}</p>
          <p>{subtitle}</p>
        </div>

        <ShellNav items={nav} />

        <div className="sidebar-footer">
          <p className="eyebrow">System status</p>
          <strong>Skeleton UI ready</strong>
          <span>React + TypeScript shell</span>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
