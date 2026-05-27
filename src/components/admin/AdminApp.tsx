import { useUserProfile } from '../../contexts/ProfileContext';
import { useHashRoute, navigate } from '../../hooks/useHashRoute';
import { HomePanel } from './HomePanel';
import { TargetsPanel } from './TargetsPanel';
import { RestaurantsPanel } from './RestaurantsPanel';
import { SyncPanel } from './SyncPanel';
import { WebhooksPanel } from './WebhooksPanel';
import { EmployeesPanel } from './EmployeesPanel';
import { RatesPanel } from './RatesPanel';
import { CategoriesPanel } from './CategoriesPanel';
import { UsersPanel } from './UsersPanel';

type NavItem = { id: string; label: string; icon: string };

const NAV: NavItem[] = [
  { id: '', label: 'Overview', icon: '◳' },
  { id: 'targets', label: 'Targets', icon: '◎' },
  { id: 'restaurants', label: 'Restaurants', icon: '⌂' },
  { id: 'sync', label: 'Sync', icon: '↻' },
  { id: 'webhooks', label: 'Webhooks', icon: '⚇' },
  { id: 'employees', label: 'Employees', icon: '☻' },
  { id: 'rates', label: 'Pay rates', icon: '₭' },
  { id: 'categories', label: 'Categories', icon: '⊞' },
  { id: 'users', label: 'Users', icon: '⚿' },
];

function subRoute(route: string): string {
  if (route === 'admin') return '';
  return route.startsWith('admin/') ? route.slice('admin/'.length) : '';
}

function Panel({ id }: { id: string }) {
  switch (id) {
    case 'targets': return <TargetsPanel />;
    case 'restaurants': return <RestaurantsPanel />;
    case 'sync': return <SyncPanel />;
    case 'webhooks': return <WebhooksPanel />;
    case 'employees': return <EmployeesPanel />;
    case 'rates': return <RatesPanel />;
    case 'categories': return <CategoriesPanel />;
    case 'users': return <UsersPanel />;
    default: return <HomePanel />;
  }
}

export function AdminApp() {
  const profile = useUserProfile();
  const route = useHashRoute();
  const active = subRoute(route);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row">
      {/* Sidebar (desktop) / top bar (mobile) */}
      <aside className="md:w-[220px] md:min-h-screen border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--panel)] flex-shrink-0">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between"
             style={{ paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)' }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Cholon + Maven</div>
            <div className="text-[15px] font-semibold">Admin</div>
          </div>
          <button
            onClick={() => navigate('')}
            className="md:hidden text-[12px] text-[var(--accent)] font-medium"
          >
            ← Dashboard
          </button>
        </div>
        <nav className="flex md:flex-col gap-1 px-2 pb-2 overflow-x-auto">
          {NAV.map(item => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id ? `admin/${item.id}` : 'admin')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[var(--panel-2)] text-[var(--text)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--panel-2)]'
                }`}
              >
                <span className="text-[14px] opacity-80 w-4 text-center">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="hidden md:block px-4 py-3 mt-auto border-t border-[var(--border)]">
          <button onClick={() => navigate('')} className="text-[12px] text-[var(--accent)] font-medium">
            ← Back to dashboard
          </button>
          <div className="text-[11px] text-[var(--text-muted)] mt-2 truncate">{profile.full_name}</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 max-w-[1100px] w-full mx-auto">
        <Panel id={active} />
      </main>
    </div>
  );
}
