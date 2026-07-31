'use client';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';

const inr = n => '₹' + Number(n).toLocaleString('en-IN');

export default function Dashboard() {
  const [d, setD] = useState();
  const [busy, setBusy] = useState(null);

  async function load() { setD(await fetch('/api/dashboard').then(r => r.json())); }
  useEffect(() => { load(); }, []);

  async function advance(order) {
    const flow = { Confirmed: 'Packed', Packed: 'In transit', 'In transit': 'Delivered' };
    if (!flow[order.status]) return;
    await fetch('/api/orders/' + order.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: flow[order.status] }) });
    load();
  }

  async function reorder(orderId) {
    setBusy(orderId);
    await fetch(`/api/orders/${orderId}/reorder`, { method: 'POST' });
    await load();
    setBusy(null);
  }

  return <>
    <Nav />
    <main className="app">
      <p className="eyebrow">SUPPLIER OS / INVENTORY · LEADS · OPERATIONS</p>
      <h1>A control room for<br /><i>every delivery promise.</i></h1>
      {!d ? <div className="empty"><b>Loading operations…</b></div> : <>
        <div className="metrics">
          <article><b>{d.orders.length}</b><span>live orders</span></article>
          <article><b>{d.rfqs.length}</b><span>RFQs generated</span></article>
          <article><b>{d.suppliers.length}</b><span>supplier profiles</span></article>
          <article><b>{d.leads.length}</b><span>open leads</span></article>
        </div>

        <section className="dashsection">
          <h2>AI demand forecast — next 30 days</h2>
          <div className="forecastgrid">
            {d.demandForecast.map(f => (
              <article key={f.category} className="forecastcard">
                <span>{f.category}</span>
                <b className={f.change >= 0 ? 'up' : 'down'}>{f.change >= 0 ? '+' : ''}{f.change}%</b>
              </article>
            ))}
          </div>
        </section>

        <section className="dashsection">
          <h2>Order operations</h2>
          {d.orders.map(x => (
            <article className="dashrow" key={x.id}>
              <div><b>{x.id}</b><small>{x.project}{x.repeatOf ? ` · repeat of ${x.repeatOf}` : ''}</small></div>
              <span>{x.supplier}</span>
              <span>{x.status}</span>
              <span>ETA {x.eta}</span>
              <button className="button" disabled={x.status === 'Delivered'} onClick={() => advance(x)}>{x.status === 'Delivered' ? 'Delivered' : 'Advance status →'}</button>
            </article>
          ))}
        </section>

        <section className="dashsection">
          <h2>Smart reorder reminders</h2>
          {d.reorderCandidates.length === 0
            ? <p className="muted">No delivered orders are due for a repeat restock yet.</p>
            : d.reorderCandidates.map(x => (
              <article className="dashrow reminderrow" key={x.id}>
                <div><b>{x.project}</b><small>Last delivered via {x.supplier} · {inr(x.amount)}</small></div>
                <span className="chip">restock due</span>
                <button className="button primary" disabled={busy === x.id} onClick={() => reorder(x.id)}>{busy === x.id ? 'Placing…' : 'Trigger repeat order →'}</button>
              </article>
            ))}
        </section>

        <section className="dashsection">
          <h2>Leads — RFQs awaiting conversion</h2>
          {d.leads.length === 0
            ? <p className="muted">No open leads. New AI Copilot runs will appear here.</p>
            : d.leads.map(x => (
              <article className="dashrow" key={x.id}>
                <div><b>{x.id}</b><small>{x.project} · {x.city}</small></div>
                <span>{x.materials.length} materials</span>
                <span>{x.status}</span>
                <small className="muted">{new Date(x.createdAt).toLocaleDateString('en-IN')}</small>
              </article>
            ))}
        </section>

        <section className="dashsection">
          <h2>AI workflow activity</h2>
          {d.activity.length ? d.activity.map(x => (
            <article className="dashrow" key={x.id}><b>{x.type.toUpperCase()}</b><span>{x.text}</span><small>{new Date(x.at).toLocaleString('en-IN')}</small></article>
          )) : <p className="muted">New procurement actions will appear here.</p>}
        </section>
      </>}
    </main>
  </>;
}
