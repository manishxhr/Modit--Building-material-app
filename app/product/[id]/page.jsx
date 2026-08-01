import Link from 'next/link';
import { readStore } from '../../../lib/store';
import Nav from '../../components/Nav';
import AddToCartButton from '../../components/AddToCartButton';

export default function ProductDetailPage({ params }) {
  const store = readStore();
  const product = store.products.find((item) => item.id === params.id) || store.products[0];

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Product Detail</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>{product.name}</h1>

        <section className="section grid-2">
          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Specifications</h3>
            <div className="timeline">
              <div className="timeline-step"><span>Category</span><b>{product.category}</b></div>
              <div className="timeline-step"><span>Unit</span><b>{product.unit}</b></div>
              <div className="timeline-step"><span>Price</span><b>Rs {product.price.toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>Availability</span><b>{product.stock}</b></div>
              <div className="timeline-step"><span>Delivery ETA</span><b>{product.leadTime}</b></div>
              <div className="timeline-step"><span>GST</span><b>18%</b></div>
              <div className="timeline-step"><span>MOQ</span><b>50 units</b></div>
              <div className="timeline-step"><span>Bulk Pricing</span><b>Up to 5% off</b></div>
            </div>
          </article>

          <article className="glass-card" style={{ padding: '16px' }}>
            <h3>Supplier Comparison</h3>
            <p className="muted">Compare supplier pricing, quality, MOQ, discount and delivery confidence for this product.</p>
            <div className="action-row"><Link href="/comparison" className="button">Compare</Link></div>
            <AddToCartButton productId={product.id} fullWidth />
            <div className="action-row"><Link href="/rfq" className="button primary">Buy via RFQ</Link></div>
            <article className="info-card" style={{ marginTop: '12px' }}>
              <h4>AI Recommendation</h4>
              <p className="muted">Choose a supplier with less than 36 hours dispatch and quality grade A or above for predictable site continuity.</p>
            </article>
          </article>
        </section>
      </main>
    </>
  );
}
