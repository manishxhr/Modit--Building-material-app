import Nav from '../components/Nav';

const panels = [
  'Business Information',
  'Saved Addresses',
  'GST Details',
  'Saved Suppliers',
  'Favorites',
  'Projects',
  'Payment Methods',
  'Notifications',
  'Settings'
];

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Profile Center</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Business and Procurement Identity</h1>
        <section className="section grid-3">
          {panels.map((panel) => (
            <article key={panel} className="info-card">
              <h4>{panel}</h4>
              <p className="muted">Manage and update this module for faster repeat procurement.</p>
              <button className="button">Open</button>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
