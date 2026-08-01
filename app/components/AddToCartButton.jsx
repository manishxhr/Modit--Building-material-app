'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notifyToast } from './ToastHost';

export default function AddToCartButton({ productId, quantity = 1, fullWidth = false }) {
  const [loading, setLoading] = useState(false);

  async function addToCart() {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await response.json();
      if (!response.ok) {
        notifyToast(data.error || 'Could not add to cart.', 'warn');
        return;
      }
      notifyToast('Added to cart. Items: ' + data.summary.itemCount, 'success');
    } catch {
      notifyToast('Network error while adding to cart.', 'warn');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="action-row" style={fullWidth ? { width: '100%' } : undefined}>
      <button type="button" className="button" onClick={addToCart} disabled={loading}>
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      <Link href="/cart" className="button primary">Go to Cart</Link>
    </div>
  );
}
