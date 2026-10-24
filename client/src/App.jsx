import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Search, Users, Sparkles, Code2, X, CheckCircle2, LoaderCircle } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const samples = [
  { _id:'demo-ai', title:'Build with Generative AI', description:'Move from prompt to prototype in this practical, beginner-friendly AI workshop.', venue:'Innovation Lab · Bengaluru', startsAt:'2026-11-08T10:00:00.000Z', capacity:60, registered:38, remainingSeats:22, tag:'AI & MACHINE LEARNING', color:'violet' },
  { _id:'demo-web', title:'Full-stack Web, from Zero', description:'Understand how modern web apps connect beautiful interfaces to real APIs.', venue:'Tech Studio · Bengaluru', startsAt:'2026-11-14T09:30:00.000Z', capacity:45, registered:29, remainingSeats:16, tag:'WEB DEVELOPMENT', color:'mint' },
  { _id:'demo-cyber', title:'Cybersecurity Essentials', description:'Learn threat modelling, safer coding habits, and the fundamentals of web security.', venue:'Auditorium B · Bengaluru', startsAt:'2026-11-21T14:00:00.000Z', capacity:80, registered:76, remainingSeats:4, tag:'CYBERSECURITY', color:'orange' },
];
const dateLabel = d => new Date(d).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' });
const timeLabel = d => new Date(d).toLocaleTimeString('en-IN',{ hour:'numeric', minute:'2-digit' });
const errorText = e => e?.message || 'Something went wrong. Please try again.';

function EventCard({ event, onRegister }) {
  const full = event.remainingSeats <= 0;
  return <article className={`event-card ${event.color || 'violet'}`}>
    <div className="card-top"><span className="tag">{event.tag || 'TECH WORKSHOP'}</span><span className="card-mark"><Code2 size={19}/></span></div>
    <div className="event-date"><CalendarDays size={15}/>{dateLabel(event.startsAt)} <span className="dot">·</span><Clock3 size={15}/>{timeLabel(event.startsAt)}</div>
    <h3>{event.title}</h3><p className="event-desc">{event.description}</p>
    <div className="event-meta"><MapPin size={16}/><span>{event.venue}</span></div>
    <div className="seats"><div className="seats-line"><span><Users size={15}/> {event.registered || 0} registered</span><strong>{event.remainingSeats} seats left</strong></div><div className="progress"><span style={{width:`${Math.min(100, ((event.registered||0)/event.capacity)*100)}%`}}/></div></div>
    <button className={`register-btn ${full?'disabled':''}`} disabled={full} onClick={() => onRegister(event)}>{full?'Fully booked':'Reserve your seat'} {!full && <ArrowUpRight size={17}/>}</button>
  </article>;
}

function Modal({ event, onClose, onSubmit, busy, message }) {
  const [name,setName] = useState(''); const [email,setEmail] = useState('');
  if (!event) return null;
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <button className="close-btn" onClick={onClose} aria-label="Close"><X size={19}/></button>
    <span className="eyebrow">SAVE YOUR SPOT</span><h2 id="modal-title">{event.title}</h2><p className="modal-sub">{dateLabel(event.startsAt)} · {event.venue}</p>
    {message && <div className={`notice ${message.ok?'success':'error'}`}>{message.ok&&<CheckCircle2 size={17}/>} {message.text}</div>}
    {!message?.ok && <form onSubmit={e=>{e.preventDefault();onSubmit({name,email});}}>
      <label>Your name<input value={name} onChange={e=>setName(e.target.value)} required minLength="2" maxLength="100" placeholder="e.g. Asha Kumar"/></label>
      <label>Email address<input value={email} onChange={e=>setEmail(e.target.value)} required type="email" maxLength="254" placeholder="you@example.com"/></label>
      <p className="privacy-note">Your email is used to reserve your seat and prevent duplicate registrations.</p>
      <button className="primary-btn submit-btn" disabled={busy}>{busy?<><LoaderCircle className="spin" size={17}/> Reserving…</>:'Confirm registration'} {!busy&&<ArrowUpRight size={17}/>}</button>
    </form>}
    {message?.ok && <button className="primary-btn submit-btn" onClick={onClose}>Done <CheckCircle2 size={17}/></button>}
  </section></div>;
}

export default function App() {
  const [events,setEvents] = useState(samples), [query,setQuery] = useState(''), [active,setActive] = useState('All workshops');
  const [selected,setSelected] = useState(null), [busy,setBusy] = useState(false), [message,setMessage] = useState(null);
  const [connected,setConnected] = useState(false), [toast,setToast] = useState('');
  useEffect(()=>{fetch(`${API}/api/events`).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{setEvents(data.map((e,i)=>({...e,color:['violet','mint','orange'][i%3]})));setConnected(true)}).catch(()=>setConnected(false));},[]);
  const visible = useMemo(()=>events.filter(e => `${e.title} ${e.description} ${e.venue} ${e.tag||''}`.toLowerCase().includes(query.toLowerCase()) && (active==='All workshops'||(e.tag||'').toLowerCase().includes(active.toLowerCase()))),[events,query,active]);
  const openRegister = e => {setSelected(e);setMessage(null);};
  async function register(form) {
    if (selected._id.startsWith('demo-')) { setMessage({ok:false,text:'Demo preview only. Start the MERN API and connect MongoDB to save registrations.'}); return; }
    setBusy(true);setMessage(null);
    try {
      const r=await fetch(`${API}/api/events/${selected._id}/registrations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await r.json();if(!r.ok)throw Error(data.error||'Registration failed.');
      setMessage({ok:true,text:'Your seat is reserved. See you there!'});
      const fresh=await fetch(`${API}/api/events`).then(x=>x.json());setEvents(fresh.map((e,i)=>({...e,color:['violet','mint','orange'][i%3]})));
    } catch(e) {setMessage({ok:false,text:errorText(e)});} finally {setBusy(false);}
  }
  const count = events.length;
  return <main className="app-shell">
    <nav className="nav"><a className="brand" href="#"><span className="brand-icon"><Sparkles size={19}/></span>event<span>ease</span></a><div className="nav-right"><a href="#workshops">Explore workshops</a><a className="nav-cta" href="#workshops">Find your next skill <ArrowUpRight size={15}/></a></div></nav>
    <section className="hero"><div className="hero-glow"></div><div className="hero-content"><div className="eyebrow"><span className="live-dot"></span> LEARN SOMETHING THAT MOVES YOU</div><h1>Good ideas start<br/>with <em>showing up.</em></h1><p className="hero-copy">Hands-on workshops. Curious people. Skills you can actually use. Find your next room to grow.</p><a className="primary-btn hero-btn" href="#workshops">Explore workshops <ArrowUpRight size={18}/></a><div className="hero-foot"><div className="avatar-stack"><span>R</span><span>A</span><span>K</span><span>+</span></div><p><strong>Made for curious minds.</strong><br/>Come learn alongside your people.</p></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="art-card"><span className="art-chip">IDEAS → IMPACT</span><div className="art-spark"><Sparkles size={55}/></div><div className="art-card-bottom"><span>YOUR NEXT CHAPTER</span><strong>Starts here.</strong></div></div><div className="floating-note note-top"><span className="note-icon purple"><Code2 size={16}/></span><div><strong>Learn by doing</strong><small>Not just watching.</small></div></div><div className="floating-note note-bottom"><span className="note-icon green"><CheckCircle2 size={17}/></span><div><strong>Seat secured</strong><small>You're on the list.</small></div></div><div className="sparkle sparkle-a">✳</div><div className="sparkle sparkle-b">✦</div></div></section>
    <section className="stats"><div><strong>{String(count).padStart(2,'0')}<span>+</span></strong><small>WORKSHOPS TO EXPLORE</small></div><div><strong>100<span>%</span></strong><small>BUILT AROUND LEARNING</small></div><div><strong>1<span>st</span></strong><small>STEP IS SHOWING UP</small></div><p>Small steps. Big breakthroughs.</p></section>
    <section className="workshops" id="workshops"><div className="section-heading"><div><div className="eyebrow">YOUR NEXT DEEP DIVE</div><h2>Find your <em>workshop.</em></h2><p>Real skills, good people, and a reason to get excited.</p></div><div className="search-box"><Search size={18}/><input aria-label="Search workshops" placeholder="Search workshops..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={15}/></button>}</div></div>
      <div className="filters">{['All workshops','AI & Machine Learning','Web Development','Cybersecurity'].map(t=><button key={t} className={active===t?'filter active':'filter'} onClick={()=>setActive(t)}>{t}</button>)}</div>
      {!connected&&<div className="demo-banner"><span className="demo-pulse"></span> Preview mode · sample workshops shown. Connect the API to enable live registrations.</div>}
      <div className="event-grid">{visible.map(e=><EventCard key={e._id} event={e} onRegister={openRegister}/>)}</div>
      {visible.length===0&&<div className="empty"><Search size={28}/><h3>No workshops found</h3><p>Try a different keyword or category.</p></div>}
    </section>
    <footer><a className="brand" href="#"><span className="brand-icon"><Sparkles size={17}/></span>event<span>ease</span></a><p>Made for people who never stop being curious.</p><span>© 2026 EventEase · Workshop Registration System</span></footer>
    <Modal event={selected} onClose={()=>setSelected(null)} onSubmit={register} busy={busy} message={message}/>
  </main>;
}
