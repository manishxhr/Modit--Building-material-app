'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import { quickActions } from '../components/modit-data';
import NcrCoverageMap from '../components/NcrCoverageMap';
import { notifyToast } from '../components/ToastHost';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [syncAt, setSyncAt] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch('/api/dashboard');
      const payload = await response.json();
      if (!active) return;
      setData(payload);
      setSyncAt(new Date(payload.generatedAt || Date.now()).toLocaleTimeString('en-IN'));
    }

    load();
    const timer = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function placeReorder(orderId) {
    const response = await fetch('/api/orders/' + orderId + '/reorder', { method: 'POST' });
    const payload = await response.json();
    notifyToast(response.ok ? (payload.message || 'Reorder placed.') : (payload.error || 'Reorder failed.'), response.ok ? 'success' : 'warn');
    if (response.ok) {
      const refresh = await fetch('/api/dashboard').then((r) => r.json());
      setData(refresh);
      setSyncAt(new Date(refresh.generatedAt || Date.now()).toLocaleTimeString('en-IN'));
    }
  }

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Home Dashboard</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Procurement Control Center</h1>
        <p className="muted">Quick actions, current orders, recent quotes, supplier intelligence and AI suggestions.</p>
        {syncAt && <p className="muted" style={{ marginTop: '4px' }}>Live sync: {syncAt} (auto-refresh every 30s)</p>}

        <section className="section">
          <div className="grid-4">
            {quickActions.map((item) => (
              <Link key={item.href} href={item.href} className="dashboard-card">
                <h4>{item.title}</h4>
                <p className="muted">{item.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        {!data ? (
          <section className="section">
            <div className="grid-4" style={{ marginBottom: '12px' }}>
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
            </div>
            <div className="timeline">
              <div className="skeleton skeleton-row" />
              <div className="skeleton skeleton-row" />
              <div className="skeleton skeleton-row" />
            </div>
          </section>
        ) : (
          <>
            <section className="section">
              <div className="kpi-strip">
                <div className="kpi"><b>{data.orders.length}</b><span>Current Orders</span></div>
                <div className="kpi"><b>{data.rfqs.length}</b><span>Recent Quotes</span></div>
                <div className="kpi"><b>{data.suppliers.length}</b><span>Nearby Suppliers</span></div>
                <div className="kpi"><b>{data.reorderCandidates.length}</b><span>Smart Reorders</span></div>
                <div className="kpi"><b>{data.activity.length}</b><span>AI Suggestions</span></div>
              </div>
            </section>

            <section className="section grid-2">
              <div className="info-card">
                <h3>Live Delivery Tracking</h3>
                <div className="timeline" style={{ marginTop: '10px' }}>
                  <div className="timeline-step"><b>Confirmed</b><span>{data.liveTracking.confirmed}</span></div>
                  <div className="timeline-step"><b>Packed</b><span>{data.liveTracking.packed}</span></div>
                  <div className="timeline-step"><b>In transit</b><span>{data.liveTracking.inTransit}</span></div>
                  <div className="timeline-step"><b>Delivered</b><span>{data.liveTracking.delivered}</span></div>
                </div>
              </div>

              <div className="info-card">
                <h3>Smart Reorder Reminders</h3>
                <div className="timeline" style={{ marginTop: '10px' }}>
                  {data.reorderAlerts.length === 0 && <div className="timeline-step"><span>No reorder alerts right now.</span></div>}
                  {data.reorderAlerts.map((alert) => (
                    <div key={alert.orderId} className="timeline-step">
                      <div>
                        <b>{alert.orderId}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>{alert.project} | {alert.reason}</p>
                      </div>
                      <button className="button" type="button" onClick={() => placeReorder(alert.orderId)}>
                        Reorder Rs {alert.suggestedTopUp.toLocaleString('en-IN')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="section grid-2">
              <div>
                <div className="section-header"><h2>Current Orders</h2><Link className="badge" href="/orders">View all</Link></div>
                <div className="timeline">
                  {data.orders.slice(0, 4).map((order) => (
                    <article key={order.id} className="timeline-step">
                      <div>
                        <b><span className="dot" />{order.id}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>{order.project} - {order.supplier}</p>
                      </div>
                      <span className="badge">{order.status}</span>
                    </article>
                  ))}
                  {data.orders.length === 0 && <article className="info-card">No active orders yet.</article>}
                </div>
              </div>

              <div>
                <div className="section-header"><h2>Recent Quotes</h2><Link className="badge" href="/rfq">Create RFQ</Link></div>
                <div className="timeline">
                  {data.rfqs.slice(0, 4).map((rfq) => (
                    <article key={rfq.id} className="timeline-step">
                      <div>
                        <b>{rfq.id}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>{rfq.project} - {rfq.city}</p>
                      </div>
                      <span className="badge">{rfq.status}</span>
                    </article>
                  ))}
                  {data.rfqs.length === 0 && <article className="info-card">No RFQs yet. Use MODIT AI workspace to generate one.</article>}
                </div>
              </div>
            </section>

            <section className="section grid-2">
              <div className="info-card">
                <h3>Price Trends</h3>
                <p className="muted">Cement +1.8% - Steel +0.9% - Sand -0.4% - Tiles +1.2%</p>
              </div>
              <div className="info-card">
                <h3>Delivery Status</h3>
                <p className="muted">92% on-time dispatch this week across Delhi NCR.</p>
              </div>
            </section>

            <section className="section">
              <div className="section-header"><h2>Delhi NCR Coverage Map</h2><span className="badge">Live readiness</span></div>
              <NcrCoverageMap suppliers={data.suppliers} />
            </section>
          </>
        )}
      </main>
    </>
  );
}
