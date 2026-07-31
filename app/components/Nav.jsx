'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brand } from './modit-data';

const tabs = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/dashboard', label: 'Dashboard', icon: '◫' },
  { href: '/catalog', label: 'Materials', icon: '▦' },
  { href: '/ai', label: 'AI', icon: '✦' },
  { href: '/orders', label: 'Orders', icon: '▤' },
];

function getMobileActions(pathname) {
  if (pathname.startsWith('/ai')) {
    return [
      { href: '/rfq', label: 'Generate RFQ', primary: true },
      { href: '/orders', label: 'Track Orders' }
    ];
  }

  if (pathname.startsWith('/orders')) {
    return [
      { href: '/cart', label: 'Go To Cart', primary: true },
      { href: '/dashboard', label: 'Control Center' }
    ];
  }

  if (pathname.startsWith('/dashboard')) {
    return [
      { href: '/comparison', label: 'Compare Prices', primary: true },
      { href: '/vendors', label: 'Supplier Map' }
    ];
  }

  if (pathname.startsWith('/vendors') || pathname.startsWith('/comparison')) {
    return [
      { href: '/suppliers', label: 'Onboard Supplier', primary: true },
      { href: '/rfq', label: 'Request Quote' }
    ];
  }

  if (pathname.startsWith('/catalog') || pathname.startsWith('/categories')) {
    return [
      { href: '/rfq', label: 'Request Quote', primary: true },
      { href: '/comparison', label: 'Compare Prices' }
    ];
  }

  if (pathname.startsWith('/suppliers') || pathname.startsWith('/profile')) {
    return [
      { href: '/dashboard', label: 'Supplier Dashboard', primary: true },
      { href: '/admin', label: 'Admin View' }
    ];
  }

  return [
    { href: '/ai', label: 'Start AI Run', primary: true },
    { href: '/dashboard', label: 'Open Dashboard' }
  ];
}

export default function Nav(){
  const pathname = usePathname();
  const mobileActions = getMobileActions(pathname);
  return <>
    <header className="site-header">
      <nav className="site-nav">
        <Link className="brand" href="/">
          <span className="brand-icon">M</span>
          <span>
            {brand.name}
            <small>{brand.tagline}</small>
          </span>
        </Link>
        <div className="navlinks">
          <Link href="/dashboard" className={pathname.startsWith('/dashboard') ? 'active' : ''}>Dashboard</Link>
          <Link href="/categories" className={pathname.startsWith('/categories') ? 'active' : ''}>Categories</Link>
          <Link href="/catalog" className={pathname.startsWith('/catalog') ? 'active' : ''}>Products</Link>
          <Link href="/vendors" className={pathname.startsWith('/vendors') ? 'active' : ''}>Suppliers</Link>
          <Link href="/comparison" className={pathname.startsWith('/comparison') ? 'active' : ''}>Compare</Link>
        </div>
        <div className="nav-right">
          <Link className="search-trigger" href="/catalog" aria-label="Open global search">Search Materials (Ctrl+K)</Link>
          <Link className="cta" href="/ai">AI Workspace</Link>
        </div>
      </nav>
    </header>
    <div className="mobile-action-dock" aria-label="Mobile quick actions">
      {mobileActions.map((action) => {
        const active = action.href === '/' ? pathname === '/' : pathname.startsWith(action.href);
        return (
          <Link
            key={action.href}
            href={action.href}
            className={
              'mobile-action' +
              (action.primary ? ' mobile-control-primary' : '') +
              (active ? ' mobile-control-active' : '')
            }
          >
            {action.label}
          </Link>
        );
      })}
    </div>
    <nav className="mobile-tabbar" aria-label="Primary">
      {tabs.map(t => {
        const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={'tabbtn' + (active ? ' active' : '')}>
            <span className="tabicon">{t.icon}</span>
            <span className="tablabel">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  </>
}
