'use client';

import Link from 'next/link';
import Nav from '../components/Nav';

const flows = [
  {
    role: 'Contractors',
    goal: 'Fast site fulfilment and repeat procurement',
    steps: [
      'Search materials by urgency and lead-time',
      'Use express cart + PO credit flow for same-day confirmations',
      'Trigger smart reorders from delivered jobs'
    ],
    cta: { href: '/catalog', label: 'Start Contractor Flow' }
  },
  {
    role: 'Builders',
    goal: 'Bulk procurement with cost controls',
    steps: [
      'Generate RFQ from project scale and budget',
      'Compare landed price, GST and logistics in one view',
      'Use dashboard controls for delivery and invoice tracking'
    ],
    cta: { href: '/rfq', label: 'Start Builder Flow' }
  },
  {
    role: 'Architects',
    goal: 'Specification-compliant sourcing with supplier quality fit',
    steps: [
      'Upload BOQ/BOM and extract procurement-ready lines',
      'Match suppliers by quality threshold and city zone',
      'Share AI-generated shortlist and quote rationale'
    ],
    cta: { href: '/ai', label: 'Start Architect Flow' }
  }
];

export default function SolutionsPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Role Workflows</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Contractor, Builder and Architect Journeys</h1>

        <section className="section grid-3">
          {flows.map((flow) => (
            <article key={flow.role} className="glass-card" style={{ padding: '16px' }}>
              <h3>{flow.role}</h3>
              <p className="muted" style={{ marginTop: '6px' }}>{flow.goal}</p>
              <div className="timeline" style={{ marginTop: '10px' }}>
                {flow.steps.map((step, index) => (
                  <div key={step} className="timeline-step"><b>Step {index + 1}</b><span>{step}</span></div>
                ))}
              </div>
              <div className="action-row" style={{ marginTop: '12px' }}>
                <Link className="button primary" href={flow.cta.href}>{flow.cta.label}</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
