'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { notifyToast } from '../components/ToastHost';

export default function RFQPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmingSupplier, setConfirmingSupplier] = useState('');
  const [acceptedOrder, setAcceptedOrder] = useState(null);

  async function submitRFQ(event) {
    event.preventDefault();
    setBusy(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/workflow/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setResult(data);
    notifyToast(response.ok ? 'RFQ generated with supplier offers.' : (data.error || 'Unable to generate RFQ.'), response.ok ? 'success' : 'warn');
    setBusy(false);
  }

  async function confirmOrder(supplierId) {
    if (!result?.rfq?.id) return;
    setConfirmingSupplier(String(supplierId));
    try {
      const response = await fetch('/api/rfqs/' + result.rfq.id + '/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId })
      });
      const data = await response.json();
      if (!response.ok) {
        notifyToast(data.error || 'Unable to confirm order.', 'warn');
        return;
      }
      setAcceptedOrder(data.order);
      notifyToast(data.message || 'Order confirmed from RFQ.', 'success');
    } finally {
      setConfirmingSupplier('');
    }
  }

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">RFQ Workspace</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Request Quotation and Negotiate</h1>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={submitRFQ}>
            <h3>RFQ Input</h3>
            <div className="form-field"><label>Project</label><input name="project" defaultValue="NCR Corporate Park" required /></div>
            <div className="form-field"><label>Project Type</label><select name="projectType"><option value="commercial">Commercial</option><option value="residential">Residential</option><option value="fitout">Fit-out</option></select></div>
            <div className="grid-2">
              <div className="form-field"><label>City</label><select name="city"><option>Delhi</option><option>Gurugram</option><option>Noida</option><option>Faridabad</option></select></div>
              <div className="form-field"><label>Budget</label><input name="budget" type="number" defaultValue="900000" /></div>
            </div>
            <div className="grid-2">
              <div className="form-field"><label>Area (sq ft)</label><input name="areaSqft" type="number" defaultValue="4000" min="200" /></div>
              <div className="form-field"><label>Floors</label><input name="floors" type="number" defaultValue="5" min="1" /></div>
            </div>
            <div className="form-field"><label>BOQ Notes</label><textarea name="requirements" defaultValue="Cement, steel, blocks, plumbing and finishing material in two delivery phases." /></div>
            <button className="button primary" type="submit">{busy ? 'Generating RFQ...' : 'Generate RFQ'}</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Quote Output</h3>
            {!result && <p className="muted">Create an RFQ to see supplier offers, MODIT AI recommendation and acceptance workflow.</p>}
            {result && (
              <>
                <p className="muted">{result.rfq.id} - {result.summary}</p>
                <div className="timeline">
                  {result.rfq.quotes.map((quote) => (
                    <div className="timeline-step" key={quote.supplierId}>
                      <div>
                        <b>{quote.supplier}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>{quote.reason}</p>
                      </div>
                      <div className="action-row" style={{ marginTop: 0 }}>
                        <span className="badge">Rs {quote.quote.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          className="button"
                          onClick={() => confirmOrder(quote.supplierId)}
                          disabled={confirmingSupplier === String(quote.supplierId)}
                        >
                          {confirmingSupplier === String(quote.supplierId) ? 'Confirming...' : 'Confirm Order'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {acceptedOrder && (
                  <article className="info-card" style={{ marginTop: '12px' }}>
                    <h4>{acceptedOrder.id} Confirmed</h4>
                    <p className="muted">Supplier: {acceptedOrder.supplier} | Amount: Rs {acceptedOrder.amount.toLocaleString('en-IN')}</p>
                    <div className="action-row" style={{ marginTop: '10px' }}>
                      <button type="button" className="button primary" onClick={() => router.push('/orders')}>Track In Orders</button>
                      <button type="button" className="button" onClick={() => router.push('/dashboard')}>View Dashboard</button>
                    </div>
                  </article>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
