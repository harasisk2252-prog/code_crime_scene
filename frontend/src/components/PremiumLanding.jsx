import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Fingerprint, Search, Wrench } from 'lucide-react';
import { CASES } from '../data/cases.js';
import hqBackdrop from '../assets/investigation-hq.png';
import CaseStudy from './CaseStudy.jsx';

export default function PremiumLanding() {
  const [briefing, setBriefing] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const categoryCount = new Set(CASES.map(item => item.category)).size;
  return (
    <div className="premium-landing">
      <img src={hqBackdrop} className="premium-backdrop" alt="" />
      <div className="premium-shade" />
      <nav className="premium-nav">
        <Link to="/" className="premium-brand"><Fingerprint size={30}/><span>CODE<br/><b>CRIME SCENE</b><small>DIGITAL FORENSICS DIVISION</small></span></Link>
        <div>
          <Link to="/cases">Archive</Link>
          <Link to="/achievements">Achievements</Link>
          <Link to="/field-guide">Field manual</Link>
        </div>
      </nav>
      <main className="premium-hero">
        <motion.section initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.65}}>
          <div className="premium-kicker"><i /> CASE FILES ONLINE · SECURE CHANNEL</div>
          <div className="premium-title"><span>CODE</span><em>CRIME SCENE</em><small>A DEBUGGING DETECTIVE EXPERIENCE</small></div>
          <p>A debugging detective experience. Investigate the evidence, repair the broken system, and prove your conclusion.</p>
          <div className="premium-actions">
            <Link className="premium-cta" to="/headquarters">ENTER INVESTIGATION HQ <ArrowRight size={18}/></Link>
            <button onClick={()=>setBriefing(!briefing)}>CASE BRIEFING</button>
            <button onClick={()=>setShowStudy(true)} className="btn btn-ghost">Demo a case (walk‑through)</button>
          </div>
          {briefing && (
            <div className="premium-brief">
              <b>YOUR FIRST INVESTIGATION</b>
              <p>Attach two clues, form an evidence‑backed theory, and run the safe Test Lab before closing a case.</p>
              <Link to="/case/CCS-101">Open The Midnight Bank Heist →</Link>
            </div>
          )}
          {showStudy && <CaseStudy onClose={()=>setShowStudy(false)} caseId="CCS-101" />}
        </motion.section>
      </main>
      <footer>
        <span>{String(CASES.length).padStart(2,'0')} CASE FILES</span>
        <span>{String(categoryCount).padStart(2,'0')} DOMAINS</span>
        <span>OBSERVE · HYPOTHESIZE · REPAIR</span>
      </footer>
    </div>
  );
}
