'use client';

import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { categories } from '../components/modit-data';
import NcrCoverageMap from '../components/NcrCoverageMap';

const cityList = ['Gurugram', 'Noida', 'Delhi', 'Faridabad', 'Ghaziabad', 'Greater Noida'];
const categoryList = categories.map((item) => item.name);
const bootSuppliers = [
  { id: 1, name: 'MetroBuild Supply', city: 'Gurugram', rating: 4.9, delivery: 24, quality: 'A+', focus: 'Cement, steel and structural material' },
  { id: 2, name: 'NCR Material Hub', city: 'Noida', rating: 4.8, delivery: 36, quality: 'A', focus: 'Bulk contractor pricing and core shell packages' },
  { id: 3, name: 'Delhi ProBuild', city: 'Delhi', rating: 4.7, delivery: 48, quality: 'A', focus: 'Finishes, architectural and facade packages' },
  { id: 4, name: 'Axis Construction Exchange', city: 'Faridabad', rating: 4.6, delivery: 30, quality: 'A', focus: 'Multi-site procurement and jobsite tools' },
  { id: 5, name: 'Ghaziabad Build Depot', city: 'Ghaziabad', rating: 4.5, delivery: 40, quality: 'A', focus: 'Warehouse-led MEP and civil supply' },
  { id: 6, name: 'Greater Noida Supply Co.', city: 'Greater Noida', rating: 4.4, delivery: 44, quality: 'B+', focus: 'Township and infrastructure fulfillment' }
];

export default function VendorsPage() {
  const [dashboard, setDashboard] = useState({ suppliers: bootSuppliers });
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard').then((response) => response.json()).then(setDashboard);
  }, []);

  async function runMatch(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const data = await fetch('/api/vendors/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((response) => response.json());
    setMatches(data);
  }

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Delhi NCR Supplier Map</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Verified Supplier Network and Matching</h1>

        <section className="section">
          <div className="grid-3">
            {cityList.map((city) => {
              const count = dashboard ? dashboard.suppliers.filter((supplier) => supplier.city === city).length : 0;
              return <article key={city} className="supplier-card"><h4>{city}</h4><p className="muted">{count} suppliers</p><span className="badge">Coverage zone</span></article>;
            })}
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>Delhi NCR Supply Map</h2><span className="badge">Pinned zones</span></div>
          <NcrCoverageMap suppliers={dashboard?.suppliers || bootSuppliers} />
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runMatch}>
            <h3>AI Vendor Match</h3>
            <div className="form-field"><label>City</label><select name="city"><option value="">Any</option>{cityList.map((city) => <option key={city}>{city}</option>)}</select></div>
            <div className="form-field"><label>Category</label><select name="category"><option value="">Any</option>{categoryList.map((cat) => <option key={cat}>{cat}</option>)}</select></div>
            <div className="grid-2">
              <div className="form-field"><label>Max Lead Time</label><input type="number" name="maxLeadTime" defaultValue="48" /></div>
              <div className="form-field"><label>Min Quality</label><select name="quality"><option value="">Any</option><option value="A">A</option><option value="A+">A+</option></select></div>
            </div>
            <div className="form-field"><label>Quantity</label><input type="number" name="quantity" defaultValue="100" min="1" /></div>
            <button className="button primary" type="submit">Find Matches</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Match Results</h3>
            {!matches && <p className="muted">Run the matching engine to rank suppliers by city, quality and dispatch SLA.</p>}
            {matches && matches.matches.length === 0 && <p className="muted">No suppliers matched your criteria.</p>}
            {matches && matches.matches.length > 0 && (
              <div className="timeline">
                {matches.matches.map((supplier) => (
                  <div key={supplier.id} className="timeline-step">
                    <div>
                      <b>{supplier.name}</b>
                      <p className="muted" style={{ margin: '4px 0 0' }}>{supplier.city} - {supplier.focus}</p>
                      <p className="muted" style={{ margin: '4px 0 0' }}>
                        Est. Rs {supplier.pricePerUnit?.toLocaleString('en-IN')} / unit | Total Rs {supplier.expectedTotal?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="badge">{supplier.matchScore}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
