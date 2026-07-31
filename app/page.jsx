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

const userSegments = [
  'Home Owners',
  'Builders',
  'Contractors',
  'Architects',
  'Interior Designers',
  'Retailers',
  'Suppliers',
  'Project Managers'
];

const platformHighlights = [
  { title: 'Express Delivery Windows', text: 'Urgent dispatch slots with zone-based serviceability checks for Delhi NCR projects.' },
  { title: 'Transparent Price Grid', text: 'Supplier quotes with GST, MOQ, dispatch SLA and negotiated outcomes in one clean view.' },
  { title: 'Bulk and Pro Buying', text: 'Contractor and builder workflows for recurring procurement, site delivery and credit handling.' },
  { title: 'Verified Product Trust', text: 'Authentic brands, standardized specifications and procurement-ready product metadata.' }
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="page home-page">
        <section className="hero-grid">
          <article className="glass-card hero-main">
            <p className="eyebrow">Delhi NCR Building Material Marketplace</p>
            <h1 className="headline">{brand.name}<br />{brand.tagline}</h1>
            <p>
              MODIT helps teams discover, compare, order and track building materials with one AI-first workflow.
            </p>
            <div className="action-row">
              <Link href="/dashboard" className="button primary">Open Home Dashboard</Link>
              <Link href="/rfq" className="button">Request Quotation</Link>
              <Link href="/ai" className="button">Launch MODIT AI</Link>
            </div>
            <form className="search-box" style={{ marginTop: '14px' }} action="/catalog" method="get">
              <span className="badge">Global Search</span>
              <input name="q" placeholder="Search cement, steel, sanitary, tools, suppliers, projects..." />
              <button type="submit" className="button">Search</button>
            </form>
            <div className="hero-metrics">
              <div className="metric"><b>1,200+</b><span>Verified suppliers</span></div>
              <div className="metric"><b>18</b><span>Delhi NCR zones</span></div>
              <div className="metric"><b>12 min</b><span>Avg quote turnaround</span></div>
            </div>
            <div className="action-row" style={{ marginTop: '14px' }}>
              {userSegments.slice(0, 4).map((segment) => (
                <span key={segment} className="badge">{segment}</span>
              ))}
            </div>
          </article>

          <aside className="glass-card hero-aside">
            <div className="list-tile">
              <p className="eyebrow">How it works</p>
              <h3>Search to Compare to RFQ to Order to Track</h3>
              <p className="muted">One procurement flow with GST-ready records and payment controls.</p>
            </div>
            <div className="list-tile">
              <p className="eyebrow">Marketplace Highlights</p>
              <ul>
                <li>Express and scheduled delivery by zone</li>
                <li>Transparent pricing and multi-supplier comparison</li>
                <li>Bulk order support and contractor pricing tiers</li>
              </ul>
            </div>
            <div className="list-tile">
              <p className="eyebrow">AI Highlights</p>
              <ul>
                <li>BOQ reader and material planner</li>
                <li>Quote comparison and negotiation support</li>
                <li>Supplier matching by location and SLA</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="section section-categories">
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

        <section className="section section-priority-actions">
          <div className="section-header"><h2>Start Fast</h2></div>
          <div className="grid-2">
            <article className="info-card">
              <h4>Need Quotes Quickly?</h4>
              <p className="muted">Launch RFQ and get supplier responses with pricing, ETA and GST details.</p>
              <div className="action-row"><Link href="/rfq" className="button primary">Create RFQ</Link></div>
            </article>
            <article className="info-card">
              <h4>Use MODIT AI</h4>
              <p className="muted">Use MODIT AI to parse BOQ, match suppliers and propose procurement plans.</p>
              <div className="action-row"><Link href="/ai" className="button">Open MODIT AI Workspace</Link></div>
            </article>
          </div>
        </section>

        <section className="section grid-2 section-market-signals">
          <div>
            <div className="section-header"><h2>Featured Suppliers</h2></div>
            <div className="grid-3">
              {featuredSuppliers.map((supplier) => (
                <article key={supplier.name} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p className="muted">{supplier.zone} | Rating {supplier.rating}</p>
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

        <section className="section section-why-modit">
          <div className="section-header"><h2>Why MODIT</h2></div>
          <div className="grid-4">
            <article className="info-card"><h4>Real-time Discovery</h4><p className="muted">Find materials, suppliers, ETA and MOQ instantly with global search and smart filters.</p></article>
            <article className="info-card"><h4>Price Intelligence</h4><p className="muted">Compare supplier pricing, GST impact, MOQ and discounts in one procurement matrix.</p></article>
            <article className="info-card"><h4>Fast Delivery Playbooks</h4><p className="muted">Choose urgent or planned delivery windows with serviceability checks for Delhi NCR zones.</p></article>
            <article className="info-card"><h4>MODIT AI + Operational Control</h4><p className="muted">Generate RFQs, read BOQ, negotiate offers, track orders and run supplier/admin dashboards.</p></article>
          </div>
        </section>

        <section className="section section-marketplace-standards">
          <div className="section-header"><h2>Marketplace Standards</h2></div>
          <div className="grid-4">
            {platformHighlights.map((item) => (
              <article key={item.title} className="info-card">
                <h4>{item.title}</h4>
                <p className="muted">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-stakeholders">
          <div className="section-header"><h2>Built For Every Stakeholder</h2></div>
          <div className="grid-4">
            {userSegments.map((segment) => (
              <article key={segment} className="info-card">
                <h4>{segment}</h4>
                <p className="muted">Dedicated workflows for sourcing, approvals, deliveries and payment control.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-how-it-works">
          <div className="section-header"><h2>How It Works</h2></div>
          <div className="kpi-strip">
            <div className="kpi"><b>01</b><span>Search materials or upload BOQ</span></div>
            <div className="kpi"><b>02</b><span>Shortlist verified suppliers</span></div>
            <div className="kpi"><b>03</b><span>Request and compare quotes</span></div>
            <div className="kpi"><b>04</b><span>Confirm order and payment plan</span></div>
            <div className="kpi"><b>05</b><span>Track delivery and reorder smartly</span></div>
          </div>
        </section>

        <section className="section section-testimonials">
          <div className="section-header"><h2>Testimonials</h2></div>
          <div className="grid-3">
            {testimonials.map((item) => (
              <article key={item.name} className="info-card">
                <p>&quot;{item.quote}&quot;</p>
                <h4>{item.name}</h4>
                <p className="muted">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-faqs">
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
              <p className="muted">Materials • Suppliers • RFQ • Orders • MODIT AI Workspace</p>
              <div className="pill-links" style={{ marginTop: '10px' }}>
                <Link href="/categories" className="badge">Categories</Link>
                <Link href="/catalog" className="badge">Catalog</Link>
                <Link href="/comparison" className="badge">Comparison</Link>
                <Link href="/rfq" className="badge">RFQ</Link>
                <Link href="/orders" className="badge">Orders</Link>
                <Link href="/profile" className="badge">Profile</Link>
                <Link href="/suppliers" className="badge">Supplier Join</Link>
                <Link href="/admin" className="badge">Admin</Link>
              </div>
            </div>
            <div>
              <h4>Coverage</h4>
              <p className="muted">Delhi | Gurugram | Noida | Faridabad | Ghaziabad | Greater Noida</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
