import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen, BrainCircuit, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Code2, Database, FileSearch, Fingerprint, Flame, FlaskConical, Gauge, Globe2, Lightbulb, ListFilter, LockKeyhole, Menu, Network, Search, Shield, ShieldAlert, Sparkles, Terminal, Trophy, X, Zap } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import CaseCard from "./components/CaseCard.jsx";
import { CASES } from "./data/cases.js";

const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const iconByCategory = {JavaScript:Code2,Databases:Database,Networking:Network,Performance:Gauge,Concurrency:Activity,Deployment:Globe2};
const defaultProgress = { xp: 0, solvedCases: [], attempts: {}, hintsUsed: {}, lastSolvedDate: null };
function readProgress(){ try{return {...defaultProgress,...JSON.parse(localStorage.getItem("ccs-progress")||"{}")}}catch{return {...defaultProgress}} }
function progressUrl(){
 let key=localStorage.getItem("ccs-detective-key");
 if(!key){key=crypto.randomUUID();localStorage.setItem("ccs-detective-key",key)}
 return `${API}/progress/${key}`;
}
let saveQueue=Promise.resolve();
function saveProgress(p){
 localStorage.setItem("ccs-progress",JSON.stringify(p));
 const request=saveQueue.catch(()=>{}).then(async()=>{
  const response=await fetch(progressUrl(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  if(!response.ok)throw new Error("Progress sync failed");
 });
 saveQueue=request;
 return request;
}
function rankFor(xp){if(xp>=700)return "Chief Investigator";if(xp>=400)return "Senior Detective";if(xp>=180)return "Detective";return "Junior Detective";}
function App(){
 const [collapsed,setCollapsed]=useState(false),[mobileOpen,setMobileOpen]=useState(false);
 const [progress,setProgress]=useState(readProgress);
 const [user,setUserState]=useState(()=>{try{return {...JSON.parse(localStorage.getItem("ccs-user")||'{"username":"Detective","email":"detective@demo.local"}'),showProfile:false}}catch{return {username:"Detective",email:"detective@demo.local",showProfile:false}}});
 const setUser=(u)=>{setUserState(u);localStorage.setItem("ccs-user",JSON.stringify({username:u.username,email:u.email}));};
 const [toast,setToast]=useState("");
 useEffect(()=>{
 let active=true;
 fetch(progressUrl()).then(response=>{if(!response.ok)throw new Error("Progress sync failed");return response.json()}).then(remote=>{
  if(!active)return;
  setProgress(current=>{
   const solvedCases=CASES.filter(c=>current.solvedCases.includes(c.id)||(remote.solvedCases||[]).includes(c.id)).map(c=>c.id);
   const next={...defaultProgress,...remote,...current,solvedCases,xp:CASES.filter(c=>solvedCases.includes(c.id)).reduce((sum,c)=>sum+c.xp,0),attempts:{...remote.attempts,...current.attempts},hintsUsed:{...remote.hintsUsed,...current.hintsUsed},lastSolvedDate:[remote.lastSolvedDate,current.lastSolvedDate].filter(Boolean).sort().at(-1)||null};
   saveProgress(next).catch(()=>setToast("Progress is saved in this browser; server sync is unavailable."));
   return next;
  });
 }).catch(()=>{if(active)setToast("Progress is saved in this browser; server sync is unavailable.")});
 return()=>{active=false};
 },[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)},[toast]);
 const updateProgress=(next)=>{setProgress(next);saveProgress(next).catch(()=>setToast("Progress is saved in this browser; server sync is unavailable."))};
 const solved=progress.solvedCases.length;
 return <div className="app-shell"><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} closeMobile={()=>setMobileOpen(false)}/><div className={`main-shell ${collapsed?"wide":""}`}><Topbar user={user} setUser={setUser} onMenu={()=>setMobileOpen(true)}/><main className="page-content">
 <Routes>
  <Route path="/" element={<Dashboard progress={progress} user={user} setUser={setUser} setToast={setToast}/>}/>
  <Route path="/cases" element={<CaseLibrary progress={progress}/>}/>
  <Route path="/case/:id" element={<Investigation progress={progress} updateProgress={updateProgress} setToast={setToast}/>}/>
  <Route path="/achievements" element={<Achievements progress={progress}/>}/>
  <Route path="/field-guide" element={<FieldGuide/>}/>
  <Route path="*" element={<Dashboard progress={progress} user={user} setUser={setUser} setToast={setToast}/>}/>
 </Routes></main><footer className="app-footer"><span><span className="status-dot"></span> All systems operational</span><span>CODE CRIME SCENE <b>·</b> LEARN BY INVESTIGATING</span><span>v1.0.0</span></footer></div>{toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}</div>
}

function PageHeading({eyebrow,title,description,action}){return <div className="page-heading"><div><div className="eyebrow"><span></span>{eyebrow}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>}

function Dashboard({progress,user,setUser,setToast}){
 const [name,setName]=useState(user.username==="Detective"?"":user.username);
 const solved=progress.solvedCases.length;
 const featured=CASES.filter(c=>!progress.solvedCases.includes(c.id)).slice(0,3);
 const hours=Math.max(0,Math.round(solved*0.2*10)/10);
 const start=featured[0]||CASES[0];
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="page-stack">
  <div className="welcome-line"><div><div className="eyebrow"><span></span> MONDAY, OCTOBER 19, 2026 <span className="eyebrow-pill">LIVE WORKSPACE</span></div><h1>Good to see you, Detective <span className="wave">✳</span></h1><p className="muted">Every bug leaves a trail. Follow the evidence, find the truth.</p></div><div className="welcome-actions"><button className="btn btn-ghost" onClick={()=>setToast("Your progress is saved automatically.")}><Activity size={16}/> View activity</button><Link to={`/case/${start.id}`} className="btn btn-primary">Resume investigation <ArrowRight size={16}/></Link></div></div>
  <div className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><ShieldAlert size={14}/> CASE BRIEFING / 001</div><h2>The truth is<br/><em>in the details.</em></h2><p>Investigate suspicious logs, inspect broken code, and connect clues to solve real-world-inspired software incidents.</p><Link to="/cases" className="hero-link">Explore open cases <ArrowRight size={16}/></Link><div className="hero-stats"><div><b>06</b><span>CASE FILES</span></div><div><b>06</b><span>CS DOMAINS</span></div><div><b>∞</b><span>CLUES TO FIND</span></div></div></div><div className="hero-art"><div className="radar radar-one"></div><div className="radar radar-two"></div><div className="radar radar-three"></div><div className="radar-core"><Fingerprint size={43}/></div><div className="floating-tag tag-top"><span className="mini-dot"></span> TRACE FOUND <b>+01</b></div><div className="floating-tag tag-bottom"><Terminal size={14}/> suspicious_branch.js <span>!</span></div><div className="art-cross cross-a">+</div><div className="art-cross cross-b">+</div><div className="art-scan"></div></div><div className="hero-serial">INVESTIGATION DIVISION <span>·</span> 2026</div></div>
  <div className="section-heading"><div><div className="eyebrow">YOUR CASEBOOK</div><h2>Investigation overview</h2></div><Link to="/achievements" className="text-link">View your record <ArrowUpRight size={15}/></Link></div>
  <div className="stats-grid"><StatCard icon={CheckCircle2} label="Cases solved" value={`${solved} / ${CASES.length}`} note={`${Math.round(solved/CASES.length*100)}% completion`} progress={solved/CASES.length}/><StatCard icon={Zap} label="Experience earned" value={progress.xp.toLocaleString()} suffix="XP" note={`${Math.max(0,CASES.reduce((a,c)=>a+c.xp,0)-progress.xp)} XP to collect`} progress={progress.xp/CASES.reduce((a,c)=>a+c.xp,0)}/><StatCard icon={Award} label="Current rank" value={rankFor(progress.xp)} note="Keep investigating to rank up" progress={Math.min(progress.xp/700,1)}/><StatCard icon={Flame} label="Investigation streak" value={solved?`${Math.min(solved,7)} days`:"0 days"} note="One case at a time" progress={Math.min(solved/7,1)}/></div>
  <div className="section-heading case-section-heading"><div><div className="eyebrow">PRIORITY QUEUE</div><h2>Cases needing your attention <span className="tiny-count">{featured.length}</span></h2></div><Link to="/cases" className="text-link">All case files <ArrowRight size={15}/></Link></div>
  <div className="case-grid">{featured.map((c,i)=><CaseCard key={c.id} item={c} index={i}/>)}</div>
  <div className="bottom-grid"><div className="panel recent-panel"><div className="panel-heading"><div><div className="eyebrow">LATEST ACTIVITY</div><h3>Investigation log</h3></div><Activity size={18}/></div>{solved===0?<div className="empty-activity"><div className="empty-icon"><FileSearch size={22}/></div><div><b>No cases closed yet</b><p>Your solved cases and findings will show up here.</p></div></div>:progress.solvedCases.slice(-3).reverse().map(id=>{const c=CASES.find(x=>x.id===id);return <div className="activity-row" key={id}><CheckCircle2 size={17}/><div><b>{c?.title||id}</b><span>Case successfully closed</span></div><span className="activity-xp">+{c?.xp||0} XP</span></div>})}</div>
   <div className="panel rank-panel"><div className="panel-heading"><div><div className="eyebrow">DETECTIVE PROFILE</div><h3>Field credentials</h3></div><Shield size={18}/></div><div className="rank-badge"><div className="rank-emblem"><Fingerprint size={27}/></div><div><b>{rankFor(progress.xp)}</b><span>CODE CRIME DIVISION</span></div><span className="rank-level">LVL {Math.floor(progress.xp/100)+1}</span></div><div className="rank-progress-label"><span>Next rank progress</span><b>{progress.xp} / 400 XP</b></div><div className="progress-track"><i style={{width:`${Math.min(progress.xp/400*100,100)}%`}}></i></div><p className="rank-tip"><Lightbulb size={15}/> Tip: examine every evidence item before making your diagnosis.</p></div></div>
 </motion.div>
}
function StatCard({icon:Icon,label,value,suffix,note,progress}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><div className="stat-value">{value}{suffix&&<small>{suffix}</small>}</div><div className="stat-note">{note}</div><div className="mini-progress"><i style={{width:`${Math.min(100,Math.max(0,progress*100))}%`}}></i></div></div>}

function CaseLibrary({progress}){
 const [filter,setFilter]=useState("All cases"),[search,setSearch]=useState("");
 const categories=["All cases","JavaScript","Databases","Networking","Performance","Concurrency","Deployment"];
 const filtered=CASES.filter(c=>(filter==="All cases"||c.category===filter)&&`${c.title} ${c.summary} ${c.category} ${c.id}`.toLowerCase().includes(search.toLowerCase()));
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="page-stack"><PageHeading eyebrow="EVIDENCE ARCHIVE" title="Case files" description="Every incident is a puzzle. Start with the facts, then follow the trail." action={<div className="archive-count"><FilesIcon/> <b>06</b><span>ACTIVE FILES</span></div>}/><div className="library-banner"><div className="banner-symbol"><FileSearch size={22}/></div><div><b>Investigation protocol</b><p>Read the incident, inspect every evidence item, then submit your diagnosis and fix. Hints are available when you need a nudge.</p></div><span className="protocol-tag">PROTOCOL 01</span></div><div className="library-controls"><div className="filter-pills">{categories.map(c=><button key={c} onClick={()=>setFilter(c)} className={filter===c?"selected":""}>{c}</button>)}</div><label className="library-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search case files..."/></label></div><div className="results-caption"><span>{filtered.length} CASE FILE{filtered.length===1?"":"S"} FOUND</span><span><span className="status-dot"></span> OPEN INVESTIGATIONS</span></div>{filtered.length?<div className="case-grid library-grid">{filtered.map((c,i)=><CaseCard key={c.id} item={c} solved={progress.solvedCases.includes(c.id)} index={i}/>)}</div>:<div className="empty-state"><Search size={25}/><b>No matching case files</b><span>Try a different search or category.</span><button className="btn btn-ghost" onClick={()=>{setSearch("");setFilter("All cases")}}>Clear filters</button></div>}</motion.div>
}
function FilesIcon(){return <FilesFallback/>} function FilesFallback(){return <FileSearch size={17}/>}

function Investigation({progress,updateProgress,setToast}){
 const {id}=useParams(),navigate=useNavigate();
 const c=CASES.find(x=>x.id===id);
 const [activeEvidence,setActiveEvidence]=useState(0),[hypothesis,setHypothesis]=useState(""),[diagnosis,setDiagnosis]=useState(""),[fix,setFix]=useState(c?.starterCode||""),[hint,setHint]=useState(0),[tab,setTab]=useState("evidence"),[showSolution,setShowSolution]=useState(false),[result,setResult]=useState(null);
 useEffect(()=>{if(c){setFix(c.starterCode);setActiveEvidence(0);setHypothesis("");setDiagnosis("");setHint(0);setTab("evidence");setShowSolution(false);setResult(null)}},[id]);
 if(!c)return <div className="empty-state"><b>Case file not found</b><Link to="/cases">Return to case files</Link></div>;
 const isSolved=progress.solvedCases.includes(c.id);
 const selectedHypothesis=c.hypotheses.find(h=>h.id===hypothesis);
 const getHint=()=>{setHint(h=>Math.min(3,h+1));setToast("Hint revealed. Use it to guide your investigation.");};
 const submit=()=>{
   const diag=diagnosis.trim().toLowerCase();
   const diagCorrect=diag.length>5 && c.diagnosis.toLowerCase().split(/[.,:;]/).filter(w=>w.length>4).some(w=>diag.includes(w));
   const fixCorrect=fix.trim().length>10 && (fix.trim()===c.fixedCode.trim() || c.solution.toLowerCase().split(/[.,:;]/).filter(w=>w.length>5).some(w=>fix.toLowerCase().includes(w)) || (c.id==="CCS-001"&&fix.includes("password !== savedPassword")) || (c.id==="CCS-002"&&/\bIN\s*\(/i.test(fix)) || (c.id==="CCS-003"&&fix.includes("0.0.0.0")) || (c.id==="CCS-004"&&fix.includes("removeEventListener")) || (c.id==="CCS-005"&&/updateOne|transaction|atomic/i.test(fix)) || (c.id==="CCS-006"&&fix.includes("API_BASE_URL")));
   const hypothesisCorrect=selectedHypothesis?.id==="h1";
   const score=(diagCorrect?1:0)+(fixCorrect?1:0)+(hypothesisCorrect?1:0);
   const passed=score>=2;
   setResult({passed,score,diagCorrect,fixCorrect,hypothesisCorrect});
   if(passed&&!isSolved){const next={...progress,solvedCases:[...progress.solvedCases,c.id],xp:progress.xp+c.xp,lastSolvedDate:new Date().toISOString().slice(0,10)};updateProgress(next);setToast(`Case closed! +${c.xp} XP earned.`)}
   else if(!passed){updateProgress({...progress,attempts:{...progress.attempts,[c.id]:(progress.attempts[c.id]||0)+1}})}
 };
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="page-stack investigation-page"><div className="investigation-breadcrumb"><Link to="/cases">Case files</Link><ChevronRight size={14}/><span>{c.id}</span><ChevronRight size={14}/><b>{c.title}</b><span className="case-status"><span className="status-dot"></span>{isSolved?"CLOSED":"OPEN CASE"}</span></div>
 <div className="investigation-title"><div><div className="eyebrow"><span></span>{c.id} <span className="slash">/</span> {c.category.toUpperCase()}</div><h1>{c.title}</h1><p>{c.summary}</p></div><div className="case-reward"><div className="reward-icon"><Zap size={18}/></div><div><b>{c.xp} XP</b><span>CASE REWARD</span></div></div></div>
 <div className="case-brief-panel"><div className="brief-icon"><ShieldAlert size={21}/></div><div className="brief-copy"><div className="brief-label">INCIDENT REPORT <span>•</span> PRIORITY {c.difficulty==="Expert"?"HIGH":"NORMAL"}</div><p>{c.incident}</p><div className="brief-tags"><span><Clock3 size={13}/>{c.duration}</span><span><Terminal size={13}/>{c.environment}</span><span className={`difficulty ${c.difficulty.toLowerCase()}`}>{c.difficulty}</span></div></div><div className="brief-stamp"><Fingerprint size={30}/><span>CONFIDENTIAL</span></div></div>
 <div className="investigation-layout"><section className="workspace-column"><div className="workspace-tabs"><button className={tab==="evidence"?"active":""} onClick={()=>setTab("evidence")}><FileSearch size={15}/> Evidence <span>{c.evidence.length}</span></button><button className={tab==="code"?"active":""} onClick={()=>setTab("code")}><Code2 size={15}/> Workbench</button><button className={tab==="tests"?"active":""} onClick={()=>setTab("tests")}><FlaskConical size={15}/> Test plan</button></div>
 {tab==="evidence"&&<div className="evidence-workspace"><div className="evidence-list"><div className="subpanel-heading"><span>AVAILABLE EVIDENCE</span><span>{String(c.evidence.length).padStart(2,"0")} ITEMS</span></div>{c.evidence.map((e,i)=><button key={e.title} className={`evidence-item ${activeEvidence===i?"selected":""}`} onClick={()=>setActiveEvidence(i)}><div className={`evidence-type type-${e.type.toLowerCase()}`}>{e.type.slice(0,3)}</div><div><b>{e.title}</b><span>Evidence {String(i+1).padStart(2,"0")}</span></div><ChevronRight size={15}/></button>)}</div><div className="evidence-view"><div className="evidence-view-head"><span><span className="status-dot"></span> EVIDENCE PREVIEW</span><span>READ ONLY</span></div><div className="evidence-view-title"><span className={`evidence-type type-${c.evidence[activeEvidence].type.toLowerCase()}`}>{c.evidence[activeEvidence].type.slice(0,3)}</span><div><h3>{c.evidence[activeEvidence].title}</h3><span>Item {String(activeEvidence+1).padStart(2,"0")} of {String(c.evidence.length).padStart(2,"0")}</span></div></div><pre className="evidence-code">{c.evidence[activeEvidence].content.replace(/\\n/g,"\n")}</pre><div className="evidence-note"><Lightbulb size={16}/><p>{c.evidence[activeEvidence].detail}</p></div><div className="evidence-nav"><button disabled={activeEvidence===0} onClick={()=>setActiveEvidence(i=>i-1)}>Previous clue</button><button disabled={activeEvidence===c.evidence.length-1} onClick={()=>setActiveEvidence(i=>i+1)}>Next clue <ArrowRight size={14}/></button></div></div></div>}
 {tab==="code"&&<div className="workbench"><div className="workbench-toolbar"><span><span className="terminal-dot"></span><span className="terminal-dot"></span><span className="terminal-dot"></span> {c.category==="Databases"?"orders.sql":c.category==="Deployment"?"server.js":"incident.js"}</span><span>SIMULATED WORKBENCH</span></div><div className="editor-label"><span>YOUR PROPOSED FIX</span><span>SAFE MODE · NO CODE EXECUTION</span></div><textarea spellCheck="false" value={fix} onChange={e=>setFix(e.target.value)} aria-label="Your proposed fix" className="code-editor"/><div className="editor-footer"><span><Shield size={14}/> Code is evaluated with case-specific checks, never executed on the server.</span><button className="btn btn-ghost btn-small" onClick={()=>setFix(c.starterCode)}>Reset starter code</button></div><div className="expected-fix"><Lightbulb size={15}/><span>Goal: {c.solution}</span></div></div>}
 {tab==="tests"&&<div className="test-plan"><div className="test-plan-head"><div><div className="eyebrow">VALIDATION CHECKLIST</div><h3>What should a correct fix prove?</h3><p>Use these expected outcomes to reason about your solution.</p></div><div className="test-icon"><FlaskConical size={22}/></div></div>{c.testLabels.map((t,i)=><div className="test-row" key={t}><div className="test-number">{String(i+1).padStart(2,"0")}</div><div><b>{t}</b><span>Expected behaviour</span></div><span className="test-pending">NOT RUN</span></div>)}<div className="test-footer"><Shield size={15}/> Tests are conceptual checklist items for learning; they do not run untrusted code.</div></div>}
 <div className="diagnosis-panel"><div className="diagnosis-heading"><div className="diagnosis-icon"><BrainCircuit size={18}/></div><div><h3>Detective's conclusion</h3><p>Connect the evidence and tell us what went wrong.</p></div><span className="required-tag">REQUIRED</span></div><label className="field-label">1. SELECT YOUR LEADING HYPOTHESIS</label><div className="hypothesis-list">{c.hypotheses.map(h=><button key={h.id} onClick={()=>setHypothesis(h.id)} className={`hypothesis-option ${hypothesis===h.id?"selected":""}`}><span className="radio-dot"></span><span><b>{h.label}</b><small>{h.desc}</small></span></button>)}</div><label className="field-label" htmlFor="diagnosis">2. EXPLAIN THE ROOT CAUSE IN YOUR OWN WORDS</label><textarea id="diagnosis" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} placeholder="What is the underlying problem? Which clue supports your theory?" className="diagnosis-input" rows="3"/><div className="diagnosis-footer"><span>{diagnosis.length} characters · Explain the why, not just the symptom</span><button className="hint-button" onClick={getHint}><Lightbulb size={15}/> Request a hint ({hint}/3)</button></div>{hint>0&&<div className="hint-card"><Lightbulb size={16}/><div><b>Hint {hint}</b><p>{hint===1?`Focus on ${c.evidence[0].title}. What detail seems inconsistent with the expected behaviour?`:hint===2?`Compare the clues. The root cause is most directly connected to: ${c.evidence[1].detail}`:`Think about the intended rule: ${c.solution}`}</p></div></div>}
 <button className="btn btn-primary submit-case" onClick={submit}><Fingerprint size={17}/> Submit findings <ArrowRight size={16}/></button>
 {result&&<div className={`result-panel ${result.passed?"success":"failure"}`}><div className="result-icon">{result.passed?<CheckCircle2 size={23}/>:<CircleHelp size={23}/>}</div><div className="result-content"><h3>{result.passed?(isSolved?"Case already closed":"Case solved — excellent detective work"):"Not enough evidence yet"}</h3><p>You earned {result.score} out of 3 investigation checks. {result.passed?"Review the lesson below to lock in the concept.":"Review the clues, adjust your hypothesis, and try again."}</p><div className="result-checks"><span className={result.hypothesisCorrect?"pass":"fail"}>{result.hypothesisCorrect?"✓":"○"} Hypothesis</span><span className={result.diagCorrect?"pass":"fail"}>{result.diagCorrect?"✓":"○"} Diagnosis</span><span className={result.fixCorrect?"pass":"fail"}>{result.fixCorrect?"✓":"○"} Proposed fix</span></div>{result.passed&&<button className="btn btn-ghost btn-small" onClick={()=>setShowSolution(!showSolution)}>{showSolution?"Hide learning note":"Reveal learning note"} <ChevronRight size={14}/></button>}{showSolution&&<div className="solution-note"><b>Root cause</b><p>{c.diagnosis}</p><b>Recommended approach</b><p>{c.solution}</p><b>Key lesson</b><p>{c.lesson}</p></div>}</div></div>}
 </div></section>

<aside className="case-side-column">
  <div className="panel evidence-progress">
    <div className="panel-heading">
      <div>
        <div className="eyebrow">CASE STATUS</div>
        <h3>Evidence collected</h3>
      </div>
      <span className="count-orb">
        {activeEvidence + 1}/{c.evidence.length}
      </span>
    </div>

    <div className="progress-track">
      <i
        style={{
          width: `${((activeEvidence + 1) / c.evidence.length) * 100}%`,
        }}
      />
    </div>

    <div className="evidence-checklist">
      {c.evidence.map((e, i) => (
        <div key={e.title} className={i <= activeEvidence ? "done" : ""}>
          <span>
            {i <= activeEvidence ? (
              <Check size={13} />
            ) : (
              String(i + 1).padStart(2, "0")
            )}
          </span>
          {e.title}
        </div>
      ))}
    </div>
  </div>

  <div className="panel protocol-panel">
    <div className="panel-heading">
      <div>
        <div className="eyebrow">FIELD PROTOCOL</div>
        <h3>How to solve this</h3>
      </div>
      <BookOpen size={17} />
    </div>

    <div className="protocol-step">
      <span>01</span>
      <div>
        <b>Observe</b>
        <p>Read the incident report and all clues.</p>
      </div>
    </div>
    <div className="protocol-step">
      <span>02</span>
      <div>
        <b>Hypothesize</b>
        <p>Choose the explanation that fits the evidence.</p>
      </div>
    </div>
    <div className="protocol-step">
      <span>03</span>
      <div>
        <b>Repair</b>
        <p>Propose a fix and explain the root cause.</p>
      </div>
    </div>
    <div className="protocol-step">
      <span>04</span>
      <div>
        <b>Verify</b>
        <p>Check your reasoning against expected outcomes.</p>
      </div>
    </div>
  </div>

  <div className="hint-side-card">
    <div className="hint-side-icon">
      <Sparkles size={18} />
    </div>
    <div>
      <b>Stuck on a clue?</b>
      <p>Hints help you think without giving away the full answer immediately.</p>
      <button onClick={getHint}>
        Get a hint <ArrowRight size={14} />
      </button>
    </div>
  </div>

  <div className="case-switcher">
    <button
      onClick={() =>
        navigate(
          `/case/${CASES[(CASES.findIndex(x => x.id === c.id) + CASES.length - 1) % CASES.length].id}`
        )
      }
    >
      <ChevronRight className="flip" size={15} /> Previous case
    </button>

    <button
      onClick={() =>
        navigate(
          `/case/${CASES[(CASES.findIndex(x => x.id === c.id) + 1) % CASES.length].id}`
        )
      }
    >
      Next case <ChevronRight size={15} />
    </button>
  </div>
</aside>
</div>
</motion.div>
}


function Achievements({progress}){
 const achievements=[{title:"First Blood",desc:"Close your first case file.",icon:Fingerprint,done:progress.solvedCases.length>=1},{title:"Pattern Finder",desc:"Solve three different incidents.",icon:Search,done:progress.solvedCases.length>=3},{title:"Full Clearance",desc:"Solve all six case files.",icon:Shield,done:progress.solvedCases.length>=6},{title:"XP Collector",desc:"Earn 400 experience points.",icon:Zap,done:progress.xp>=400},{title:"Sharp Eye",desc:"Inspect the evidence and connect the clues.",icon:Lightbulb,done:progress.solvedCases.length>=2},{title:"Senior Investigator",desc:"Reach 700 XP and master the casebook.",icon:Trophy,done:progress.xp>=700}];
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="page-stack"><PageHeading eyebrow="HONOURS & MILESTONES" title="Your achievements" description="Every solved incident adds to your detective record."/><div className="achievement-hero"><div className="achievement-emblem"><Trophy size={33}/></div><div><div className="eyebrow">CURRENT CLEARANCE LEVEL</div><h2>{rankFor(progress.xp)}</h2><p>{progress.xp} XP earned · {progress.solvedCases.length} case files closed</p></div><div className="achievement-hero-right"><b>{achievements.filter(a=>a.done).length}<span> / {achievements.length}</span></b><small>ACHIEVEMENTS UNLOCKED</small></div></div><div className="achievement-grid">{achievements.map((a,i)=><div className={`achievement-card ${a.done?"unlocked":""}`} key={a.title}><div className="achievement-icon"><a.icon size={23}/></div><div className="achievement-copy"><h3>{a.title}</h3><p>{a.desc}</p><span className={a.done?"unlocked-label":"locked-label"}>{a.done?<><BadgeCheck size={13}/> UNLOCKED</>:"LOCKED"}</span></div><span className="achievement-number">{String(i+1).padStart(2,"0")}</span></div>)}</div><div className="panel achievement-note"><Lightbulb size={18}/><div><b>Keep building your casebook</b><p>Try cases from different CS domains. A good detective learns to recognise patterns in code, data, networks, and system behaviour.</p></div><Link to="/cases" className="text-link">Browse cases <ArrowRight size={15}/></Link></div></motion.div>
}
function FieldGuide(){const sections=[{title:"Read the evidence before guessing",icon:FileSearch,body:"Logs show what happened; code shows what the program was told to do; tests show the gap between expected and actual behaviour."},{title:"Separate symptoms from root causes",icon:BrainCircuit,body:"“Login fails” is a symptom. “The failure branch runs when the password matches” is a root-cause explanation."},{title:"Make one change at a time",icon:Code2,body:"A focused fix is easier to reason about and verify. Avoid changing unrelated code while investigating an incident."},{title:"Verify with expected outcomes",icon:FlaskConical,body:"A fix is not complete just because it looks right. List the cases that should pass and the failure cases that should remain safe."},{title:"Use hints as a ladder",icon:Lightbulb,body:"The first hint points you to a clue, the second helps interpret it, and the third gives you the key idea to check."}];return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="page-stack"><PageHeading eyebrow="DETECTIVE HANDBOOK" title="Field guide" description="A repeatable method for debugging, diagnosis, and technical interviews."/><div className="field-guide-intro"><div className="field-guide-art"><BookOpen size={36}/><span>FIELD MANUAL<br/>NO. 001</span></div><div><div className="eyebrow">THE INVESTIGATION METHOD</div><h2>Curiosity is your best debugging tool.</h2><p>You do not need to know every answer immediately. You need a method to gather evidence, test an explanation, and learn from the result.</p></div></div><div className="guide-list">{sections.map((s,i)=><div className="guide-row" key={s.title}><div className="guide-index">{String(i+1).padStart(2,"0")}</div><div className="guide-icon"><s.icon size={20}/></div><div><h3>{s.title}</h3><p>{s.body}</p></div><ChevronRight size={18}/></div>)}</div><div className="panel glossary"><div className="eyebrow">QUICK GLOSSARY</div><h3>Terms you will meet</h3><div className="glossary-grid"><div><b>Bug</b><p>A mistake in software that causes unexpected behaviour.</p></div><div><b>Root cause</b><p>The underlying reason a problem happens.</p></div><div><b>Reproduction</b><p>A reliable sequence of steps that makes a bug appear.</p></div><div><b>Regression test</b><p>A test that helps ensure a fixed problem does not return.</p></div></div></div><Link to="/cases" className="btn btn-primary guide-cta">Start an investigation <ArrowRight size={16}/></Link></motion.div>}

export default App;
