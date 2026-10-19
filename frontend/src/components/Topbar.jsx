import React from "react";
import { Search, Bell, Menu, Command, ChevronDown } from "lucide-react";
export default function Topbar({ user, setUser, onMenu }) {
  return <header className="topbar">
    <button className="icon-btn mobile-menu" onClick={onMenu}><Menu size={19}/></button>
    <div className="breadcrumbs"><span>Investigation desk</span><b>/</b><strong>Overview</strong></div>
    <div className="top-actions">
      <div className="searchbox"><Search size={16}/><span>Search cases...</span><kbd><Command size={11}/> K</kbd></div>
      <button className="icon-btn notification" title="Notifications"><Bell size={18}/><i></i></button>
      <button className="profile-trigger" onClick={()=>setUser({...user, showProfile:!user.showProfile})}><div className="avatar">{(user.username||"D")[0].toUpperCase()}</div><div className="profile-label"><b>{user.username || "Detective"}</b><span>Junior Detective</span></div><ChevronDown size={15}/></button>
    </div>
    {user.showProfile && <div className="profile-pop"><b>Detective profile</b><p>Your investigation progress is saved in this browser.</p><button onClick={()=>{localStorage.removeItem("ccs-user");setUser({username:"Detective",email:"detective@demo.local",showProfile:false});}}>Reset demo identity</button></div>}
  </header>;
}
