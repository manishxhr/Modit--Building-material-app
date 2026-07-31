'use client';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';

const inr = n => '₹' + Number(n).toLocaleString('en-IN');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState({});

  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(setOrders); }, []);

  async function toggleInvoice(id) {
    if (invoices[id]) { setInvoices(prev => ({ ...prev, [id]: null })); return; }
    const inv = await fetch(`/api/orders/${id}/invoice`).then(r => r.json());
    setInvoices(prev => ({ ...prev, [id]: inv }));
  }

  return <>
    <Nav />
    <main className="app">
      <p className="eyebrow">DELIVERY CONTROL / ORDER TRACKING</p>
      <h1>Know what is moving,<br /><i>before the site asks.</i></h1>
      <div className="orders">
        {orders.length === 0
          ? <div className="empty"><b>No orders yet.</b><p>Create one through the AI Copilot.</p></div>
          : orders.map(x => (
            <div key={x.id}>
              <article>
                <div><span className={'dot ' + x.status.toLowerCase().replaceAll(' ', '-')}></span><small>ORDER</small><h3>{x.id}</h3></div>
                <div><small>PROJECT</small><b>{x.project}</b></div>
                <div><small>SUPPLIER</small><b>{x.supplier}</b></div>
                <div><small>STATUS</small><b>{x.status}</b></div>
                <div><small>ETA</small><b>{x.eta}</b></div>
                <div><small>VALUE</small><b>{inr(x.amount)}</b></div>
                <div><small>PAYMENT</small><b>{x.credit}</b></div>
                <div><button type="button" className="linkbtn" onClick={() => toggleInvoice(x.id)}>{invoices[x.id] ? 'Hide GST invoice' : 'View GST invoice →'}</button></div>
              </article>
              {invoices[x.id] && (
                <div className="invoice">
                  <div className="invoicehead">
                    <b>GST Invoice {invoices[x.id].invoiceNo}</b>
                    <span>{invoices[x.id].date}</span>
                  </div>
                  <p className="muted">Billed to <b>{invoices[x.id].billTo}</b> · Supplied by <b>{invoices[x.id].supplier}</b> · GSTIN {invoices[x.id].gstin}</p>
                  <div className="invoicerows">
                    <div><span>Taxable value</span><b>{inr(invoices[x.id].taxable)}</b></div>
                    <div><span>CGST (9%)</span><b>{inr(invoices[x.id].cgst)}</b></div>
                    <div><span>SGST (9%)</span><b>{inr(invoices[x.id].sgst)}</b></div>
                    <div className="total"><span>Total payable</span><b>{inr(invoices[x.id].total)}</b></div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </main>
  </>;
}
