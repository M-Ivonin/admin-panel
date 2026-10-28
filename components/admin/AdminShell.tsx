'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock,
  CreditCard,
  Flag,
  Gauge,
  Globe2,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './AdminShell.module.css';

const groups = [
  { label: '', items: [{ label: 'Overview', href: '/dashboard', icon: Home }] },
  {
    label: 'Analytics',
    items: [
      {
        label: 'App Events',
        href: '/dashboard/app-events-analytics',
        icon: BarChart3,
      },
      {
        label: 'Time in app',
        href: '/dashboard/time-in-app',
        icon: Clock,
      },
      {
        label: 'Onboarding',
        href: '/dashboard/onboarding-analytics',
        icon: ClipboardList,
      },
      {
        label: 'Home Analytics',
        href: '/dashboard/updated-home-analytics',
        icon: Gauge,
      },
      {
        label: 'Prediction Evaluation',
        href: '/dashboard/prediction-evaluations',
        icon: Target,
      },
      {
        label: 'Live Challenges',
        href: '/dashboard/live-challenges',
        icon: Trophy,
      },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Users', href: '/dashboard/users', icon: Users },
      { label: 'Policy outcomes', href: '/dashboard/user-experiments', icon: BarChart3 },
      {
        label: 'Revenue Ledger',
        href: '/dashboard/revenue-ledger',
        icon: CreditCard,
      },
      { label: 'Campaigns', href: '/dashboard/campaigns', icon: Flag },
      {
        label: 'Email Marketing',
        href: '/dashboard/email-marketing',
        icon: Mail,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'System Monitor',
        href: '/dashboard/system-monitor',
        icon: Activity,
      },
      { label: 'Support Tickets', href: '/support/tickets', icon: CircleHelp },
      {
        label: 'Remote Diagnostics',
        href: '/dashboard/remote-diagnostics',
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Home Banner', href: '/dashboard/home-banner', icon: Bell },
      {
        label: 'Partner Markets',
        href: '/dashboard/partner-markets',
        icon: Globe2,
      },
      {
        label: 'Match Ranking',
        href: '/dashboard/match-ranking',
        icon: Settings2,
      },
      { label: 'Bot Chat', href: '/dashboard/bot-chat', icon: MessageSquare },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={styles.shell}>
      <a href="#admin-content" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.mobileHeader}>
        <button
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link href="/dashboard">
          SirBro <span>Admin</span>
        </Link>
        <Bot size={20} />
      </div>
      {open && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="admin-sidebar"
        className={`${styles.sidebar} ${open ? styles.open : ''}`}
      >
        <Link href="/dashboard" className={styles.brand}>
          <Image src="/assets/brandmark.png" alt="" width={36} height={36} />
          <span>
            SirBro<small>ADMIN</small>
          </span>
        </Link>
        <nav aria-label="Admin navigation" className={styles.navigation}>
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              {group.label && (
                <div className={styles.groupLabel}>{group.label}</div>
              )}
              {group.items.map(({ label, href, icon: Icon }) => {
                const active =
                  href === '/dashboard'
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`${styles.navLink} ${active ? styles.active : ''}`}
                  >
                    <Icon size={18} strokeWidth={1.6} />
                    <span>{label}</span>
                    {active && (
                      <ChevronRight size={13} className={styles.activeArrow} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className={styles.account}>
          <div className={styles.identity}>
            <span className={styles.avatar}>
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </span>
            <span title={user?.email}>{user?.name || 'Administrator'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/admin-login');
            }}
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>
      <div id="admin-content" className={styles.content}>
        {children}
      </div>
    </div>
  );
}
