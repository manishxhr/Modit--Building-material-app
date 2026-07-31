import Link from 'next/link';
import Nav from './components/Nav';
import { brand, categories, testimonials, faqs } from './components/modit-data';

const featuredSuppliers = [
  { name: 'MetroBuild Supply', zone: 'Gurugram', rating: '4.9', eta: '24 hrs', badge: 'GST Verified' },
  { name: 'NCR Material Hub', zone: 'Noida', rating: '4.8', eta: '36 hrs', badge: 'Top Value' },
  { name: 'Delhi ProBuild', zone: 'Delhi', rating: '4.7', eta: '48 hrs', badge: 'Architect Choice' }
];

const trending = [
  { name: 'UltraBuild OPC 43 Cement', price: '365/bag', trend: '+3.2%' },
  { name: 'Fe500D TMT Steel', price: '72,100/tonne', trend: '+1.1%' },
  { name: 'Washed M-Sand', price: '11,200/truck', trend: '-0.8%' },
  { name: 'CPVC Plumbing Kit', price: '8,450/set', trend: '+2.5%' }
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="page">
        <section className="hero-grid">
          <article className="glass-card hero-main">
            <p className="eyebrow">Delhi NCR Building Material Marketplace</p>
            <h1 className="headline">{brand.name}<br />{brand.tagline}</h1>
            <p>
              MODIT helps home owners, contractors, builders, architects, retailers and suppliers discover, compare,
              order and manage building materials through one AI-first platform.
            </p>
            <div className="action-row">
              <Link href="/dashboard" className="button primary">Open Home Dashboard</Link>
              <Link href="/rfq" className="button">Request Quotation</Link>
              <Link href="/ai" className="button">Launch Agentic AI</Link>
            </div>
            <div className="search-box" style={{ marginTop: '14px' }}>
              <span className="badge">Global Search</span>
              <input placeholder="Search cement, steel, sanitary, tools, suppliers, projects..." />
            </div>
            <div className="hero-metrics">
              <div className="metric"><b>1,200+</b><span>Verified suppliers</span></div>
              <div className="metric"><b>18</b><span>Delhi NCR zones</span></div>
              <div className="metric"><b>12 min</b><span>Avg quote turnaround</span></div>
            </div>
          </article>

          <aside className="glass-card hero-aside">
            <div className="list-tile">
              <p className="eyebrow">How it works</p>
              <h3>Search to Compare to RFQ to Order to Track</h3>
              <p className="muted">Unified procurement flow with GST-ready records and business payment workflows.</p>
            </div>
            <div className="list-tile">
              <p className="eyebrow">AI Highlights</p>
              <ul>
                <li>BOQ reader and material planner</li>
                <li>Quote comparison and negotiation support</li>
                <li>Supplier matching by location and SLA</li>
                <li>Voice ordering and smart reorders</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Popular Categories</h2>
            <Link href="/categories" className="badge">View all</Link>
          </div>
          <div className="grid-4">
            {categories.slice(0, 12).map((item) => (
              <article key={item.key} className="category-card">
                <div className="category-top">
                  <span className="icon-pill">{item.icon}</span>
                  <span className="badge">Live</span>
                </div>
                <h4 style={{ marginTop: '12px' }}>{item.name}</h4>
                <p className="muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section grid-2">
          <div>
            <div className="section-header"><h2>Featured Suppliers</h2></div>
            <div className="grid-3">
              {featuredSuppliers.map((supplier) => (
                <article key={supplier.name} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p className="muted">{supplier.zone} � Rating {supplier.rating}</p>
                  <p className="muted">Delivery {supplier.eta}</p>
                  <span className="badge">{supplier.badge}</span>
                </article>
              ))}
            </div>
          </div>
          <div>
            <div className="section-header"><h2>Trending Materials</h2></div>
            <div className="timeline">
              {trending.map((item) => (
                <article key={item.name} className="timeline-step">
                  <div>
                    <b>{item.name}</b>
                    <p className="muted" style={{ margin: '4px 0 0' }}>{item.price}</p>
                  </div>
                  <span className="badge">{item.trend}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>Why MODIT</h2></div>
          <div className="grid-4">
            <article className="info-card"><h4>Real-time Discovery</h4><p className="muted">Find materials, suppliers, ETA and MOQ instantly with global search and smart filters.</p></article>
            <article className="info-card"><h4>Price Intelligence</h4><p className="muted">Compare supplier pricing, GST impact and discounts in a single procurement matrix.</p></article>
            <article className="info-card"><h4>Agentic AI</h4><p className="muted">Generate RFQs, read BOQ, negotiate offers, track orders and schedule repeat procurement.</p></article>
            <article className="info-card"><h4>Operational Control</h4><p className="muted">Dashboard views for buyers, suppliers and admins with clean workflow transparency.</p></article>
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>How It Works</h2></div>
          <div className="kpi-strip">
            <div className="kpi"><b>01</b><span>Search materials or upload BOQ</span></div>
            <div className="kpi"><b>02</b><span>Shortlist verified suppliers</span></div>
            <div className="kpi"><b>03</b><span>Request and compare quotes</span></div>
            <div className="kpi"><b>04</b><span>Confirm order and payment plan</span></div>
            <div className="kpi"><b>05</b><span>Track delivery and reorder smartly</span></div>
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>Testimonials</h2></div>
          <div className="grid-3">
            {testimonials.map((item) => (
              <article key={item.name} className="info-card">
                <p>"{item.quote}"</p>
                <h4>{item.name}</h4>
                <p className="muted">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>FAQs</h2></div>
          <div className="grid-2">
            {faqs.map((item) => (
              <article key={item.q} className="info-card">
                <h4>{item.q}</h4>
                <p className="muted">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div className="grid-3">
            <div>
              <h4>MODIT</h4>
              <p className="muted">Build Smarter. Source Faster.</p>
            </div>
            <div>
              <h4>Platform</h4>
              <p className="muted">Materials � Suppliers � RFQ � Orders � AI Workspace</p>
            </div>
            <div>
              <h4>Coverage</h4>
              <p className="muted">Delhi � Gurugram � Noida � Faridabad � Ghaziabad � Greater Noida</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
