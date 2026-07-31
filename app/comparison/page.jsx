'use client';

import { useState } from 'react';
import Nav from '../components/Nav';

const rows = [
  { supplier: 'Supplier A', price: 'Rs 4,75,000', delivery: '24 hrs', quality: '4.9', moq: '100 bags', gst: '18%', discount: '3%', eta: 'Tomorrow', ai: 'Best value and fastest dispatch' },
  { supplier: 'Supplier B', price: 'Rs 4,62,500', delivery: '36 hrs', quality: '4.8', moq: '150 bags', gst: '18%', discount: '4%', eta: '1.5 days', ai: 'Lowest base quote with medium lead time' },
  { supplier: 'Supplier C', price: 'Rs 4,91,000', delivery: '20 hrs', quality: '4.7', moq: '80 bags', gst: '18%', discount: '2%', eta: 'Today', ai: 'Best for urgent delivery windows' }
];

export default function ComparisonPage() {
  const [picked, setPicked] = useState('Supplier A');

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Price Comparison Engine</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Supplier Comparison Matrix</h1>
        <section className="section">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Supplier</th><th>Price</th><th>Delivery</th><th>Quality</th><th>MOQ</th><th>GST</th><th>Discount</th><th>ETA</th><th>AI Recommendation</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.supplier}>
                    <td>{row.supplier}</td>
                    <td>{row.price}</td>
                    <td>{row.delivery}</td>
                    <td>{row.quality}</td>
                    <td>{row.moq}</td>
                    <td>{row.gst}</td>
                    <td>{row.discount}</td>
                    <td>{row.eta}</td>
                    <td>{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="action-row" style={{ marginTop: '14px' }}>
            {rows.map((row) => (
              <button key={row.supplier} className={picked === row.supplier ? 'button primary' : 'button'} onClick={() => setPicked(row.supplier)}>{row.supplier}</button>
            ))}
          </div>
          <article className="info-card" style={{ marginTop: '12px' }}>
            <h4>Selected: {picked}</h4>
            <p className="muted">AI suggests this selection based on delivery confidence, quality score and procurement timeline fit.</p>
          </article>
        </section>
      </main>
    </>
  );
}
