'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const commands = [
  { id: 'home', label: 'Go to Home', href: '/', section: 'Navigation' },
  { id: 'dashboard', label: 'Open Dashboard', href: '/dashboard', section: 'Navigation' },
  { id: 'catalog', label: 'Search Materials', href: '/catalog', section: 'Discovery' },
  { id: 'solutions', label: 'Open Role Workflows', href: '/solutions', section: 'Discovery' },
  { id: 'cart', label: 'Open Cart and Checkout', href: '/cart', section: 'Procurement' },
  { id: 'categories', label: 'Browse Categories', href: '/categories', section: 'Discovery' },
  { id: 'comparison', label: 'Compare Supplier Quotes', href: '/comparison', section: 'Procurement' },
  { id: 'rfq', label: 'Generate RFQ', href: '/rfq', section: 'Procurement' },
  { id: 'orders', label: 'Track Orders', href: '/orders', section: 'Operations' },
  { id: 'vendors', label: 'Supplier Map', href: '/vendors', section: 'Operations' },
  { id: 'ai', label: 'Open MODIT AI Workspace', href: '/ai', section: 'MODIT AI' },
  { id: 'ai-drawer-planner', label: 'Open Floating MODIT AI Planner', section: 'MODIT AI', action: { type: 'ai-drawer', mode: 'planner', query: 'Generate procurement plan for Delhi commercial project' } },
  { id: 'ai-drawer-quotes', label: 'Open Floating Quote Analyst', section: 'MODIT AI', action: { type: 'ai-drawer', mode: 'quotes', query: 'Compare top 3 cement suppliers in Noida' } },
  { id: 'shortcut-rfq', label: 'RFQ Shortcut: Launch with BOQ intent', href: '/rfq', section: 'Procurement', action: { type: 'toast', message: 'RFQ shortcut loaded. Paste BOQ and generate quotes.' } },
  { id: 'suppliers', label: 'Supplier Onboarding', href: '/suppliers', section: 'Supplier OS' },
  { id: 'admin', label: 'Admin Dashboard', href: '/admin', section: 'Admin' }
];

function runCommand(item, router, close) {
  if (item.action?.type === 'ai-drawer' && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('modit:ai-open', { detail: { mode: item.action.mode, query: item.action.query } }));
  }

  if (item.action?.type === 'toast' && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('modit:toast', { detail: { message: item.action.message, tone: 'info' } }));
  }

  if (item.href) router.push(item.href);
  close();
}

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? commands.filter((item) => (item.label + ' ' + item.section).toLowerCase().includes(q))
      : commands;
  }, [query]);

  useEffect(() => {
    function onKeyDown(event) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const hotkey = isMac ? event.metaKey : event.ctrlKey;
      if (hotkey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((state) => !state);
        return;
      }
      if (!open) return;
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((value) => Math.min(value + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((value) => Math.max(value - 1, 0));
      }
      if (event.key === 'Enter' && filtered[cursor]) {
        event.preventDefault();
        runCommand(filtered[cursor], router, () => setOpen(false));
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, cursor, router]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCursor(0);
  }, [open, pathname]);

  if (!open) return null;

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="cmd-panel">
        <div className="cmd-header">
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            placeholder="Search actions, pages, workflows..."
            aria-label="Search commands"
          />
          <button type="button" className="button" onClick={() => setOpen(false)}>Close</button>
        </div>
        <div className="cmd-list">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={'cmd-item' + (index === cursor ? ' cmd-item-active' : '')}
              onClick={() => {
                runCommand(item, router, () => setOpen(false));
              }}
            >
              <span>{item.label}</span>
              <small>{item.section}</small>
            </button>
          ))}
          {filtered.length === 0 && <p className="muted" style={{ margin: 0 }}>No matching commands.</p>}
        </div>
      </div>
    </div>
  );
}
