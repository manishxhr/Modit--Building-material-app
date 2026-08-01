'use client';

import { useState } from 'react';
import Nav from '../components/Nav';
import { notifyToast } from '../components/ToastHost';

export default function SuppliersPage() {
  const [result, setResult] = useState(null);
  const [aiConsole, setAiConsole] = useState(null);

  async function loadConsole() {
    const data = await fetch('/api/dashboard').then((response) => response.json());
    setAiConsole(data);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setResult(data);
    notifyToast(response.ok ? 'Supplier profile submitted for verification.' : (data.error || 'Submission failed.'), response.ok ? 'success' : 'warn');
  }

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Supplier Onboarding</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Join the MODIT Marketplace</h1>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={submit}>
            <h3>Business Profile</h3>
            <div className="form-field"><label>Business Name</label><input name="name" required /></div>
            <div className="grid-2">
              <div className="form-field"><label>Primary City</label><select name="city"><option>Gurugram</option><option>Noida</option><option>Delhi</option><option>Faridabad</option><option>Ghaziabad</option><option>Greater Noida</option></select></div>
              <div className="form-field"><label>Dispatch SLA (hours)</label><input name="delivery" defaultValue="36" /></div>
            </div>
            <div className="form-field"><label>Contact</label><input name="contact" required /></div>
            <div className="form-field"><label>Categories</label><textarea name="categories" required placeholder="Cement, Steel, Tiles, Plumbing" /></div>
            <button className="button primary" type="submit">Submit Supplier Profile</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Verification Workflow</h3>
            <div className="timeline">
              <div className="timeline-step"><b>Step 1</b><span>Profile submission</span></div>
              <div className="timeline-step"><b>Step 2</b><span>GST and catalog validation</span></div>
              <div className="timeline-step"><b>Step 3</b><span>Coverage zone approval</span></div>
              <div className="timeline-step"><b>Step 4</b><span>RFQ lead activation</span></div>
            </div>
            {result && result.error && <p className="muted" style={{ marginTop: '12px' }}>{result.error}</p>}
            {result && result.supplier && (
              <article className="info-card" style={{ marginTop: '12px' }}>
                <h4>{result.supplier.name}</h4>
                <p className="muted">{result.message}</p>
              </article>
            )}
          </div>
        </section>

        <section className="section grid-2">
          <article className="glass-card" style={{ padding: '16px' }}>
            <div className="section-header">
              <h3>Supplier MODIT AI Console</h3>
              <button type="button" className="button" onClick={loadConsole}>Refresh AI Signals</button>
            </div>
            {!aiConsole && <p className="muted">Load AI signals to preview inventory demand, dynamic pricing and lead readiness.</p>}
            {aiConsole && (
              <div className="timeline">
                <div className="timeline-step"><b>Open RFQ Leads</b><span>{aiConsole.leads.length}</span></div>
                <div className="timeline-step"><b>Marketplace Orders</b><span>{aiConsole.orders.length}</span></div>
                <div className="timeline-step"><b>Active Suppliers</b><span>{aiConsole.suppliers.length}</span></div>
                <div className="timeline-step"><b>Demand Signals</b><span>{aiConsole.demandForecast.length}</span></div>
              </div>
            )}
          </article>

          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>AI Inventory and Pricing Suggestions</h3>
            {!aiConsole && <p className="muted">Use MODIT AI console to generate category-level prediction and pricing guidance.</p>}
            {aiConsole && (
              <div className="timeline">
                {aiConsole.demandForecast.slice(0, 5).map((item) => (
                  <div key={item.category} className="timeline-step">
                    <div>
                      <b>{item.category}</b>
                      <p className="muted" style={{ margin: '4px 0 0' }}>
                        AI suggests {item.change > 0 ? 'stock-up and optimize dispatch' : 'keep lean inventory and promo pricing'}
                      </p>
                    </div>
                    <span className="badge">{item.change > 0 ? '+' : ''}{item.change}% demand</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
