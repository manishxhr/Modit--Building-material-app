'use client';

import { useEffect, useState } from 'react';
import Nav from '../components/Nav';

const inr = (value) => 'Rs ' + Number(value).toLocaleString('en-IN');

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [invoice, setInvoice] = useState({});

  useEffect(() => {
    fetch('/api/orders').then((response) => response.json()).then(setOrders);
  }, []);

  async function loadInvoice(id) {
    if (invoice[id]) {
      setInvoice((prev) => ({ ...prev, [id]: null }));
      return;
    }
    const data = await fetch('/api/orders/' + id + '/invoice').then((response) => response.json());
    setInvoice((prev) => ({ ...prev, [id]: data }));
  }

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Orders and Live Tracking</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Delivery Timeline and GST Invoices</h1>

        <section className="section">
          <div className="timeline">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="section-header">
                  <div>
                    <h3><span className="dot" />{order.id}</h3>
                    <p className="muted">{order.project} - {order.supplier}</p>
                  </div>
                  <span className="badge">{order.status}</span>
                </div>
                <div className="grid-3" style={{ marginTop: '10px' }}>
                  <div className="info-card"><h4>ETA</h4><p className="muted">{order.eta}</p></div>
                  <div className="info-card"><h4>Amount</h4><p className="muted">{inr(order.amount)}</p></div>
                  <div className="info-card"><h4>Credit</h4><p className="muted">{order.credit}</p></div>
                </div>
                <div className="action-row">
                  <button className="button" onClick={() => loadInvoice(order.id)}>
                    {invoice[order.id] ? 'Hide GST Invoice' : 'View GST Invoice'}
                  </button>
                </div>
                {invoice[order.id] && (
                  <div className="table-wrap" style={{ marginTop: '10px' }}>
                    <table>
                      <tbody>
                        <tr><th>Invoice No</th><td>{invoice[order.id].invoiceNo}</td></tr>
                        <tr><th>Taxable</th><td>{inr(invoice[order.id].taxable)}</td></tr>
                        <tr><th>CGST</th><td>{inr(invoice[order.id].cgst)}</td></tr>
                        <tr><th>SGST</th><td>{inr(invoice[order.id].sgst)}</td></tr>
                        <tr><th>Total</th><td>{inr(invoice[order.id].total)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
            {orders.length === 0 && <article className="info-card">No orders yet. Generate one through RFQ or MODIT AI workspace.</article>}
          </div>
        </section>
      </main>
    </>
  );
}
