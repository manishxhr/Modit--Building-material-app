'use client';

import { useEffect, useState } from 'react';
import Nav from '../components/Nav';

const cityList = ['Gurugram', 'Noida', 'Delhi', 'Faridabad', 'Ghaziabad', 'Greater Noida'];
const categoryList = ['Cement', 'Steel', 'Sand & Aggregate', 'Bricks & Blocks', 'Tiles & Finishes', 'Plumbing', 'Electrical'];

export default function VendorsPage() {
  const [dashboard, setDashboard] = useState(null);
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

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runMatch}>
            <h3>AI Vendor Match</h3>
            <div className="form-field"><label>City</label><select name="city"><option value="">Any</option>{cityList.map((city) => <option key={city}>{city}</option>)}</select></div>
            <div className="form-field"><label>Category</label><select name="category"><option value="">Any</option>{categoryList.map((cat) => <option key={cat}>{cat}</option>)}</select></div>
            <div className="grid-2">
              <div className="form-field"><label>Max Lead Time</label><input type="number" name="maxLeadTime" defaultValue="48" /></div>
              <div className="form-field"><label>Min Quality</label><select name="quality"><option value="">Any</option><option value="A">A</option><option value="A+">A+</option></select></div>
            </div>
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
