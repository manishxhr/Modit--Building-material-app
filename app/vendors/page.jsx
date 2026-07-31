'use client';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';

const cities = ['Gurugram', 'Noida', 'Delhi', 'Faridabad', 'Ghaziabad', 'Greater Noida'];
const categories = ['Cement', 'Steel', 'Sand & Aggregate', 'Bricks & Blocks', 'Tiles & Finishes', 'Plumbing', 'Electrical', 'Plywood & Glass', 'Hardware'];

export default function Vendors() {
  const [suppliers, setSuppliers] = useState([]);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => setSuppliers(d.suppliers));
  }, []);

  const zones = cities.map(city => {
    const inZone = suppliers.filter(s => s.city === city);
    const avgRating = inZone.length ? (inZone.reduce((a, s) => a + s.rating, 0) / inZone.length).toFixed(1) : '—';
    const avgDelivery = inZone.length ? Math.round(inZone.reduce((a, s) => a + s.delivery, 0) / inZone.length) : '—';
    return { city, count: inZone.length, avgRating, avgDelivery };
  });

  async function match(e) {
    e.preventDefault();
    setLoading(true);
    setMatches(null);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/vendors/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setMatches(await r.json());
    setLoading(false);
  }

  return <>
    <Nav />
    <main className="app">
      <p className="eyebrow">DELHI NCR SUPPLIER MAP / AI VENDOR MATCHING</p>
      <h1>Every zone,<br /><i>one verified network.</i></h1>

      <div className="zonegrid">
        {zones.map(z => (
          <article key={z.city} className="zonecard">
            <b>{z.city}</b>
            <span className="chip">{z.count} supplier{z.count === 1 ? '' : 's'}</span>
            <div className="zonestats">
              <span>★ {z.avgRating} avg rating</span>
              <span>{z.avgDelivery === '—' ? '—' : `${z.avgDelivery}h`} avg dispatch</span>
            </div>
          </article>
        ))}
      </div>

      <section className="workflow" style={{ marginTop: 45 }}>
        <form onSubmit={match}>
          <p className="eyebrow">AI VENDOR MATCH ENGINE</p>
          <label>Delivery zone
            <select name="city"><option value="">Any zone</option>{cities.map(c => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Material category
            <select name="category"><option value="">Any category</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
          </label>
          <div className="twocol">
            <label>Max lead time (hrs)<input name="maxLeadTime" type="number" min="6" defaultValue="48" /></label>
            <label>Min quality grade
              <select name="quality"><option value="">Any grade</option><option value="A">A</option><option value="A+">A+</option></select>
            </label>
          </div>
          <button className="button primary">{loading ? 'Matching…' : 'Match vendors →'}</button>
        </form>
        <div className="results">
          {!matches && !loading && <div className="empty"><b>Ready to match.</b><p>Set your criteria to see ranked vendor recommendations.</p></div>}
          {loading && <div className="empty"><b>Scoring vendors…</b><p>Weighing rating, lead time and quality grade.</p></div>}
          {matches && (
            matches.matches.length === 0
              ? <div className="empty"><b>No vendors fit that criteria.</b><p>Try widening the lead time or zone.</p></div>
              : <><p className="eyebrow">RANKED MATCHES</p>
                <div className="offers">
                  {matches.matches.map(m => (
                    <article key={m.id}>
                      <div><b>{m.name}</b><small>{m.city} · {m.focus} · ★ {m.rating} · {m.delivery}h · Grade {m.quality}</small></div>
                      <strong>{m.matchScore}%</strong>
                      <span className="chip">match</span>
                    </article>
                  ))}
                </div></>
          )}
        </div>
      </section>
    </main>
  </>;
}
