'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/catalog', label: 'Materials', icon: '▦' },
  { href: '/ai', label: 'AI Copilot', icon: '✦' },
  { href: '/vendors', label: 'Vendors', icon: '⌖' },
  { href: '/orders', label: 'Orders', icon: '▤' },
];

function getMobileActions(pathname) {
  if (pathname.startsWith('/ai')) {
    return [
      { href: '/orders', label: 'Track active orders', primary: true },
      { href: '/vendors', label: 'Match vendors' }
    ];
  }

  if (pathname.startsWith('/orders')) {
    return [
      { href: '/ai', label: 'Start new procurement', primary: true },
      { href: '/dashboard', label: 'Open control center' }
    ];
  }

  if (pathname.startsWith('/vendors')) {
    return [
      { href: '/ai', label: 'Run AI comparison', primary: true },
      { href: '/suppliers', label: 'Add supplier' }
    ];
  }

  if (pathname.startsWith('/catalog')) {
    return [
      { href: '/ai', label: 'Build quote workflow', primary: true },
      { href: '/vendors', label: 'Find suppliers' }
    ];
  }

  if (pathname.startsWith('/dashboard')) {
    return [
      { href: '/orders', label: 'Track delivery', primary: true },
      { href: '/suppliers', label: 'Onboard supplier' }
    ];
  }

  if (pathname.startsWith('/suppliers')) {
    return [
      { href: '/dashboard', label: 'View supplier OS', primary: true },
      { href: '/vendors', label: 'See vendor map' }
    ];
  }

  return [
    { href: '/ai', label: 'Start procurement run', primary: true },
    { href: '/dashboard', label: 'Open control center' }
  ];
}

export default function Nav(){
  const pathname = usePathname();
  const mobileActions = getMobileActions(pathname);
  return <>
    <header>
      <nav>
        <Link className="brand" href="/"><b>▮▯▮</b> MODIT <small>PROCUREMENT OS</small></Link>
        <div className="navlinks">
          <Link href="/catalog">Materials</Link>
          <Link href="/ai">AI Copilot</Link>
          <Link href="/vendors">Vendors</Link>
          <Link href="/orders">Track orders</Link>
          <Link href="/dashboard">Supplier OS</Link>
        </div>
        <Link className="cta" href="/suppliers">Join as supplier →</Link>
      </nav>
    </header>
    <div className="mobile-control-center" aria-label="Mobile quick actions">
      {mobileActions.map((action) => {
        const active = action.href === '/' ? pathname === '/' : pathname.startsWith(action.href);
        return (
          <Link
            key={action.href}
            href={action.href}
            className={
              'mobile-control' +
              (action.primary ? ' mobile-control-primary' : '') +
              (active ? ' mobile-control-active' : '')
            }
          >
            {action.label}
          </Link>
        );
      })}
    </div>
    <nav className="tabbar" aria-label="Primary">
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
