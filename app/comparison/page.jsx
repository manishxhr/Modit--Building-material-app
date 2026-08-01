'use client';

import { useCallback, useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { categories } from '../components/modit-data';

const bootPayload = {
  rows: [
    { supplierId: 1, supplier: 'MetroBuild Supply', unitPrice: 372, quantity: 100, subtotal: 37200, gst: 6696, logistics: 2360, total: 46256, deliveryHours: 24, quality: 'A+', rating: 4.9, aiReason: 'Bootstrapped preview while live quote table loads.' },
    { supplierId: 2, supplier: 'NCR Material Hub', unitPrice: 365, quantity: 100, subtotal: 36500, gst: 6570, logistics: 2540, total: 45610, deliveryHours: 36, quality: 'A', rating: 4.8, aiReason: 'Bootstrapped preview while live quote table loads.' },
    { supplierId: 5, supplier: 'Ghaziabad Build Depot', unitPrice: 359, quantity: 100, subtotal: 35900, gst: 6462, logistics: 2600, total: 44962, deliveryHours: 40, quality: 'A', rating: 4.5, aiReason: 'Bootstrapped preview while live quote table loads.' }
  ],
  recommended: { supplier: 'Ghaziabad Build Depot', total: 44962, deliveryHours: 40 }
};

export default function ComparisonPage() {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Cement');
  const [quantity, setQuantity] = useState('100');
  const [payload, setPayload] = useState(bootPayload);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ city, category, quantity });
      const data = await fetch('/api/comparison?' + params.toString()).then((response) => response.json());
      setPayload(data);
    } finally {
      setLoading(false);
    }
  }, [city, category, quantity]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Price Comparison Engine</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Supplier Comparison Matrix</h1>
        <section className="section">
          <div className="grid-3" style={{ marginBottom: '12px' }}>
            <div className="form-field">
              <label>City</label>
              <select value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="">Delhi NCR (All)</option>
                <option>Delhi</option>
                <option>Gurugram</option>
                <option>Noida</option>
                <option>Faridabad</option>
                <option>Ghaziabad</option>
                <option>Greater Noida</option>
              </select>
            </div>
            <div className="form-field">
              <label>Category</label>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item.key}>{item.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Quantity</label>
              <input value={quantity} type="number" min="1" onChange={(event) => setQuantity(event.target.value)} />
            </div>
          </div>
          <div className="action-row" style={{ marginBottom: '12px' }}>
            <button className="button primary" type="button" onClick={load}>{loading ? 'Refreshing...' : 'Refresh Comparison'}</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Supplier</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th><th>GST</th><th>Logistics</th><th>Total</th><th>Delivery</th><th>Quality</th><th>AI Rationale</th></tr>
              </thead>
              <tbody>
                {payload?.rows?.map((row) => (
                  <tr key={row.supplierId}>
                    <td>{row.supplier}</td>
                    <td>Rs {row.unitPrice.toLocaleString('en-IN')}</td>
                    <td>{row.quantity}</td>
                    <td>Rs {row.subtotal.toLocaleString('en-IN')}</td>
                    <td>Rs {row.gst.toLocaleString('en-IN')}</td>
                    <td>Rs {row.logistics.toLocaleString('en-IN')}</td>
                    <td>Rs {row.total.toLocaleString('en-IN')}</td>
                    <td>{row.deliveryHours}h</td>
                    <td>{row.quality} | {row.rating}</td>
                    <td>{row.aiReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!payload?.rows?.length && <article className="info-card">No matching suppliers found for this filter.</article>}
          {payload?.recommended && (
            <article className="info-card" style={{ marginTop: '12px' }}>
              <h4>Recommended: {payload.recommended.supplier}</h4>
              <p className="muted">
                Best landed total Rs {payload.recommended.total.toLocaleString('en-IN')} with delivery in {payload.recommended.deliveryHours}h.
              </p>
            </article>
          )}
        </section>
      </main>
    </>
  );
}
