import { NavLink, Outlet } from 'react-router-dom';
import { marketNav } from '../data';
import { cx } from '../lib/cx';
import type { NavItem } from '../types';

type AppShellProps = {
  title: string;
  subtitle: string;
  nav?: NavItem[];
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
          <span>{item.label}</span>
          <span className="shell-nav-link-arrow">→</span>
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
          <div className="brand-mark">M</div>
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
