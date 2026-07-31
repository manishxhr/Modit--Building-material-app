'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const workspaces = [
  {
    key: 'planner',
    title: 'Procurement Planner',
    lines: [
      'Upload BOQ and auto-generate material plan',
      'Estimate project cost and optimize quantities',
      'Predict reorder windows by construction phase'
    ]
  },
  {
    key: 'quotes',
    title: 'Quote Analyst',
    lines: [
      'Compare supplier offers side-by-side',
      'Highlight hidden costs and GST impact',
      'AI negotiation strategy with target floor'
    ]
  },
  {
    key: 'tracking',
    title: 'Delivery Control',
    lines: [
      'Track live orders and dispatch status',
      'Predict delay risk by route and supplier',
      'Trigger repeat procurement in one tap'
    ]
  }
];

const intents = [
  'Compare cement suppliers in Noida',
  'Build RFQ for a 6-floor residential project',
  'Read BOQ and estimate cement + steel usage',
  'Track ORD-1004 and summarize delays'
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('planner');
  const [query, setQuery] = useState('');
  const panel = useMemo(() => workspaces.find((item) => item.key === active), [active]);

  useEffect(() => {
    function onOpen(event) {
      const detail = event.detail || {};
      setOpen(true);
      if (detail.mode) setActive(detail.mode);
      if (detail.query) setQuery(detail.query);
    }

    function onClose() {
      setOpen(false);
    }

    window.addEventListener('modit:ai-open', onOpen);
    window.addEventListener('modit:ai-close', onClose);
    return () => {
      window.removeEventListener('modit:ai-open', onOpen);
      window.removeEventListener('modit:ai-close', onClose);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="ai-fab"
        aria-label="Open MODIT AI workspace"
        onClick={() => setOpen((state) => !state)}
      >
        <span className="ai-fab-glow" />
        <span className="ai-fab-core">AI</span>
      </button>

      <aside className={'ai-panel' + (open ? ' ai-panel-open' : '')} aria-hidden={!open}>
        <header className="ai-panel-header">
          <div>
            <p>Agentic AI Workspace</p>
            <h3>MODIT Copilot</h3>
          </div>
          <button type="button" className="ai-close" onClick={() => setOpen(false)}>Close</button>
        </header>

        <div className="ai-tabs" role="tablist" aria-label="AI modes">
          {workspaces.map((item) => (
            <button
              key={item.key}
              className={'ai-tab' + (item.key === active ? ' ai-tab-active' : '')}
              type="button"
              role="tab"
              aria-selected={item.key === active}
              onClick={() => setActive(item.key)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <section className="ai-panel-body">
          <h4>{panel.title}</h4>
          <ul>
            {panel.lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <label htmlFor="aiQuery">Ask MODIT AI</label>
          <input
            id="aiQuery"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type command or use voice procurement"
          />
          <div className="ai-intents">
            {intents.map((item) => (
              <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>
            ))}
          </div>
        </section>

        <footer className="ai-panel-footer">
          <Link href="/ai" onClick={() => setOpen(false)}>Open Full AI Workspace</Link>
          <Link href="/rfq" onClick={() => setOpen(false)}>Generate RFQ</Link>
        </footer>
      </aside>
    </>
  );
}
