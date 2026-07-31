import Link from 'next/link';
import Nav from '../components/Nav';
import { categories } from '../components/modit-data';

export default function CategoriesPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Material Categories</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>All Building Material Verticals</h1>
        <section className="section">
          <div className="grid-4">
            {categories.map((item) => (
              <article key={item.key} className="category-card">
                <div className="category-top"><span className="icon-pill">{item.icon}</span><span className="badge">Explore</span></div>
                <h4 style={{ marginTop: '10px' }}>{item.name}</h4>
                <p className="muted">{item.desc}</p>
                <div className="action-row"><Link href="/catalog" className="button">View Products</Link></div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
