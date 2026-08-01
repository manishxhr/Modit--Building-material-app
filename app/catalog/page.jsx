'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { categories } from '../components/modit-data';
import { notifyToast } from '../components/ToastHost';

const bootItems = categories.map((item, index) => ({
  id: 'sample-' + item.key,
  name: item.name + ' Sample',
  category: item.name,
  unit: 'standard unit',
  price: 500 + index * 110,
  stock: 'Loading live stock',
  leadTime: 'Loading ETA'
}));

export default function CatalogPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState(bootItems);
  const [addingId, setAddingId] = useState('');
  const [loading, setLoading] = useState(true);
  const firstRealItem = items.find((item) => !item.id.startsWith('sample-'));

  async function addToCart(productId) {
    setAddingId(productId);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
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
      setAddingId('');
    }
  }

  async function buyNow(productId) {
    setAddingId(productId + '-buy');
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await response.json();
      if (!response.ok) {
        notifyToast(data.error || 'Could not start checkout.', 'warn');
        return;
      }
      notifyToast('Item moved to checkout.', 'success');
      router.push('/cart');
    } catch {
      notifyToast('Network error while starting checkout.', 'warn');
    } finally {
      setAddingId('');
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setQuery(q);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    fetch('/api/catalog?' + params.toString())
      .then((response) => response.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [query, selectedCategory]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category).push(item);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Global Material Search</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Catalog, Filters and Instant Discovery</h1>

        <section className="section">
          <div className="search-box">
            <span className="badge">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by material, brand, category, SKU, supplier..."
            />
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="">All Categories</option>
              {categories.map((item) => <option key={item.key} value={item.name}>{item.name}</option>)}
            </select>
            <span className="badge">{loading ? 'Loading...' : items.length + ' results'}</span>
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>Categories</h2><Link className="badge" href="/categories">Browse all</Link></div>
          <div className="grid-4">
            {categories.map((item) => (
              <article key={item.key} className="category-card">
                <div className="category-top"><span className="icon-pill">{item.icon}</span><span className="badge">Filter</span></div>
                <h4 style={{ marginTop: '10px' }}>{item.name}</h4>
                <p className="muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header"><h2>Products</h2><Link className="badge" href="/comparison">Compare suppliers</Link></div>
          <div className="action-row" style={{ marginBottom: '10px' }}>
            <Link className="button" href="/comparison">Open Supplier Comparison Table</Link>
            {firstRealItem && <Link className="button primary" href={'/product/' + firstRealItem.id}>Open Sample Product PDP</Link>}
          </div>
          <div className="grid-3">
            {items.map((item) => (
              <article key={item.id} className="product-card">
                <span className="badge">{item.category}</span>
                <h4 style={{ marginTop: '10px' }}>{item.name}</h4>
                <p className="muted">{item.unit} - {item.stock}</p>
                <h3 style={{ marginTop: '8px' }}>Rs {item.price.toLocaleString('en-IN')}</h3>
                <p className="muted">Delivery ETA {item.leadTime}</p>
                <div className="action-row" style={{ marginTop: '10px' }}>
                  <button className="button" type="button" onClick={() => addToCart(item.id)} disabled={addingId === item.id || item.id.startsWith('sample-')}>
                    {addingId === item.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button className="button" type="button" onClick={() => buyNow(item.id)} disabled={addingId === item.id + '-buy' || item.id.startsWith('sample-')}>
                    {addingId === item.id + '-buy' ? 'Starting...' : 'Buy Now'}
                  </button>
                  {!item.id.startsWith('sample-') && <Link className="button primary" href={'/product/' + item.id}>View Product</Link>}
                </div>
              </article>
            ))}
          </div>
          {!loading && items.length === 0 && <article className="info-card">No products found for this query.</article>}
        </section>

        {grouped.length > 0 && (
          <section className="section">
            <div className="section-header"><h2>Category Buckets</h2></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Category</th><th>Products</th><th>Top Use Case</th></tr></thead>
                <tbody>
                  {grouped.map(([name, list]) => (
                    <tr key={name}><td>{name}</td><td>{list.length}</td><td>Site procurement and contractor demand</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
