'use client';

import { useState } from 'react';
import Nav from '../components/Nav';

const inr = (numberValue) => 'Rs ' + Number(numberValue || 0).toLocaleString('en-IN');

export default function AIPage() {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boqText, setBoqText] = useState('');
  const [boq, setBoq] = useState(null);
  const [voice, setVoice] = useState('Compare cement and steel pricing for Noida');
  const [voiceResponse, setVoiceResponse] = useState('');

  async function submitRun(event) {
    event.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/workflow/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setRun(await response.json());
    setLoading(false);
  }

  async function readBoq(event) {
    event.preventDefault();
    const response = await fetch('/api/workflow/boq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: boqText })
    });
    setBoq(await response.json());
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
            <button className="button primary" type="submit">Analyze BOQ</button>
          </form>

          <div className="glass-card" style={{ padding: '16px' }}>
            <h3>BOQ Output</h3>
            {!boq && <p className="muted">Run BOQ analysis to see extracted materials and cost estimate.</p>}
            {boq && boq.error && <p className="muted">{boq.error}</p>}
            {boq && boq.items && (
              <>
                <p className="muted">{boq.bomId} - Estimated total {boq.total}</p>
                <div className="timeline">
                  {boq.items.map((item) => (
                    <div key={item.id} className="timeline-step"><b>{item.name}</b><span>{item.quantity} - {inr(item.estimate)}</span></div>
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
