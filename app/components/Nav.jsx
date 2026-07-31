'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/catalog', label: 'Materials', icon: '▦' },
  { href: '/ai', label: 'AI Copilot', icon: '✦' },
  { href: '/orders', label: 'Orders', icon: '▤' },
  { href: '/dashboard', label: 'Supplier OS', icon: '⌘' },
];

export default function Nav(){
  const pathname = usePathname();
  return <>
    <header>
      <nav>
        <Link className="brand" href="/"><b>▮▯▮</b> MODIT <small>PROCUREMENT OS</small></Link>
        <div className="navlinks">
          <Link href="/catalog">Materials</Link>
          <Link href="/ai">AI Copilot</Link>
          <Link href="/orders">Track orders</Link>
          <Link href="/dashboard">Supplier OS</Link>
        </div>
        <Link className="cta" href="/suppliers">Join as supplier →</Link>
      </nav>
    </header>
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
