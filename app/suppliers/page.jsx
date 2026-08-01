'use client';

import { useState } from 'react';
import Nav from '../components/Nav';
import { notifyToast } from '../components/ToastHost';
import { categories } from '../components/modit-data';

export default function SuppliersPage() {
  const [result, setResult] = useState(null);
  const [aiConsole, setAiConsole] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [targetCategory, setTargetCategory] = useState('Cement');
  const [targetValue, setTargetValue] = useState('500');
  const [pricingMode, setPricingMode] = useState('balanced');
  const [leadStatus, setLeadStatus] = useState('Follow-up in progress');
  const [leadId, setLeadId] = useState('');

  async function loadConsole() {
    const query = supplierId ? '?supplierId=' + encodeURIComponent(supplierId) : '';
    const data = await fetch('/api/suppliers/ai' + query).then((response) => response.json());
    if (!data.error && data.supplier?.id) {
      setSupplierId(String(data.supplier.id));
      setPricingMode(data.pricingMode || 'balanced');
      if (data.leadPipeline?.[0]?.rfqId) setLeadId(data.leadPipeline[0].rfqId);
    }
    setAiConsole(data);
  }

  async function postAction(payload, successText) {
    const response = await fetch('/api/suppliers/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      notifyToast(data.error || 'Action failed.', 'warn');
      return;
    }
    setAiConsole(data);
    notifyToast(successText, 'success');
  }

  async function updateInventoryTarget() {
    await postAction({
      action: 'updateInventoryTarget',
      supplierId: Number(supplierId),
      category: targetCategory,
      target: Number(targetValue)
    }, 'Inventory target updated.');
  }

  async function updatePricingMode() {
    await postAction({
      action: 'updatePricingMode',
      supplierId: Number(supplierId),
      mode: pricingMode
    }, 'Pricing mode updated.');
  }

  async function updateLeadPipeline() {
    if (!leadId) {
      notifyToast('Select an RFQ lead first.', 'warn');
      return;
    }
    await postAction({
      action: 'updateLeadStatus',
      supplierId: Number(supplierId),
      rfqId: leadId,
      status: leadStatus
    }, 'Lead stage updated.');
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
              <button type="button" className="button" onClick={loadConsole}>Load Console</button>
            </div>
            <div className="form-field" style={{ marginTop: '8px' }}>
              <label>Supplier ID</label>
              <input value={supplierId} onChange={(event) => setSupplierId(event.target.value)} placeholder="Example: 1" />
            </div>
            {!aiConsole && <p className="muted">Load AI signals to preview inventory demand, dynamic pricing and lead readiness.</p>}
            {aiConsole?.error && <p className="muted">{aiConsole.error}</p>}
            {aiConsole && (
              <div className="timeline">
                <div className="timeline-step"><b>Supplier</b><span>{aiConsole.supplier?.name || 'Unknown'}</span></div>
                <div className="timeline-step"><b>Open RFQ Leads</b><span>{aiConsole.openLeadCount || 0}</span></div>
                <div className="timeline-step"><b>Pricing Mode</b><span>{aiConsole.pricingMode || 'balanced'}</span></div>
                <div className="timeline-step"><b>Demand Signals</b><span>{aiConsole.demandForecast?.length || 0}</span></div>
              </div>
            )}
          </article>

          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>AI Inventory and Pricing Suggestions</h3>
            {!aiConsole && <p className="muted">Use MODIT AI console to generate category-level prediction and pricing guidance.</p>}
            {aiConsole && (
              <div className="timeline">
                {(aiConsole.demandForecast || []).slice(0, 5).map((item) => (
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

        <section className="section grid-2">
          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Inventory and Pricing Actions</h3>
            <div className="grid-2">
              <div className="form-field">
                <label>Inventory Category</label>
                <select value={targetCategory} onChange={(event) => setTargetCategory(event.target.value)}>
                  {categories.map((item) => <option key={item.key}>{item.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Target Quantity</label>
                <input type="number" min="0" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} />
              </div>
            </div>
            <div className="action-row">
              <button type="button" className="button" onClick={updateInventoryTarget}>Save Inventory Target</button>
            </div>

            <div className="form-field" style={{ marginTop: '10px' }}>
              <label>Pricing Strategy</label>
              <select value={pricingMode} onChange={(event) => setPricingMode(event.target.value)}>
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="action-row">
              <button type="button" className="button" onClick={updatePricingMode}>Update Pricing Mode</button>
            </div>

            {aiConsole?.inventoryTargets?.length > 0 && (
              <div className="timeline" style={{ marginTop: '12px' }}>
                {aiConsole.inventoryTargets.map((item) => (
                  <div key={item.category} className="timeline-step"><b>{item.category}</b><span>{item.target}</span></div>
                ))}
              </div>
            )}
          </article>

          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Lead Pipeline Actions</h3>
            <div className="form-field">
              <label>RFQ Lead ID</label>
              <input value={leadId} onChange={(event) => setLeadId(event.target.value)} placeholder="RFQ-0001" />
            </div>
            <div className="form-field">
              <label>Lead Stage</label>
              <select value={leadStatus} onChange={(event) => setLeadStatus(event.target.value)}>
                <option>New lead</option>
                <option>Follow-up in progress</option>
                <option>Quote submitted</option>
                <option>Negotiation stage</option>
                <option>Won</option>
                <option>Lost</option>
              </select>
            </div>
            <div className="action-row">
              <button type="button" className="button" onClick={updateLeadPipeline}>Update Lead Stage</button>
            </div>

            {aiConsole?.leadPipeline?.length > 0 && (
              <div className="timeline" style={{ marginTop: '12px' }}>
                {aiConsole.leadPipeline.slice(0, 5).map((lead) => (
                  <div key={lead.rfqId} className="timeline-step">
                    <div>
                      <b>{lead.rfqId}</b>
                      <p className="muted" style={{ margin: '4px 0 0' }}>{lead.project} | {lead.city}</p>
                    </div>
                    <span className="badge">{lead.status}</span>
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
