'use client';

import { useState } from 'react';
import Nav from '../components/Nav';

const inr = (numberValue) => 'Rs ' + Number(numberValue || 0).toLocaleString('en-IN');

function scoreBoqText(text) {
  const lines = text.split(/\r?\n|,|;/).map((line) => line.trim()).filter(Boolean);
  const numericLines = lines.filter((line) => /\d/.test(line)).length;
  const materialLines = lines.filter((line) => /(cement|steel|sand|aggregate|tile|brick|block|plumbing|electrical|wire|plywood|cpvc)/i.test(line)).length;
  const raw = Math.round((numericLines * 45 + materialLines * 55) / Math.max(lines.length, 1));
  const score = Math.max(35, Math.min(99, raw));
  const level = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
  return { score, level, lines: lines.length };
}

export default function AIPage() {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);

  const [boqText, setBoqText] = useState('');
  const [boq, setBoq] = useState(null);
  const [boqLoading, setBoqLoading] = useState(false);
  const [boqError, setBoqError] = useState('');
  const [boqFileName, setBoqFileName] = useState('');

  const [voice, setVoice] = useState('Compare cement and steel pricing for Noida');
  const [voiceResponse, setVoiceResponse] = useState('');

  const [negSupplierId, setNegSupplierId] = useState('');
  const [negTargetPrice, setNegTargetPrice] = useState('');
  const [negResult, setNegResult] = useState(null);
  const [negLoading, setNegLoading] = useState(false);

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const [matchCity, setMatchCity] = useState('Noida');
  const [matchCategory, setMatchCategory] = useState('Cement');
  const [matchMaxLeadTime, setMatchMaxLeadTime] = useState('36');
  const [matchQuality, setMatchQuality] = useState('A');

  async function submitRun(event) {
    event.preventDefault();
    setLoading(true);
    setNegResult(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/workflow/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setRun(data);
      if (data?.rfq?.quotes?.[0]) {
        setNegSupplierId(String(data.rfq.quotes[0].supplierId));
        setNegTargetPrice(String(data.rfq.quotes[0].quote));
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadBoqFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBoqText(text);
    setBoqFileName(file.name);
  }

  async function readBoq(event) {
    event.preventDefault();
    setBoqLoading(true);
    setBoqError('');
    try {
      const response = await fetch('/api/workflow/boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: boqText })
      });
      const data = await response.json();
      if (!response.ok) {
        setBoq(null);
        setBoqError(data.error || 'Could not process BOQ.');
        return;
      }
      setBoq(data);
    } finally {
      setBoqLoading(false);
    }
  }

  async function runVoice(event) {
    event.preventDefault();
    const response = await fetch('/api/workflow/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: voice })
    });
    const data = await response.json();
    setVoiceResponse(data.reply || data.error || 'No response');
  }

  async function runNegotiation(event) {
    event.preventDefault();
    if (!run?.rfq?.id) return;
    setNegLoading(true);
    try {
      const response = await fetch('/api/workflow/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: run.rfq.id,
          supplierId: Number(negSupplierId),
          targetPrice: Number(negTargetPrice)
        })
      });
      setNegResult(await response.json());
    } finally {
      setNegLoading(false);
    }
  }

  async function runVendorMatch(event) {
    event.preventDefault();
    setMatchLoading(true);
    try {
      const response = await fetch('/api/vendors/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: matchCity,
          category: matchCategory,
          maxLeadTime: Number(matchMaxLeadTime),
          quality: matchQuality
        })
      });
      setMatchResult(await response.json());
    } finally {
      setMatchLoading(false);
    }
  }

  const boqScore = scoreBoqText(boqText);

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">Agentic AI Workspace</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>AI-First Procurement Operations</h1>
        <p className="muted">Recommend materials, compare quotes, read BOQ, generate RFQ, negotiate, track and reorder.</p>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={submitRun}>
            <h3>Project Material Planner</h3>
            <div className="form-field"><label>Project Name</label><input name="project" defaultValue="South Delhi Residency" required /></div>
            <div className="grid-2">
              <div className="form-field"><label>Project Type</label><select name="projectType"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="fitout">Fit-out</option></select></div>
              <div className="form-field"><label>City</label><select name="city"><option>Delhi</option><option>Gurugram</option><option>Noida</option><option>Faridabad</option><option>Ghaziabad</option></select></div>
              <div className="form-field"><label>Area (sq ft)</label><input name="areaSqft" type="number" defaultValue="3200" min="200" /></div>
              <div className="form-field"><label>Floors</label><input name="floors" type="number" defaultValue="4" min="1" /></div>
            </div>
            <div className="form-field"><label>Budget</label><input name="budget" type="number" defaultValue="850000" /></div>
            <button className="button primary" type="submit">{loading ? 'Generating...' : 'Generate Procurement Plan'}</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>AI Plan Result</h3>
            {!run && <p className="muted">Generate a plan to see recommended materials, supplier quotes and estimated cost.</p>}
            {run && (
              <>
                <p className="muted">{run.summary} - Total {run.total}</p>
                <div className="timeline">
                  {run.rfq.materials.map((item) => (
                    <div className="timeline-step" key={item.name}><b>{item.name}</b><span>{item.quantity} - {inr(item.estimate)}</span></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={readBoq}>
            <h3>BOQ Reader</h3>
            <div className="form-field">
              <label>Paste BOQ / Material Requirement</label>
              <textarea
                value={boqText}
                onChange={(event) => setBoqText(event.target.value)}
                placeholder="40 bags OPC cement, 2 tonnes steel, 300 sq ft tiles"
              />
            </div>
            <div className="form-field">
              <label>Upload BOQ file (txt, csv, md)</label>
              <input type="file" accept=".txt,.csv,.md" onChange={loadBoqFile} />
              {boqFileName && <p className="muted" style={{ margin: '6px 0 0' }}>Loaded file: {boqFileName}</p>}
            </div>
            <div className="timeline" style={{ marginBottom: '10px' }}>
              <div className="timeline-step"><b>Input confidence</b><span>{boqScore.level} ({boqScore.score}%)</span></div>
              <div className="timeline-step"><b>Detected BOQ lines</b><span>{boqScore.lines}</span></div>
            </div>
            <button className="button primary" type="submit">{boqLoading ? 'Analyzing...' : 'Analyze BOQ'}</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>BOQ Output</h3>
            {!boq && !boqError && <p className="muted">Run BOQ analysis to see extracted materials, parse confidence and cost estimate.</p>}
            {boqError && <p className="muted">{boqError}</p>}
            {boq && boq.items && (
              <>
                <p className="muted">{boq.bomId} - Estimated total {boq.total}</p>
                <div className="timeline" style={{ marginBottom: '10px' }}>
                  <div className="timeline-step"><b>Recognized materials</b><span>{boq.items.length}</span></div>
                  <div className="timeline-step"><b>Extraction quality</b><span>{boqScore.level} ({boqScore.score}%)</span></div>
                </div>
                <div className="timeline">
                  {boq.items.map((item) => (
                    <div key={item.id} className="timeline-step">
                      <div>
                        <b>{item.name}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>From line: {item.sourceLine}</p>
                      </div>
                      <span>{item.quantity} - {inr(item.estimate)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runNegotiation}>
            <h3>AI Negotiation Simulator</h3>
            {!run?.rfq && <p className="muted">Generate a procurement plan first to create an RFQ with supplier quotes.</p>}
            {run?.rfq && (
              <>
                <p className="muted">Working on {run.rfq.id} for {run.rfq.project}.</p>
                <div className="form-field">
                  <label>Supplier quote</label>
                  <select value={negSupplierId} onChange={(event) => setNegSupplierId(event.target.value)}>
                    {run.rfq.quotes.map((quote) => (
                      <option key={quote.supplierId} value={quote.supplierId}>
                        {quote.supplier} - {inr(quote.quote)} - ETA {quote.delivery}h
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Target negotiated price</label>
                  <input type="number" value={negTargetPrice} onChange={(event) => setNegTargetPrice(event.target.value)} min="1" required />
                </div>
                <button className="button primary" type="submit">{negLoading ? 'Negotiating...' : 'Run Negotiation'}</button>
              </>
            )}
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Negotiation Rationale</h3>
            {!negResult && <p className="muted">Run negotiation to see accepted, countered or floor-held outcomes with reasoning.</p>}
            {negResult && (
              <>
                <div className="timeline" style={{ marginBottom: '10px' }}>
                  <div className="timeline-step"><b>Outcome</b><span>{String(negResult.outcome || 'unknown').toUpperCase()}</span></div>
                  <div className="timeline-step"><b>Counter price</b><span>{inr(negResult.counter)}</span></div>
                </div>
                <article className="info-card" style={{ boxShadow: 'none' }}>
                  <h4>AI explanation</h4>
                  <p className="muted">{negResult.message || negResult.error || 'No explanation available.'}</p>
                </article>
              </>
            )}
          </div>
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runVendorMatch}>
            <h3>Vendor Match Intelligence</h3>
            <p className="muted">Shortlist suppliers by city, category, lead-time and quality threshold.</p>
            <div className="grid-2">
              <div className="form-field">
                <label>City</label>
                <select value={matchCity} onChange={(event) => setMatchCity(event.target.value)}>
                  <option>Delhi</option><option>Gurugram</option><option>Noida</option><option>Faridabad</option><option>Ghaziabad</option><option>Greater Noida</option>
                </select>
              </div>
              <div className="form-field">
                <label>Category</label>
                <select value={matchCategory} onChange={(event) => setMatchCategory(event.target.value)}>
                  <option>Cement</option><option>Steel</option><option>Sand & Aggregate</option><option>Bricks & Blocks</option><option>Tiles & Finishes</option><option>Plumbing</option><option>Electrical</option>
                </select>
              </div>
              <div className="form-field">
                <label>Max lead time (hours)</label>
                <input type="number" min="6" value={matchMaxLeadTime} onChange={(event) => setMatchMaxLeadTime(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Minimum quality</label>
                <select value={matchQuality} onChange={(event) => setMatchQuality(event.target.value)}>
                  <option value="B+">B+</option>
                  <option value="A">A</option>
                  <option value="A+">A+</option>
                </select>
              </div>
            </div>
            <button className="button primary" type="submit">{matchLoading ? 'Scoring vendors...' : 'Find Best Vendors'}</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Match Rationale</h3>
            {!matchResult && <p className="muted">Run vendor match to inspect score composition and shortlist quality.</p>}
            {matchResult && (
              <>
                <p className="muted">Criteria: {matchResult.criteria.city}, {matchResult.criteria.category}, max {matchResult.criteria.maxLeadTime}h, quality {matchResult.criteria.quality}+</p>
                {matchResult.matches?.length === 0 && <article className="info-card">No suppliers match this filter. Relax lead-time or quality threshold.</article>}
                <div className="timeline">
                  {matchResult.matches?.slice(0, 4).map((item) => (
                    <div className="timeline-step" key={item.id}>
                      <div>
                        <b>{item.name}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>
                          {item.city} | Rating {item.rating} | Delivery {item.delivery}h | Quality {item.quality}
                        </p>
                      </div>
                      <span>{item.matchScore}% match</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runVoice}>
            <h3>Voice and Command AI</h3>
            <div className="form-field"><label>Command</label><input value={voice} onChange={(event) => setVoice(event.target.value)} /></div>
            <button className="button primary" type="submit">Run Command</button>
          </form>
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Assistant Response</h3>
            <p className="muted">{voiceResponse || 'Ask to compare quotes, track order, or repeat procurement.'}</p>
          </div>
        </section>
      </main>
    </>
  );
}
