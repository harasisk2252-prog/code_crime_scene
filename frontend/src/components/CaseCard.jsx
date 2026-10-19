import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, LockKeyhole, CheckCircle2, Zap } from "lucide-react";
export default function CaseCard({ item, solved=false, index=0 }) {
  const color = item.accent || "amber";
  return <Link to={`/case/${item.id}`} className={`case-card accent-${color}`} style={{"--delay":`${index*55}ms`}}>
    <div className="case-card-top"><span className="case-id">{item.id}</span><span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span></div>
    <div className="case-icon-wrap"><div className="case-icon"><LockKeyhole size={20}/></div><span className="case-glow"></span></div>
    <h3>{item.title}</h3><p>{item.summary}</p>
    <div className="case-meta"><span><Clock3 size={14}/>{item.duration}</span><span><Zap size={14}/>{item.xp} XP</span></div>
    <div className="case-card-footer"><span>{solved ? <><CheckCircle2 size={15}/> Case solved</> : "Open investigation"}</span><ArrowUpRight size={17}/></div>
  </Link>;
}
