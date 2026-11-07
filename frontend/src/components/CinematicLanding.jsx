import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, AudioLines, BookOpen, CheckCircle2, ChevronLeft,
  ChevronRight, CircleDot, Code2, Fingerprint, FolderOpen, Globe2,
  LockKeyhole, ScanLine, Search, ShieldCheck, Sparkles, Terminal, Zap
} from 'lucide-react';
import '../cinematic-kit.css';

const CATEGORY_SYMBOLS = {
  JavaScript: Code2, Databases: FolderOpen, Networking: Globe2,
  Performance: Zap, Concurrency: AudioLines, Deployment: Terminal
};

const VIBE = [
  { number: '01', title: 'Study the scene', body: 'Examine real-looking logs, suspicious code and eyewitness traces.' },
  { number: '02', title: 'Connect the evidence', body: 'Separate the symptoms from the root cause. Every detail matters.' },
  { number: '03', title: 'Close the case', body: 'Make your repair, explain your reasoning and grow your detective record.' }
];

function pad(n) { return String(n).padStart(2, '0'); }

export default function CinematicLanding({ cases = [], progress = {} }) {
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const sceneRef = useRef(null);
  const solved = progress?.solvedCases || [];
  const current = cases[selected] || cases[0];
  const filtered = useMemo(() => cases.filter(item =>
    [item.title, item.category, item.summary, item.id].join(' ').toLowerCase().includes(archiveQuery.toLowerCase())
  ), [cases, archiveQuery]);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const keydown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);

  const moveScene = (event) => {
    if (reducedMotion || !sceneRef.current || event.pointerType === 'touch') return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    sceneRef.current.style.setProperty('--scene-x', `${(x * 20).toFixed(2)}px`);
    sceneRef.current.style.setProperty('--scene-y', `${(y * 14).toFixed(2)}px`);
  };

  const cycle = direction => setSelected(n => (n + direction + cases.length) % cases.length);
  const enter = { opacity: 0, y: reducedMotion ? 0 : 26 };
  const shown = { opacity: 1, y: 0 };

  return <div className="cinematic-site" id="top">
    <div className="cinematic-progress-line" aria-hidden="true" />
    <header className="cinematic-nav">
      <Link to="/" className="cinematic-brand" aria-label="Code Crime Scene homepage" onClick={() => setMenuOpen(false)}>
        <span className="cinematic-brand-icon"><Fingerprint size={23}/></span>
        <span><strong>CODE CRIME SCENE</strong><small>INVESTIGATION DIVISION</small></span>
      </Link>
      <nav className={menuOpen ? 'cinematic-nav-links open' : 'cinematic-nav-links'} aria-label="Main navigation">
        <a href="#case-files" onClick={() => setMenuOpen(false)}>Case Files</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>The Protocol</a>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Command Center</Link>
        <Link className="cinematic-nav-cta" to="/cases" onClick={() => setMenuOpen(false)}>Enter the Archive <ArrowUpRight size={15}/></Link>
      </nav>
      <button className="cinematic-menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={() => setMenuOpen(v => !v)}>
        <span/><span/><span/>
      </button>
    </header>

    <main>
      <section className="cinematic-hero" aria-labelledby="cinematic-title" ref={sceneRef} onPointerMove={moveScene}>
        <div className="cinematic-backdrop" aria-hidden="true" />
        <div className="cinematic-noise" aria-hidden="true" />
        <div className="cinematic-backdrop-shade" aria-hidden="true" />
        <div className="cinematic-hud-left" aria-hidden="true"><span>CLASSIFIED // DIVISION 07</span><span>EST. 2026</span></div>
        <div className="cinematic-hud-right" aria-hidden="true"><span>41° N / INCIDENT INTELLIGENCE</span><span>TRACE // ACTIVE</span></div>
        <div className="cinematic-crosshair crosshair-one" aria-hidden="true">+</div>
        <div className="cinematic-crosshair crosshair-two" aria-hidden="true">+</div>
        <div className="cinematic-crosshair crosshair-three" aria-hidden="true">+</div>

        <div className="cinematic-hero-body">
          <motion.div className="cinematic-hero-copy" initial={enter} animate={shown} transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}>
            <p className="cinematic-overline"><span className="cinematic-live-dot"/> THE DIGITAL DETECTIVE EXPERIENCE <span className="cinematic-overline-rule"/></p>
            <div className="cinematic-title-wrap">
              <span className="cinematic-outline-number" aria-hidden="true">07</span>
              <h1 id="cinematic-title">Every bug<br/>leaves <em>a trail.</em></h1>
            </div>
            <p className="cinematic-intro">A mysterious failure. A trail of evidence. One mind that can connect it all. Enter a cinematic world where code becomes a crime scene—and you become the detective.</p>
            <div className="cinematic-hero-actions">
              <Link className="cinematic-button-primary" to="/cases"><span className="cinematic-button-icon"><Fingerprint size={19}/></span><span>Begin Investigation<small>OPEN YOUR FIRST CASE</small></span><ArrowUpRight size={19}/></Link>
              <Link className="cinematic-button-secondary" to="/dashboard">Enter Command Center <ArrowRight size={17}/></Link>
            </div>
            <div className="cinematic-microline"><span><ShieldCheck size={15}/> {pad(cases.length)} OPEN DOSSIERS</span><i/><span><CheckCircle2 size={15}/> {pad(solved.length)} RESOLVED</span><i/><span><Sparkles size={15}/> YOUR STORY STARTS HERE</span></div>
          </motion.div>

          <motion.div className="cinematic-feature-dossier" initial={{ opacity: 0, x: reducedMotion ? 0 : 35 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2, duration: .9 }}>
            <div className="cinematic-dossier-upper"><span><CircleDot size={13}/> LIVE CASE FEED</span><span className="cinematic-signal"><i/><i/><i/></span></div>
            <div className="cinematic-dossier-graphic"><span className="cinematic-roundel"><ScanLine size={53} strokeWidth={1}/></span><div className="cinematic-orbit orbit-one"/><div className="cinematic-orbit orbit-two"/><div className="cinematic-orbit orbit-three"/></div>
            <div className="cinematic-dossier-main"><div className="cinematic-dossier-id">FILE // {current?.id || 'CCS-001'}</div>
              <AnimatePresence mode="wait"><motion.div key={current?.id || 'none'} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.2}}><h2>{current?.title || 'Awaiting your first case'}</h2><p>{current?.summary || 'Case files will appear here when your archive is ready.'}</p></motion.div></AnimatePresence>
              <div className="cinematic-dossier-meta"><span>{current?.category || 'UNKNOWN'}</span><span>{current?.difficulty || 'RESTRICTED'}</span><span>{current?.xp || 0} XP</span></div>
            </div>
            <div className="cinematic-dossier-footer"><div className="cinematic-dossier-nav"><button type="button" onClick={() => cases.length && cycle(-1)} disabled={cases.length < 2} aria-label="Previous case"><ChevronLeft size={18}/></button><span>{pad(cases.length ? selected+1 : 0)} <b>/</b> {pad(cases.length)}</span><button type="button" onClick={() => cases.length && cycle(1)} disabled={cases.length < 2} aria-label="Next case"><ChevronRight size={18}/></button></div><Link to={current ? `/case/${current.id}` : '/cases'}>OPEN DOSSIER <ArrowUpRight size={16}/></Link></div>
          </motion.div>
        </div>
        <div className="cinematic-hero-bottom"><div className="cinematic-time"><span className="cinematic-live-dot"/> HEADQUARTERS ONLINE <b>{clock.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b></div><a href="#case-files" className="cinematic-scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a><div className="cinematic-coordinate">DIVISION // {String(cases.length).padStart(2, '0')} FILES</div></div>
      </section>

      <section className="cinematic-archive" id="case-files" aria-labelledby="cinematic-archive-title">
        <div className="cinematic-section-top"><span className="cinematic-section-eyebrow">01 / THE ARCHIVE</span><span className="cinematic-section-counter">CONFIDENTIAL DATABASE · {pad(cases.length)} INCIDENTS</span></div>
        <div className="cinematic-section-heading"><div><h2 id="cinematic-archive-title">The case <em>files.</em></h2><p>Pick a mystery. Study the evidence. Every line of code has a story to tell.</p></div><label className="cinematic-archive-search"><Search size={17}/><input aria-label="Search case files" placeholder="Search investigations..." value={archiveQuery} onChange={e => setArchiveQuery(e.target.value)}/><span>⌕</span></label></div>
        <div className="cinematic-file-grid">
          {filtered.map((item, i) => {
            const Symbol = CATEGORY_SYMBOLS[item.category] || LockKeyhole;
            const done = solved.includes(item.id);
            return <motion.div key={item.id} className="cinematic-file-card" initial={{opacity:0,y:reducedMotion ? 0 : 14}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.4,delay:Math.min(i,5)*.06}}>
              <Link to={`/case/${item.id}`} className="cinematic-file-inner" aria-label={`Open ${item.title}`}>
                <div className="cinematic-file-card-top"><span>{item.id} / {item.category.toUpperCase()}</span><ArrowUpRight size={18}/></div>
                <div className="cinematic-file-emblem"><Symbol size={28} strokeWidth={1.4}/><span/></div>
                <span className="cinematic-file-label">{done ? 'CASE CLOSED' : 'ACTIVE INVESTIGATION'}</span>
                <h3>{item.title}</h3><p>{item.summary}</p>
                <div className="cinematic-file-card-bottom"><span>{item.difficulty?.toUpperCase()} · {item.duration}</span><strong>{done ? 'SOLVED' : `${item.xp} XP`}</strong></div>
              </Link>
            </motion.div>;
          })}
        </div>
        {!filtered.length && <div className="cinematic-no-results"><Search size={25}/><h3>No dossiers match that search.</h3><button type="button" onClick={() => setArchiveQuery('')}>CLEAR SEARCH</button></div>}
        <Link className="cinematic-archive-all" to="/cases">ACCESS THE FULL ARCHIVE <ArrowRight size={18}/></Link>
      </section>

      <section className="cinematic-protocol" id="how-it-works" aria-labelledby="cinematic-protocol-title"><div className="cinematic-protocol-intro"><span className="cinematic-section-eyebrow">02 / FIELD OPERATIONS</span><h2 id="cinematic-protocol-title">Truth is never<br/><em>an accident.</em></h2><p>Follow the investigator's protocol. Learn the art of debugging by uncovering the story behind each failure.</p><Link to="/dashboard">VISIT YOUR COMMAND CENTER <ArrowRight size={17}/></Link></div><div className="cinematic-protocol-list">{VIBE.map(step => <div className="cinematic-protocol-item" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><ArrowUpRight size={19}/></div>)}</div></section>
    </main>
    <footer className="cinematic-footer"><div><Fingerprint size={20}/><strong>CODE CRIME SCENE</strong><span>THE EVIDENCE IS WAITING.</span></div><div><Link to="/dashboard">COMMAND CENTER</Link><Link to="/cases">CASE FILES</Link><a href="#top">BACK TO TOP ↑</a></div><small>© {clock.getFullYear()} INVESTIGATION DIVISION</small></footer>
  </div>;
}
