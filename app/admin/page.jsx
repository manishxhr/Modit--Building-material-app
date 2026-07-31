import Nav from '../components/Nav';

export default function AdminPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Admin Dashboard</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Platform Analytics and Governance</h1>

        <section className="section">
          <div className="kpi-strip">
            <div className="kpi"><b>Rs 4.8 Cr</b><span>Revenue</span></div>
            <div className="kpi"><b>2,413</b><span>Orders</span></div>
            <div className="kpi"><b>1,207</b><span>Suppliers</span></div>
            <div className="kpi"><b>7,820</b><span>Users</span></div>
            <div className="kpi"><b>98%</b><span>AI Monitoring Uptime</span></div>
          </div>
        </section>

        <section className="section grid-2">
          <article className="info-card"><h3>Approvals and Compliance</h3><p className="muted">Supplier approvals, payment reviews, complaint resolution and GST governance queue.</p></article>
          <article className="info-card"><h3>Delhi NCR Heatmap</h3><p className="muted">Coverage density and live deliveries across all target zones.</p></article>
        </section>
      </main>
    </>
  );
}
