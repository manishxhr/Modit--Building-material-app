'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { categories } from '../components/modit-data';

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
  const router = useRouter();
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
  const [matchQuantity, setMatchQuantity] = useState('100');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [autopilotMode, setAutopilotMode] = useState('assist');
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [autopilotResult, setAutopilotResult] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognition));
  }, []);

  async function createPlan(payload) {
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
    return data;
  }

  async function runBoqText(text) {
    setBoqLoading(true);
    setBoqError('');
    try {
      const response = await fetch('/api/workflow/boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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

  async function runVendorMatchPayload(payload) {
    setMatchLoading(true);
    try {
      const response = await fetch('/api/vendors/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setMatchResult(await response.json());
    } finally {
      setMatchLoading(false);
    }
  }

  async function submitRun(event) {
    event.preventDefault();
    setLoading(true);
    setNegResult(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await createPlan(payload);
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
    await runBoqText(boqText);
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
    await executeVoiceAction(data);
  }

  async function executeVoiceAction(data) {
    if (data.action === 'reorder' && data.orderId) {
      const response = await fetch('/api/orders/' + data.orderId + '/reorder', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        setVoiceResponse((data.reply || '') + ' Reorder executed: ' + (result.message || 'success'));
      }
      return;
    }

    if (data.action === 'compare' && Array.isArray(data.matches) && data.matches.length > 0) {
      setMatchResult({
        criteria: { city: matchCity, category: matchCategory, maxLeadTime: Number(matchMaxLeadTime), quality: matchQuality },
        matches: data.matches
      });
      return;
    }

    if (data.action === 'track') {
      router.push('/orders');
    }
  }

  function startVoiceCapture() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceResponse('Voice capture is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setVoice(transcript);
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceResponse('Unable to capture voice input. Please try again.');
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  async function runAutopilot(event) {
    event.preventDefault();
    setAutopilotLoading(true);
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget));
      payload.execute = autopilotMode === 'execute';
      const response = await fetch('/api/workflow/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setAutopilotResult(data);
    } finally {
      setAutopilotLoading(false);
    }
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
    await runVendorMatchPayload({
      city: matchCity,
      category: matchCategory,
      maxLeadTime: Number(matchMaxLeadTime),
      quality: matchQuality,
      quantity: Number(matchQuantity)
    });
  }

  async function runBoqDemo() {
    const demoText = [
      '65 bags OPC cement',
      '3 tonnes TMT steel',
      '1 truck m-sand',
      '280 sq ft vitrified tiles'
    ].join('\n');
    setBoqText(demoText);
    setBoqFileName('Demo BOQ Scenario');
    await runBoqText(demoText);
  }

  async function runNegotiationDemo() {
    setNegResult(null);
    let localRun = run;
    if (!localRun?.rfq?.id) {
      const demoPayload = {
        project: 'Demo Tower Phase 1',
        projectType: 'commercial',
        city: 'Noida',
        areaSqft: 5400,
        floors: 6,
        budget: 1400000
      };
      localRun = await createPlan(demoPayload);
    }
    const firstQuote = localRun?.rfq?.quotes?.[0];
    if (!firstQuote) return;
    const target = Math.round(firstQuote.quote * 0.93);
    setNegSupplierId(String(firstQuote.supplierId));
    setNegTargetPrice(String(target));
    setNegLoading(true);
    try {
      const response = await fetch('/api/workflow/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: localRun.rfq.id,
          supplierId: firstQuote.supplierId,
          targetPrice: target
        })
      });
      setNegResult(await response.json());
    } finally {
      setNegLoading(false);
    }
  }

  async function runVendorMatchDemo() {
    const payload = {
      city: 'Noida',
      category: 'Cement',
      maxLeadTime: 36,
      quality: 'A',
      quantity: 100
    };
    setMatchCity(payload.city);
    setMatchCategory(payload.category);
    setMatchMaxLeadTime(String(payload.maxLeadTime));
    setMatchQuality(payload.quality);
    setMatchQuantity(String(payload.quantity));
    await runVendorMatchPayload(payload);
  }

  const boqScore = scoreBoqText(boqText);

  return (
    <>
      <Nav />
      <main className="page">
        <p className="eyebrow">MODIT AI Workspace</p>
        <h1 className="headline" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>MODIT AI Procurement Operations</h1>
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
            <div className="action-row" style={{ marginTop: 0, marginBottom: '10px' }}>
              <button type="button" className="button" onClick={runBoqDemo}>Load and Run Sample BOQ</button>
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
                <div className="action-row" style={{ marginTop: '10px' }}>
                  <button type="button" className="button" onClick={runNegotiationDemo}>Run One-Click Demo Negotiation</button>
                </div>
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
                  {categories.map((item) => <option key={item.key}>{item.name}</option>)}
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
              <div className="form-field">
                <label>Quantity</label>
                <input type="number" min="1" value={matchQuantity} onChange={(event) => setMatchQuantity(event.target.value)} />
              </div>
            </div>
            <button className="button primary" type="submit">{matchLoading ? 'Scoring vendors...' : 'Find Best Vendors'}</button>
            <div className="action-row" style={{ marginTop: '10px' }}>
              <button type="button" className="button" onClick={runVendorMatchDemo}>Run One-Click Vendor Match Demo</button>
            </div>
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
            <h3>Voice and Command MODIT AI</h3>
            <div className="form-field"><label>Command</label><input value={voice} onChange={(event) => setVoice(event.target.value)} /></div>
            <div className="action-row" style={{ marginTop: 0 }}>
              <button className="button primary" type="submit">Run Command</button>
              <button className="button" type="button" onClick={startVoiceCapture} disabled={!speechSupported || listening}>
                {listening ? 'Listening...' : 'Capture Voice'}
              </button>
            </div>
            {!speechSupported && <p className="muted" style={{ marginTop: '8px' }}>Voice capture requires browser SpeechRecognition support.</p>}
          </form>
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Assistant Response</h3>
            <p className="muted">{voiceResponse || 'Ask to compare quotes, track order, or repeat procurement.'}</p>
          </div>
        </section>

        <section className="section grid-2">
          <form className="glass-card" style={{ padding: '16px' }} onSubmit={runAutopilot}>
            <h3>Agentic Autopilot</h3>
            <p className="muted">One run can search suppliers, create RFQ, negotiate, and optionally place the order.</p>
            <div className="form-field"><label>Project</label><input name="project" defaultValue="Noida Tower Autopilot" required /></div>
            <div className="grid-2">
              <div className="form-field"><label>Project Type</label><select name="projectType"><option value="residential">Residential</option><option value="commercial">Commercial</option></select></div>
              <div className="form-field"><label>City</label><select name="city"><option>Delhi</option><option>Gurugram</option><option>Noida</option><option>Faridabad</option><option>Ghaziabad</option><option>Greater Noida</option></select></div>
              <div className="form-field"><label>Area (sq ft)</label><input name="areaSqft" type="number" defaultValue="3800" min="200" /></div>
              <div className="form-field"><label>Budget</label><input name="budget" type="number" defaultValue="1100000" min="100000" /></div>
            </div>
            <div className="form-field"><label>Mode</label><select value={autopilotMode} onChange={(event) => setAutopilotMode(event.target.value)}><option value="assist">Assist only</option><option value="execute">Execute and place order</option></select></div>
            <button className="button primary" type="submit">{autopilotLoading ? 'Running...' : 'Run Autopilot'}</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>Autopilot Timeline</h3>
            {!autopilotResult && <p className="muted">Run autopilot to see end-to-end procurement steps with negotiated output.</p>}
            {autopilotResult && (
              <>
                <p className="muted">{autopilotResult.summary}</p>
                <div className="timeline">
                  {(autopilotResult.timeline || []).map((item) => (
                    <div key={item.step + item.at} className="timeline-step">
                      <div>
                        <b>{item.step}</b>
                        <p className="muted" style={{ margin: '4px 0 0' }}>{item.detail}</p>
                      </div>
                      <span>{new Date(item.at).toLocaleTimeString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                {autopilotResult.order && (
                  <article className="info-card" style={{ marginTop: '10px' }}>
                    <h4>{autopilotResult.order.id}</h4>
                    <p className="muted">Order placed with {autopilotResult.order.supplier} for {inr(autopilotResult.order.amount)}.</p>
                  </article>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
