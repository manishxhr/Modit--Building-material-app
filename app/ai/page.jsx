'use client';
import { useState } from 'react';
import Nav from '../components/Nav';

const inr = n => '₹' + Number(n).toLocaleString('en-IN');

export default function AI() {
  const [run, setRun] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [negotiating, setNegotiating] = useState(null);
  const [negResult, setNegResult] = useState({});

  const [boqText, setBoqText] = useState('');
  const [boqResult, setBoqResult] = useState(null);
  const [boqLoading, setBoqLoading] = useState(false);

  const [command, setCommand] = useState('');
  const [chat, setChat] = useState([]);
  const [listening, setListening] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMessage('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/workflow/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setRun(await r.json());
    setLoading(false);
  }

  async function accept(supplierId) {
    const r = await fetch(`/api/rfqs/${run.rfq.id}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ supplierId }) });
    const d = await r.json();
    setMessage(r.ok ? `${d.message} Order ${d.order.id} is now visible in tracking.` : d.error);
  }

  async function negotiate(supplierId, e) {
    e.preventDefault();
    const target = Number(new FormData(e.currentTarget).get('target'));
    const r = await fetch('/api/workflow/negotiate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfqId: run.rfq.id, supplierId, targetPrice: target })
    });
    const d = await r.json();
    setNegResult(prev => ({ ...prev, [supplierId]: d }));
  }

  async function readBoq(e) {
    e.preventDefault();
    setBoqLoading(true); setBoqResult(null);
    const r = await fetch('/api/workflow/boq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: boqText }) });
    setBoqResult(await r.json());
    setBoqLoading(false);
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBoqText(String(ev.target.result || ''));
    reader.readAsText(file);
  }

  async function sendCommand(text) {
    const value = text ?? command;
    if (!value.trim()) return;
    setChat(prev => [...prev, { from: 'user', text: value }]);
    setCommand('');
    const r = await fetch('/api/workflow/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: value }) });
    const d = await r.json();
    setChat(prev => [...prev, { from: 'ai', text: d.reply || d.error }]);
  }

  function startVoice() {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { sendCommand(command || 'compare cement suppliers in Gurugram'); return; }
    const rec = new SR();
    rec.lang = 'en-IN'; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = ev => sendCommand(ev.results[0][0].transcript);
    rec.start();
  }

  return <>
    <Nav />
    <main className="app">
      <section className="apphero">
        <div>
          <p className="eyebrow">MODIT AI COPILOT / ACTIONABLE PROCUREMENT</p>
          <h1>From requirement<br /><i>to order-ready.</i></h1>
          <p>MODIT reads your project context, builds a material plan and presents supplier trade-offs before a purchase order is created.</p>
        </div>
        <div className="aihint"><b>AI is decision support, not autopilot.</b><br />Every supplier selection and order remains user-approved and auditable.</div>
      </section>

      {/* 1. Project material planner */}
      <section className="workflow">
        <form onSubmit={submit}>
          <p className="eyebrow">1 / SITE BRIEF</p>
          <label>Project name<input name="project" required defaultValue="North Tower Residences" /></label>
          <div className="twocol">
            <label>Project type<select name="projectType"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="fitout">Fit-out</option></select></label>
            <label>Delivery zone<select name="city"><option>Gurugram</option><option>Noida</option><option>Delhi</option><option>Faridabad</option><option>Ghaziabad</option><option>Greater Noida</option></select></label>
            <label>Built-up area<input name="areaSqft" type="number" min="200" defaultValue="1800" /></label>
            <label>Floors<input name="floors" type="number" min="1" defaultValue="2" /></label>
          </div>
          <label>BOQ / requirement notes<textarea name="requirements" defaultValue="Structure stage: cement, TMT steel, M-sand and AAC blocks. Delivery inside 48 hours." /></label>
          <label>Working budget (₹)<input name="budget" type="number" defaultValue="500000" /></label>
          <button className="button primary">{loading ? 'Analysing site…' : 'Build AI procurement plan →'}</button>
        </form>
        <div className="results">
          {!run && !loading && <div className="empty"><b>Ready to analyse.</b><p>Submit the site brief to generate a live BOM and comparison.</p></div>}
          {loading && <div className="empty"><b>Structuring the requirement…</b><p>Checking material quantities and supplier fit.</p></div>}
          {run && <>
            <p className="eyebrow">2 / MATERIAL PLAN · {run.rfq.id}</p>
            <h2>{run.summary}</h2>
            <p className="muted">Estimated material value: <b>{run.total}</b></p>
            <div className="bom">{run.rfq.materials.map(x => <div key={x.name}><span>{x.name}</span><b>{x.quantity}</b><small>{inr(x.estimate)}</small></div>)}</div>

            <p className="eyebrow">3 / RANKED OFFERS · negotiate or accept</p>
            <div className="offers negofers">
              {run.rfq.quotes.map((x, i) => (
                <article key={x.supplierId} className="negcard">
                  <div className="offerrow">
                    <div><b>{x.supplier}</b><small>{x.reason} · {x.delivery}h delivery · ★ {x.rating}</small></div>
                    <strong>{inr(x.quote)}</strong>
                    <button className={i === 0 ? 'button primary' : 'button'} onClick={() => accept(x.supplierId)}>Select</button>
                  </div>
                  {negotiating === x.supplierId ? (
                    <form className="negform" onSubmit={e => negotiate(x.supplierId, e)}>
                      <input name="target" type="number" placeholder="Your target price (₹)" required />
                      <button className="button">Negotiate →</button>
                      <button type="button" className="linkbtn" onClick={() => setNegotiating(null)}>cancel</button>
                    </form>
                  ) : (
                    <button type="button" className="linkbtn" onClick={() => setNegotiating(x.supplierId)}>💬 AI-negotiate this price</button>
                  )}
                  {negResult[x.supplierId] && <p className="notice small">{negResult[x.supplierId].message || negResult[x.supplierId].error}</p>}
                </article>
              ))}
            </div>
            {message && <p className="notice">{message}</p>}
          </>}
        </div>
      </section>

      {/* 2. BOQ / BOM reader */}
      <section className="workflow" style={{ marginTop: 22 }}>
        <form onSubmit={readBoq}>
          <p className="eyebrow">AI BOQ / BOM READER</p>
          <p className="muted" style={{ margin: '0 0 12px' }}>Paste a requirement note or upload a .txt/.csv BOQ — MODIT extracts materials, quantities and pricing.</p>
          <label>Upload BOQ file<input type="file" accept=".txt,.csv" onChange={onFile} /></label>
          <label>…or paste requirement text
            <textarea value={boqText} onChange={e => setBoqText(e.target.value)} placeholder="e.g. 40 bags OPC cement, 2 tonnes TMT steel, 500 sq ft vitrified tiles, CPVC plumbing kit" />
          </label>
          <button className="button primary">{boqLoading ? 'Reading BOQ…' : 'Build material list →'}</button>
        </form>
        <div className="results">
          {!boqResult && !boqLoading && <div className="empty"><b>No BOM yet.</b><p>Upload or paste a requirement to generate one.</p></div>}
          {boqLoading && <div className="empty"><b>Parsing requirement…</b><p>Matching line items to the material catalog.</p></div>}
          {boqResult && (boqResult.error
            ? <p className="notice">{boqResult.error}</p>
            : <>
              <p className="eyebrow">{boqResult.bomId}</p>
              <h2>{boqResult.items.length} materials identified</h2>
              <p className="muted">Estimated total: <b>{boqResult.total}</b></p>
              <div className="bom">{boqResult.items.map(x => <div key={x.id}><span>{x.name}</span><b>{x.quantity} {x.unit.split(' ')[0]}</b><small>{inr(x.estimate)}</small></div>)}</div>
            </>)}
        </div>
      </section>

      {/* 3. Voice / command assistant */}
      <section className="workflow" style={{ marginTop: 22 }}>
        <div className="voicepanel">
          <p className="eyebrow">VOICE / COMMAND ASSISTANT</p>
          <p className="muted" style={{ margin: '0 0 12px' }}>Speak or type — search materials, compare vendors by zone, track an order, or trigger a repeat procurement.</p>
          <div className="chatlog">
            {chat.length === 0 && <p className="muted">Try: “Compare cement suppliers in Noida” or “Track my last order”</p>}
            {chat.map((m, i) => <p key={i} className={'bubble ' + m.from}>{m.text}</p>)}
          </div>
          <div className="chips">
            {['Compare cement suppliers in Gurugram', 'Track my last order', 'Reorder for North Tower', 'Find TMT steel pricing'].map(c => (
              <button key={c} type="button" className="chip chipbtn" onClick={() => sendCommand(c)}>{c}</button>
            ))}
          </div>
          <form className="voiceinput" onSubmit={e => { e.preventDefault(); sendCommand(); }}>
            <input value={command} onChange={e => setCommand(e.target.value)} placeholder="Type a command…" />
            <button type="button" className={'mic' + (listening ? ' live' : '')} onClick={startVoice} aria-label="Voice input">🎙</button>
            <button className="button primary">Send</button>
          </form>
        </div>
      </section>
    </main>
  </>;
}
