import Nav from '../components/Nav';

const cartItems = [
  { name: 'UltraBuild OPC 43 Cement', qty: 120, unit: 'bags', price: 365 },
  { name: 'Fe500D TMT Steel', qty: 2, unit: 'tonnes', price: 72100 },
  { name: 'CPVC Plumbing Kit', qty: 8, unit: 'sets', price: 8450 }
];

export default function CartPage() {
  const subtotal = cartItems.reduce((total, item) => total + item.qty * item.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = 6500;
  const total = subtotal + gst + delivery;

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Cart and Checkout</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Professional Cart with GST and Invoice Preview</h1>
        <section className="section grid-2">
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Cart Items</h3>
            <div className="timeline">
              {cartItems.map((item) => (
                <div className="timeline-step" key={item.name}>
                  <div>
                    <b>{item.name}</b>
                    <p className="muted" style={{ margin: '4px 0 0' }}>{item.qty} {item.unit}</p>
                  </div>
                  <span className="badge">Rs {(item.qty * item.price).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Billing Summary</h3>
            <div className="timeline">
              <div className="timeline-step"><span>Subtotal</span><b>Rs {subtotal.toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>GST (18%)</span><b>Rs {gst.toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>Delivery</span><b>Rs {delivery.toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>Total</span><b>Rs {total.toLocaleString('en-IN')}</b></div>
            </div>
            <div className="action-row" style={{ marginTop: '12px' }}>
              <button className="button">Apply Coupon</button>
              <button className="button primary">Proceed to Payment</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
