import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldAlert, LayoutDashboard, Files, Trophy, BookOpen, Settings, CircleHelp, ChevronLeft } from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, closeMobile }) {
  const links = [
    { to: "/", label: "Command Center", icon: LayoutDashboard },
    { to: "/cases", label: "Case Files", icon: Files },
    { to: "/achievements", label: "Achievements", icon: Trophy },
    { to: "/field-guide", label: "Field Guide", icon: BookOpen },
  ];
  return <><div className={`mobile-scrim ${mobileOpen ? "show" : ""}`} onClick={closeMobile}></div>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><ShieldAlert size={22}/></div>{!collapsed && <div><strong>CODE CRIME</strong><span>SCENE / LAB</span></div>}</div>
      <div className="nav-caption">{!collapsed && "WORKSPACE"}</div>
      <nav>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={closeMobile} end={to==="/"} className={({isActive})=>`nav-link ${isActive?"active":""}`}><Icon size={18}/>{!collapsed && <span>{label}</span>}{!collapsed && to==="/cases" && <span className="nav-count">06</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18}/>{!collapsed && <div><b>Need a clue?</b><span>Check the field guide</span></div>}</div><button className="collapse-btn" onClick={()=>setCollapsed(!collapsed)}><ChevronLeft size={16}/>{!collapsed && "Collapse sidebar"}</button></div>
    </aside></>;
}
