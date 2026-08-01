'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { notifyToast } from '../components/ToastHost';

const defaultCheckout = {
  project: 'Site Procurement Order',
  customerName: '',
  phone: '',
  address: '',
  city: 'Delhi',
  paymentMethod: 'UPI',
  couponCode: ''
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], summary: { subtotal: 0, gst: 0, delivery: 0, total: 0, itemCount: 0 } });
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const hasItems = cart.items.length > 0;

  async function loadCart() {
    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQty(productId, quantity) {
    const response = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    const data = await response.json();
    if (!response.ok) {
      notifyToast(data.error || 'Could not update quantity.', 'warn');
      return;
    }
    setCart(data);
  }

  async function removeItem(productId) {
    const response = await fetch('/api/cart?productId=' + encodeURIComponent(productId), { method: 'DELETE' });
    const data = await response.json();
    setCart(data);
    notifyToast('Item removed from cart.', 'info');
  }

  async function clearCart() {
    const response = await fetch('/api/cart', { method: 'DELETE' });
    const data = await response.json();
    setCart(data);
    notifyToast('Cart cleared.', 'info');
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!hasItems) return;

    setPlacing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkout)
      });
      const data = await response.json();
      if (!response.ok) {
        notifyToast(data.error || 'Checkout failed.', 'warn');
        return;
      }

      notifyToast(data.message || 'Order placed successfully.', 'success');
      setCheckout(defaultCheckout);
      await loadCart();
      router.push('/orders');
    } finally {
      setPlacing(false);
    }
  }

  const summary = useMemo(() => cart.summary || { subtotal: 0, gst: 0, delivery: 0, total: 0, itemCount: 0 }, [cart.summary]);

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Cart and Checkout</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Ecommerce Cart, GST Billing and Secure Checkout</h1>

        <section className="section grid-2">
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="section-header">
              <h3>Cart Items</h3>
              {hasItems && <button type="button" className="button" onClick={clearCart}>Clear Cart</button>}
            </div>

            {loading && <article className="info-card">Loading cart...</article>}

            {!loading && !hasItems && (
              <article className="info-card">
                <h4>Your cart is empty.</h4>
                <p className="muted">Add materials from catalog or product pages to start checkout.</p>
              </article>
            )}

            {!loading && hasItems && (
              <div className="timeline">
                {cart.items.map((item) => (
                  <div className="timeline-step" key={item.id}>
                    <div>
                      <b>{item.name}</b>
                      <p className="muted" style={{ margin: '4px 0 0' }}>{item.unit} | Delivery {item.leadTime}</p>
                      <div className="action-row" style={{ marginTop: '8px' }}>
                        <button type="button" className="button" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                        <span className="badge">Qty {item.quantity}</span>
                        <button type="button" className="button" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                        <button type="button" className="button" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </div>
                    <span className="badge">Rs {(item.lineTotal || (item.price * item.quantity)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="glass-card" style={{ padding: '16px' }} onSubmit={placeOrder}>
            <h3>Checkout</h3>
            <div className="timeline" style={{ marginBottom: '10px' }}>
              <div className="timeline-step"><span>Items</span><b>{summary.itemCount}</b></div>
              <div className="timeline-step"><span>Subtotal</span><b>Rs {Number(summary.subtotal || 0).toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>GST (18%)</span><b>Rs {Number(summary.gst || 0).toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>Delivery</span><b>Rs {Number(summary.delivery || 0).toLocaleString('en-IN')}</b></div>
              <div className="timeline-step"><span>Total</span><b>Rs {Number(summary.total || 0).toLocaleString('en-IN')}</b></div>
            </div>

            <div className="form-field"><label>Project / Order Label</label><input value={checkout.project} onChange={(event) => setCheckout((v) => ({ ...v, project: event.target.value }))} required /></div>
            <div className="grid-2">
              <div className="form-field"><label>Buyer Name</label><input value={checkout.customerName} onChange={(event) => setCheckout((v) => ({ ...v, customerName: event.target.value }))} required /></div>
              <div className="form-field"><label>Phone</label><input value={checkout.phone} onChange={(event) => setCheckout((v) => ({ ...v, phone: event.target.value }))} required /></div>
            </div>
            <div className="form-field"><label>Delivery Address</label><textarea value={checkout.address} onChange={(event) => setCheckout((v) => ({ ...v, address: event.target.value }))} required /></div>
            <div className="grid-2">
              <div className="form-field">
                <label>City</label>
                <select value={checkout.city} onChange={(event) => setCheckout((v) => ({ ...v, city: event.target.value }))}>
                  <option>Delhi</option><option>Gurugram</option><option>Noida</option><option>Faridabad</option><option>Ghaziabad</option><option>Greater Noida</option>
                </select>
              </div>
              <div className="form-field">
                <label>Payment Method</label>
                <select value={checkout.paymentMethod} onChange={(event) => setCheckout((v) => ({ ...v, paymentMethod: event.target.value }))}>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>PO + Credit</option>
                </select>
              </div>
            </div>
            <div className="form-field"><label>Coupon Code (optional)</label><input value={checkout.couponCode} onChange={(event) => setCheckout((v) => ({ ...v, couponCode: event.target.value.toUpperCase() }))} placeholder="Try MODIT5" /></div>

            <div className="action-row">
              <button className="button primary" type="submit" disabled={!hasItems || placing}>{placing ? 'Placing Order...' : 'Place Order'}</button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
