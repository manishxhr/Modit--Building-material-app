import Link from 'next/link';
import { readStore } from '../../../lib/store';
import Nav from '../../components/Nav';

export default function SupplierDetailPage({ params }) {
  const store = readStore();
  const numericId = Number(params.id);
  const supplier = store.suppliers.find((item) => item.id === numericId) || store.suppliers[0];

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Supplier Profile</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>{supplier.name}</h1>

        <section className="section grid-2">
          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Supplier Overview</h3>
            <div className="timeline">
              <div className="timeline-step"><span>Verification</span><b>GST Verified</b></div>
              <div className="timeline-step"><span>Rating</span><b>{supplier.rating}</b></div>
              <div className="timeline-step"><span>Warehouse</span><b>{supplier.city}</b></div>
              <div className="timeline-step"><span>Coverage Area</span><b>Delhi NCR</b></div>
              <div className="timeline-step"><span>Inventory Focus</span><b>{supplier.focus}</b></div>
              <div className="timeline-step"><span>Response Time</span><b>within 20 min</b></div>
              <div className="timeline-step"><span>Delivery Speed</span><b>{supplier.delivery} hrs</b></div>
              <div className="timeline-step"><span>Business Since</span><b>2014</b></div>
            </div>
          </article>

          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Contact and Action</h3>
            <p className="muted">Direct communication channels with verified supplier identity and quote SLAs.</p>
            <div className="action-row">
              <button className="button">Call</button>
              <button className="button">WhatsApp</button>
              <button className="button">Chat</button>
              <Link href="/rfq" className="button primary">Request Quote</Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
