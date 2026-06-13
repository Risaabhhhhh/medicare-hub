import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ── inject fonts + global keyframes once ── */
if (!document.getElementById("mh-fonts")) {
  const l = document.createElement("link");
  l.id   = "mh-fonts";
  l.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
  l.rel  = "stylesheet";
  document.head.appendChild(l);
}
if (!document.getElementById("mh-spin")) {
  const s = document.createElement("style");
  s.id = "mh-spin";
  s.textContent = `
    @keyframes mhSpin    { to { transform:rotate(360deg); } }
    @keyframes mhFadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
    @keyframes mhDot     { 0%,80%,100%{transform:scale(0);}40%{transform:scale(1);} }
    @keyframes mhPulse   { 0%,100%{opacity:.5;}50%{opacity:1;} }
    @keyframes hospPulse { 0%{stroke-opacity:.6;stroke-width:2;}100%{stroke-opacity:0;stroke-width:20;} }

    .mh-nav-btn:hover    { background:rgba(192,57,43,0.07)!important; color:#C0392B!important; }
    .mh-card-hover:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(192,57,43,0.09)!important; }
    .mh-btn-hover:hover  { background:#7B1D2E!important; transform:translateY(-1px); box-shadow:0 8px 20px rgba(123,29,46,0.28)!important; }
    .mh-ghost-hover:hover{ border-color:#C0392B!important; color:#C0392B!important; background:rgba(192,57,43,0.05)!important; }
    .mh-input:focus      { border-color:#C0392B!important; box-shadow:0 0 0 3px rgba(192,57,43,0.09)!important; }
    .mh-input::placeholder{ color:#C8BBBA; }
    .mh-quick:hover      { border-color:rgba(192,57,43,0.3)!important; transform:translateY(-2px); box-shadow:0 8px 20px rgba(192,57,43,0.09)!important; }
    .hosp-item:hover     { background:rgba(192,57,43,0.05)!important; border-color:rgba(192,57,43,0.25)!important; }
    .hosp-item.active    { background:rgba(192,57,43,0.07)!important; border-color:rgba(192,57,43,0.3)!important; }
    .mh-search:focus     { border-color:#C0392B!important; box-shadow:0 0 0 3px rgba(192,57,43,0.09)!important; }
    .mh-search::placeholder { color:#C8BBBA; }
    .hosp-pulse { animation:hospPulse 2s ease-out infinite; }
    .mh-popup .leaflet-popup-content-wrapper {
      background:#fff; border:1px solid rgba(232,116,97,0.18);
      border-radius:12px; box-shadow:0 12px 36px rgba(192,57,43,0.14);
      padding:0; overflow:hidden;
    }
    .mh-popup .leaflet-popup-content { margin:0; }
    .mh-popup .leaflet-popup-tip-container { display:none; }
    .leaflet-container { font-family:'DM Sans',sans-serif; }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(232,116,97,0.2); border-radius:10px; }
  `;
  document.head.appendChild(s);
}

/* ── Map icons ── */
const hospitalSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">` +
  `<path d="M20 2C12.268 2 6 8.268 6 16c0 10 14 30 14 30s14-20 14-30C34 8.268 27.732 2 20 2z" fill="#fff" stroke="#C0392B" stroke-width="1.8"/>` +
  `<circle cx="20" cy="16" r="10" fill="#C0392B"/>` +
  `<rect x="18.5" y="12.5" width="3" height="7" fill="#fff"/>` +
  `<rect x="16" y="15" width="8" height="3" fill="#fff"/>` +
  `</svg>`
);
const hospitalIcon = new L.DivIcon({
  html: `<img src="data:image/svg+xml,${hospitalSvg}" style="width:34px;height:43px;filter:drop-shadow(0 2px 4px rgba(192,57,43,0.35))"/>`,
  iconSize:[34,43], iconAnchor:[17,43], popupAnchor:[0,-40], className:"",
});

const userSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">` +
  `<circle cx="16" cy="16" r="12" fill="#C0392B" opacity="0.15"/>` +
  `<circle cx="16" cy="16" r="7" fill="#C0392B"/>` +
  `<circle cx="16" cy="16" r="3" fill="#fff"/>` +
  `</svg>`
);
const userIcon = new L.DivIcon({
  html: `<img src="data:image/svg+xml,${userSvg}" style="width:28px;height:28px;"/>`,
  iconSize:[28,28], iconAnchor:[14,14], className:"",
});

function getDistance(lat1,lon1,lat2,lon2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
}

/* ─────────────────────────────────────────────────
   EMBEDDED MAP COMPONENT
───────────────────────────────────────────────── */
function EmbeddedMap() {
  const [position,   setPosition]  = useState(null);
  const [hospitals,  setHospitals] = useState([]);
  const [search,     setSearch]    = useState("");
  const [selected,   setSelected]  = useState(null);
  const [locError,   setLocError]  = useState(false);
  const [mapLoading, setMapLoad]   = useState(true);

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude:lat,longitude:lon}=pos.coords;
        setPosition([lat,lon]);
        fetchHospitals(lat,lon);
      },
      ()=>{ setLocError(true); setMapLoad(false); }
    );
  },[]);

  const fetchHospitals=async(lat,lon)=>{
    const query=`[out:json][timeout:25];(node["amenity"="hospital"](around:2000,${lat},${lon});node["amenity"="clinic"](around:2000,${lat},${lon}););out body;>;out skel qt;`;
    try{
      const res=await fetch("https://overpass.kumi.systems/api/interpreter",{method:"POST",headers:{"Content-Type":"text/plain"},body:query});
      if(res.ok){
        const d=await res.json();
        const list=(d?.elements||[]).filter(h=>h.lat&&h.lon);
        list.sort((a,b)=>parseFloat(getDistance(lat,lon,a.lat,a.lon))-parseFloat(getDistance(lat,lon,b.lat,b.lon)));
        setHospitals(list);
      }
    }catch(e){console.error(e);}
    finally{setMapLoad(false);}
  };

  const filtered=hospitals.filter(h=>(h.tags?.name||"").toLowerCase().includes(search.toLowerCase()));

  if(mapLoading||(!position&&!locError)) return(
    <div style={{height:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",borderRadius:18,border:"1px solid rgba(232,116,97,0.15)",gap:14}}>
      <div style={{width:34,height:34,border:"3px solid rgba(232,116,97,0.2)",borderTop:"3px solid #C0392B",borderRadius:"50%",animation:"mhSpin 0.7s linear infinite"}}/>
      <span style={{fontSize:13,color:"#B0A4A2"}}>Getting your location…</span>
    </div>
  );

  if(locError) return(
    <div style={{height:400,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",borderRadius:18,border:"1px solid rgba(232,116,97,0.15)",gap:12,padding:24}}>
      <div style={{fontSize:38}}>📍</div>
      <div style={{fontFamily:"'Instrument Serif',serif",fontSize:19,color:"#1C1C1E",fontWeight:400}}>Location access needed</div>
      <div style={{fontSize:13,color:"#8A7E7C",textAlign:"center",maxWidth:300,lineHeight:1.7}}>Allow location access in your browser to see nearby hospitals.</div>
      <button onClick={()=>window.location.reload()} style={{marginTop:4,padding:"8px 20px",background:"#C0392B",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Try Again</button>
    </div>
  );

  return(
    <div style={{display:"flex",height:500,borderRadius:18,overflow:"hidden",border:"1px solid rgba(232,116,97,0.15)",boxShadow:"0 8px 32px rgba(192,57,43,0.08)"}}>
      <div style={{width:250,background:"#fff",display:"flex",flexDirection:"column",borderRight:"1px solid rgba(232,116,97,0.1)",flexShrink:0}}>
        <div style={{padding:"14px 14px 10px",borderBottom:"1px solid rgba(232,116,97,0.08)"}}>
          <input className="mh-search" type="text" placeholder="Search hospital…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"8px 12px",background:"#FDF2F0",border:"1px solid rgba(232,116,97,0.2)",borderRadius:8,fontSize:12,color:"#1C1C1E",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
          />
          <div style={{marginTop:7,fontSize:10,color:"#B0A4A2"}}>{filtered.length} location{filtered.length!==1?"s":""} within 2 km</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"28px 12px",color:"#C8BBBA",fontSize:12}}>
              {hospitals.length===0?"No hospitals found nearby.":"No results."}
            </div>
          ):filtered.map(h=>{
            const dist=getDistance(position[0],position[1],h.lat,h.lon);
            const isActive=selected?.id===h.id;
            return(
              <div key={h.id} className={`hosp-item${isActive?" active":""}`} onClick={()=>setSelected(h)}
                style={{padding:"10px 12px",marginBottom:5,borderRadius:10,cursor:"pointer",border:`1px solid ${isActive?"rgba(192,57,43,0.25)":"rgba(232,116,97,0.1)"}`,background:isActive?"rgba(192,57,43,0.07)":"transparent",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#1C1C1E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.tags?.name||"Hospital"}</div>
                    {h.tags?.["addr:street"]&&<div style={{fontSize:10,color:"#B0A4A2",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.tags["addr:street"]}</div>}
                  </div>
                  <div style={{fontSize:10,color:"#C0392B",fontWeight:700,flexShrink:0,background:"rgba(192,57,43,0.07)",padding:"2px 7px",borderRadius:20}}>{dist}km</div>
                </div>
                <div style={{display:"flex",gap:5,marginTop:6}}>
                  <span style={{fontSize:9,color:"#8A7E7C",background:"rgba(232,116,97,0.06)",padding:"2px 7px",borderRadius:5}}>{h.amenity==="clinic"?"🏨 Clinic":"🏥 Hospital"}</span>
                  {h.tags?.["opening_hours"]&&<span style={{fontSize:9,color:"#8A7E7C",background:"rgba(232,116,97,0.06)",padding:"2px 7px",borderRadius:5}}>🕐 {h.tags["opening_hours"]}</span>}
                </div>
                <button onClick={e=>{e.stopPropagation();window.location.href=`/book?hospitalName=${encodeURIComponent(h.tags?.name||"Hospital")}`;}}
                  style={{marginTop:8,width:"100%",padding:"6px",background:"#C0392B",color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Book →
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{flex:1,position:"relative"}}>
        <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"rgba(255,255,255,0.95)",border:"1px solid rgba(232,116,97,0.15)",borderRadius:100,padding:"5px 14px",boxShadow:"0 4px 14px rgba(192,57,43,0.1)",fontSize:11,color:"#8A7E7C",fontFamily:"'DM Sans',sans-serif",backdropFilter:"blur(8px)",whiteSpace:"nowrap"}}>
          📍 {hospitals.length} nearby
        </div>
        <div style={{position:"absolute",top:10,right:10,zIndex:1000,background:"rgba(255,255,255,0.97)",border:"1px solid rgba(232,116,97,0.15)",borderRadius:10,padding:"7px 11px",boxShadow:"0 4px 14px rgba(192,57,43,0.09)",fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{fontSize:9,color:"#B0A4A2",fontWeight:700,letterSpacing:1,marginBottom:4}}>LEGEND</div>
          {[["#C0392B","Hospital"],["rgba(192,57,43,0.3)","Your location"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
              <span style={{fontSize:9,color:"#1C1C1E"}}>{l}</span>
            </div>
          ))}
        </div>
        <MapContainer center={position} zoom={14} style={{width:"100%",height:"100%"}} zoomControl={false}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <Marker position={position} icon={userIcon}>
            <Popup className="mh-popup">
              <div style={{padding:"12px 14px",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>You are here</div>
                <div style={{fontSize:11,color:"#B0A4A2",marginTop:2}}>Current location</div>
              </div>
            </Popup>
          </Marker>
          {filtered.map(h=>{
            const dist=getDistance(position[0],position[1],h.lat,h.lon);
            return(
              <div key={h.id}>
                <CircleMarker center={[h.lat,h.lon]} radius={18} className="hosp-pulse" pathOptions={{color:"#C0392B",fillOpacity:0,weight:2,opacity:0.4}}/>
                <Marker position={[h.lat,h.lon]} icon={hospitalIcon} eventHandlers={{click:()=>setSelected(h)}}>
                  <Popup className="mh-popup">
                    <div style={{padding:"14px 16px",fontFamily:"'DM Sans',sans-serif",minWidth:185}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                        <div style={{width:28,height:28,borderRadius:7,background:"rgba(192,57,43,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🏥</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E",lineHeight:1.2}}>{h.tags?.name||"Hospital"}</div>
                          <div style={{fontSize:10,color:"#C0392B",fontWeight:600,marginTop:1}}>{dist} km away</div>
                        </div>
                      </div>
                      {h.tags?.["addr:street"]&&<div style={{fontSize:11,color:"#8A7E7C",marginBottom:6}}>📍 {h.tags["addr:street"]}</div>}
                      {h.tags?.phone&&<div style={{fontSize:11,color:"#8A7E7C",marginBottom:8}}>📞 {h.tags.phone}</div>}
                      <button onClick={()=>window.location.href=`/book?hospitalName=${encodeURIComponent(h.tags?.name||"Hospital")}`}
                        style={{width:"100%",padding:"8px",background:"#C0392B",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                        Book Appointment →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */

const NAV = [
  { id:"overview",      icon:"◈",  label:"Overview"         },
  { id:"appointments",  icon:"📋", label:"Appointments"     },
  { id:"map",           icon:"🗺️", label:"Find Hospital"    },
  { id:"teleconsult",   icon:"🎥", label:"Teleconsult"      },
  { id:"prescriptions", icon:"💊", label:"Rx Vault"         },
  { id:"vitals",        icon:"💓", label:"Vitals"           },
  { id:"ai",            icon:"✦",  label:"MedGamma AI"      },
  { id:"profile",       icon:"👤", label:"Profile"          },
  { id:"history",       icon:"🗂️", label:"History"          },
  { id:"bmi",           icon:"⚖️", label:"BMI Tools"        },
  { id:"emergency",     icon:"🚨", label:"Emergency"        },
];

function statusPill(s) {
  const m = {
    approved:      { bg:"rgba(192,57,43,0.08)",  color:"#C0392B"  },
    pending:       { bg:"rgba(217,119,6,0.09)",  color:"#B45309"  },
    rejected:      { bg:"rgba(239,68,68,0.09)",  color:"#DC2626"  },
    "in-progress": { bg:"rgba(26,82,118,0.09)",  color:"#1A5276"  },
    done:          { bg:"rgba(176,164,162,0.12)", color:"#8A7E7C"  },
  };
  return m[s] || { bg:"rgba(176,164,162,0.1)", color:"#8A7E7C" };
}

/* ── FIX #8: Reusable AI response formatter ── */
const formatAIResponse = (d) => `
🧠 Condition: ${d?.condition || "Unknown"}
⚠️ Severity: ${d?.severity || "Unknown"}
💡 Advice: ${d?.advice || "No advice available"}
🏥 Department: ${d?.department || "General"}
`.trim();

/* ── FIX #11: Severity-based message color ── */
const severityColor = (severity) => {
  if (!severity) return {};
  const s = severity.toLowerCase();
  if (s === "emergency")    return { border:"1px solid rgba(220,38,38,0.3)",  background:"rgba(220,38,38,0.04)"  };
  if (s === "medium" || s === "moderate") return { border:"1px solid rgba(217,119,6,0.3)", background:"rgba(217,119,6,0.04)"  };
  return { border:"1px solid rgba(232,116,97,0.12)", background:"#fafafa" };
};

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const Fade = ({ children }) => <div style={{ animation:"mhFadeUp .3s ease" }}>{children}</div>;

const PageHead = ({ title, sub, children }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
    <div>
      <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, fontWeight:400, color:"#1C1C1E", margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"#B0A4A2", marginTop:4, margin:0 }}>{sub}</p>}
    </div>
    {children && <div>{children}</div>}
  </div>
);

const CardLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:600, color:"#B0A4A2", letterSpacing:0.5, textTransform:"uppercase" }}>{children}</div>
);

const StatusPill = ({ status }) => {
  const st = statusPill(status);
  return <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{status}</span>;
};

const BtnPrimary = ({ children, onClick, style, disabled }) => (
  <button className="mh-btn-hover" disabled={disabled} onClick={onClick} style={{
    padding:"9px 20px", background:"#C0392B", color:"#fff", border:"none", borderRadius:9,
    fontSize:13, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
    fontFamily:"'DM Sans',sans-serif", transition:"all .18s", display:"inline-flex", alignItems:"center", gap:6, ...style
  }}>{children}</button>
);

const BtnGhost = ({ children, onClick, style, disabled }) => (
  <button className="mh-ghost-hover" disabled={disabled} onClick={onClick} style={{
    padding:"9px 20px", background:"transparent", color:"#8A7E7C", border:"1px solid rgba(232,116,97,0.2)",
    borderRadius:9, fontSize:13, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
    fontFamily:"'DM Sans',sans-serif", transition:"all .18s", display:"inline-flex", alignItems:"center", gap:6, ...style
  }}>{children}</button>
);

const Inp = ({ style, className, ...p }) => (
  <input className={`mh-input ${className||""}`} style={{
    padding:"9px 13px", border:"1px solid rgba(232,116,97,0.2)", borderRadius:9, fontSize:13,
    outline:"none", background:"#fff", width:"100%", fontFamily:"'DM Sans',sans-serif",
    color:"#1C1C1E", transition:"border-color .15s, box-shadow .15s", ...style
  }} {...p}/>
);

const Modal = ({ onClose, children, width=420 }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(28,28,30,0.4)", display:"flex", alignItems:"center",
    justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:"#fff", borderRadius:18, padding:28, width, maxHeight:"88vh", overflowY:"auto",
      boxShadow:"0 24px 60px rgba(192,57,43,0.12)", animation:"mhFadeUp .22s ease" }}>
      {children}
    </div>
  </div>
);

const Empty = ({ icon, text, onAction, actionLabel }) => (
  <div style={{ background:"#fff", borderRadius:18, padding:44, textAlign:"center",
    border:"1px solid rgba(232,116,97,0.12)", boxShadow:"0 2px 12px rgba(192,57,43,0.04)" }}>
    <div style={{ fontSize:38, marginBottom:12 }}>{icon}</div>
    <p style={{ color:"#B0A4A2", fontSize:14, marginBottom: onAction ? 16 : 0 }}>{text}</p>
    {onAction && <BtnPrimary onClick={onAction}>{actionLabel}</BtnPrimary>}
  </div>
);

const S = {
  root:     { display:"flex", height:"100vh", background:"#FDF2F0", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" },
  sidebar:  { width:220, background:"#fff", display:"flex", flexDirection:"column", flexShrink:0, borderRight:"1px solid rgba(232,116,97,0.12)", boxShadow:"2px 0 16px rgba(192,57,43,0.04)" },
  brand:    { padding:"20px 16px 14px", borderBottom:"1px solid rgba(232,116,97,0.1)", display:"flex", alignItems:"center", gap:10 },
  sideUser: { padding:"12px 14px", borderBottom:"1px solid rgba(232,116,97,0.08)", display:"flex", alignItems:"center", gap:10 },
  avatar:   { width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#C0392B,#E87461)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700, flexShrink:0 },
  navBtn:   { width:"100%", textAlign:"left", padding:"9px 14px", background:"transparent", color:"#8A7E7C", border:"none", cursor:"pointer", fontSize:13, borderRadius:8, transition:"all .15s", display:"flex", alignItems:"center", gap:9, fontFamily:"'DM Sans',sans-serif", fontWeight:500 },
  navActive:{ background:"rgba(192,57,43,0.08)", color:"#C0392B", fontWeight:600 },
  sideBtn:  { padding:"9px 14px", background:"#C0392B", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .18s" },
  card:     { background:"#fff", borderRadius:16, padding:"20px 22px", border:"1px solid rgba(232,116,97,0.1)", boxShadow:"0 2px 10px rgba(192,57,43,0.04)", transition:"all .2s" },
  statCard: { background:"#fff", borderRadius:16, padding:"20px 22px", border:"1px solid rgba(232,116,97,0.1)", boxShadow:"0 2px 10px rgba(192,57,43,0.04)", transition:"all .2s", display:"flex", flexDirection:"column" },
  token:    { fontSize:11, color:"#1A5276", background:"rgba(26,82,118,0.08)", padding:"3px 10px", borderRadius:20, fontWeight:700 },
  quickCard:{ background:"#fff", borderRadius:14, padding:"16px 10px", border:"1px solid rgba(232,116,97,0.1)", boxShadow:"0 2px 8px rgba(192,57,43,0.03)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all .2s" },
};

/* ══════════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const navigate = useNavigate();
  const [tab,      setTab]     = useState("overview");
  const [user,     setUser]    = useState(null);
  const [appts,    setAppts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [greeting, setGreeting]= useState("Good day");
  const [editMode, setEdit]    = useState(false);
  const [form,     setForm]    = useState({});
  const [saving,   setSaving]  = useState(false);
  const [saveMsg,  setSaveMsg] = useState("");
  const [vitals,   setVitals]  = useState([]);
  const [vForm,    setVForm]   = useState({ bp:"", pulse:"", sugar:"", temp:"", spo2:"", weight:"", note:"" });
  const [vSaving,  setVSaving] = useState(false);
  const [rxList,    setRxList]   = useState([]);
  const [rxForm,    setRxForm]   = useState({ doctorName:"", date:"", advice:"", fileUrl:"", notes:"" });
  const [rxMeds,    setRxMeds]   = useState([{ name:"", dosage:"", duration:"", timing:"After food" }]);
  const [addRxOpen, setAddRx]    = useState(false);
  const [rxSaving,  setRxSaving] = useState(false);
  const [contacts,  setContacts] = useState(() => { try { return JSON.parse(localStorage.getItem("mh_contacts")||"[]"); } catch { return []; } });
  const [cForm,     setCForm]    = useState({ name:"", relation:"", phone:"" });
  const [addCOpen,  setAddC]     = useState(false);
  const [aiMsgs,   setAiMsgs]  = useState([{ role:"assistant", text:"Hi! I'm MedGamma, your AI health assistant. Ask me anything about symptoms, medications, or general health. I'm not a substitute for a real doctor — but I'm here to help." }]);
  const [aiInput,  setAiInput] = useState("");
  const [aiLoad,   setAiLoad]  = useState(false);
  /* ── FIX #1: Declare missing image + imageLoading state ── */
  const [image,        setImage]        = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const aiRef = useRef(null);
  /* Teleconsult */
  const [tcAppt,   setTcAppt]  = useState(null);
  const [tcRoom,   setTcRoom]  = useState("");
  const [tcJoined, setTcJoin]  = useState(false);
  const [height,   setHeight]  = useState("");
  const [weight,   setWeight]  = useState("");
  const [bmi,      setBmi]     = useState(null);
  const [cancelling,  setCancelling]  = useState(null);
  const [cancelNote,  setCancelNote]  = useState("");
  const [ratingAppt,  setRatingAppt]  = useState(null);
  const [ratingVal,   setRatingVal]   = useState(5);
  const [ratingText,  setRatingText]  = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [uR, aR, vR, rxR] = await Promise.all([
          api.get("/auth/me"), api.get("/appointments/user"),
          api.get("/vitals"),  api.get("/prescriptions"),
        ]);
        setUser(uR.data);
        setForm({ username:uR.data.username||"", bloodGroup:uR.data.bloodGroup||"", address:uR.data.address||"", medicalHistory:uR.data.medicalHistory||"", allergies:uR.data.allergies||"", phone:uR.data.phone||"" });
        setAppts(Array.isArray(aR.data) ? aR.data : aR.data?.data || []);
        setVitals(Array.isArray(vR.data) ? vR.data : []);
        setRxList(Array.isArray(rxR.data) ? rxR.data : []);
      } catch { localStorage.clear(); navigate("/login"); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight; }, [aiMsgs]);

  const formatDate = d => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); } catch { return d; } };

  const safe     = Array.isArray(appts) ? appts : [];
  const total    = safe.length;
  const pending  = safe.filter(a => a.status === "pending").length;
  const approved = safe.filter(a => a.status === "approved").length;
  const done     = safe.filter(a => a.status === "done").length;
  const nextAppt = safe.find(a => ["pending","approved"].includes(a.status));
  const lv       = vitals[0];

  const saveProfile = async () => { setSaving(true); try { await api.put("/auth/me", form); setUser(p=>({...p,...form})); setSaveMsg("Saved"); setEdit(false); setTimeout(()=>setSaveMsg(""),3000); } catch { setSaveMsg("Save failed."); } finally { setSaving(false); } };
  const addVital = async () => { if (!vForm.bp&&!vForm.pulse&&!vForm.sugar&&!vForm.spo2&&!vForm.temp&&!vForm.weight) return; setVSaving(true); try { const res=await api.post("/vitals",vForm); setVitals(p=>[res.data,...p]); setVForm({bp:"",pulse:"",sugar:"",temp:"",spo2:"",weight:"",note:""}); } catch { alert("Failed to save vital"); } finally { setVSaving(false); } };
  const deleteVital = async id => { try { await api.delete(`/vitals/${id}`); setVitals(p=>p.filter(v=>v._id!==id)); } catch { alert("Failed"); } };
  const addMedRow = () => setRxMeds(p=>[...p,{name:"",dosage:"",duration:"",timing:"After food"}]);
  const updateMed = (i,k,v) => setRxMeds(p=>p.map((m,idx)=>idx===i?{...m,[k]:v}:m));
  const removeMed = i => setRxMeds(p=>p.filter((_,idx)=>idx!==i));
  const saveRx = async () => { if (!rxForm.doctorName&&!rxForm.fileUrl) return alert("Enter doctor name or file URL"); setRxSaving(true); try { const res=await api.post("/prescriptions",{...rxForm,medicines:rxMeds.filter(m=>m.name)}); setRxList(p=>[res.data,...p]); setRxForm({doctorName:"",date:"",advice:"",fileUrl:"",notes:""}); setRxMeds([{name:"",dosage:"",duration:"",timing:"After food"}]); setAddRx(false); } catch { alert("Failed"); } finally { setRxSaving(false); } };
  const deleteRx = async id => { try { await api.delete(`/prescriptions/${id}`); setRxList(p=>p.filter(r=>r._id!==id)); } catch(err) { alert(err.response?.data?.message||"Failed"); } };
  const saveContact = () => { if (!cForm.name||!cForm.phone) return; const u=[...contacts,{...cForm,id:Date.now()}]; setContacts(u); localStorage.setItem("mh_contacts",JSON.stringify(u)); setCForm({name:"",relation:"",phone:""}); setAddC(false); };
  const deleteContact = id => { const u=contacts.filter(c=>c.id!==id); setContacts(u); localStorage.setItem("mh_contacts",JSON.stringify(u)); };
  const cancelAppt = async (id,note) => { try { await api.put(`/appointments/cancel/${id}`,{note}); setAppts(p=>p.map(a=>a._id===id?{...a,status:"rejected"}:a)); setCancelling(null); setCancelNote(""); } catch(err) { alert(err.response?.data?.message||"Failed"); } };
  const rateAppt = async () => { try { await api.put(`/appointments/rate/${ratingAppt._id}`,{rating:ratingVal,review:ratingText}); setAppts(p=>p.map(a=>a._id===ratingAppt._id?{...a,patientRating:ratingVal}:a)); setRatingAppt(null); } catch(err) { alert(err.response?.data?.message||"Failed"); } };

  /* Teleconsult */
  const startTeleconsult = async (appt) => {
    setTcAppt(appt); setTcJoin(false);
    if (appt.teleconsultRoom) { setTcRoom(appt.teleconsultRoom); return; }
    try { const res=await api.put(`/appointments/teleconsult/${appt._id}`,{}); setTcRoom(res.data.roomCode); }
    catch { setTcRoom(`MH-${appt._id.slice(-6).toUpperCase()}`); }
  };

  /* ── FIX #2: handleImageUpload declared BEFORE renderAI ── */
  /* ── FIX #3: Safe API response with optional chaining    ── */
  /* ── FIX #7: Improved error handling                     ── */
  /* ── FIX #13: File type validation                        ── */
  const handleImageUpload = async () => {
    if (!image) return alert("Select an image first");

    // FIX #13: validate file type
    if (!image.type.startsWith("image/")) {
      return alert("Please upload a valid image file");
    }

    // FIX #5: Show user message in chat when uploading
    setAiMsgs(prev => [
      ...prev,
      { role: "user", text: "📸 Uploaded image for analysis" }
    ]);

    // FIX #6: Show analyzing indicator in chat
    setAiMsgs(prev => [
      ...prev,
      { role: "assistant", text: "🔍 Analyzing your image…", isLoading: true }
    ]);

    const formData = new FormData();
    formData.append("file", image);
    setImageLoading(true);

    try {
      // Do NOT set Content-Type manually — Axios sets it automatically with the correct boundary
      const res = await api.post("/ai/image", formData);

      // FIX #3: safe access with fallbacks
      const d = res?.data || {};
      const formatted = formatAIResponse(d);

      // Replace the "Analyzing..." placeholder with the real result
      setAiMsgs(prev => [
        ...prev.filter(m => !m.isLoading),
        { role: "assistant", text: formatted, severity: d?.severity }
      ]);

      // Emergency alert
      if (d?.severity?.toLowerCase() === "emergency") {
        alert("🚨 Emergency detected! Call 108 immediately!");
      }

    } catch (err) {
      // FIX #7: detailed error message
      console.error(err);
      setAiMsgs(prev => [
        ...prev.filter(m => !m.isLoading),
        { role: "assistant", text: "❌ Image analysis failed. Please try again." }
      ]);
      alert(err.response?.data?.message || "Image AI failed. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };

  const sendAI = async () => {
    const msg = aiInput.trim();
    if (!msg || aiLoad) return;

    setAiMsgs(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setAiLoad(true);

    try {
      const res = await api.post("/ai/symptoms", { text: msg });

      // FIX #3: safe access with fallbacks
      const d = res?.data || {};
      const formatted = formatAIResponse(d);

      setAiMsgs(prev => [
        ...prev,
        { role: "assistant", text: formatted, severity: d?.severity }
      ]);
    } catch (err) {
      console.error(err);
      setAiMsgs(prev => [
        ...prev,
        { role: "assistant", text: "❌ AI service failed. Please try again." }
      ]);
    } finally {
      setAiLoad(false);
    }
  };

  const calcBmi = () => { const h=parseFloat(height)/100,w=parseFloat(weight); if(h>0&&w>0) setBmi((w/(h*h)).toFixed(1)); };
  const bmiCat = b => {
    if(b<18.5) return {label:"Underweight",color:"#1A5276",bg:"rgba(26,82,118,0.08)"};
    if(b<25)   return {label:"Normal",color:"#C0392B",bg:"rgba(192,57,43,0.08)"};
    if(b<30)   return {label:"Overweight",color:"#E87461",bg:"rgba(232,116,97,0.1)"};
    return           {label:"Obese",color:"#7B1D2E",bg:"rgba(123,29,46,0.08)"};
  };
  const logout = () => { localStorage.clear(); navigate("/"); };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FDF2F0" }}>
      <div style={{ width:38, height:38, border:"3px solid rgba(232,116,97,0.2)", borderTop:"3px solid #C0392B", borderRadius:"50%", animation:"mhSpin 0.7s linear infinite" }}/>
    </div>
  );

  /* ── TAB RENDERERS ── */
  const renderOverview = () => (
    <Fade>
      <PageHead title={`${greeting}, ${user?.username?.split(" ")[0]} 👋`} sub="Here's a quick look at your health today."/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[{label:"Total Visits",v:total,color:"#C0392B"},{label:"Pending",v:pending,color:"#B45309"},{label:"Confirmed",v:approved,color:"#1A5276"},{label:"Completed",v:done,color:"#8A7E7C"}].map(s=>(
          <div key={s.label} style={S.statCard} className="mh-card-hover">
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:42,color:s.color,lineHeight:1,fontWeight:400}}>{s.v}</div>
            <div style={{fontSize:11,color:"#B0A4A2",fontWeight:600,marginTop:6,letterSpacing:0.3}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div style={S.card} className="mh-card-hover">
          <CardLabel>Next Appointment</CardLabel>
          {nextAppt?(
            <div style={{marginTop:10}}>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:"#1C1C1E"}}>Dr. {nextAppt.doctor?.username||"—"}</div>
              <div style={{fontSize:13,color:"#8A7E7C",marginTop:4}}>{nextAppt.hospital?.username} · {formatDate(nextAppt.date)} · {nextAppt.time}</div>
              <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center"}}><StatusPill status={nextAppt.status}/>{nextAppt.tokenNumber&&<span style={S.token}>🎫 {nextAppt.tokenNumber}</span>}</div>
            </div>
          ):(
            <div style={{marginTop:10}}><div style={{fontSize:13,color:"#B0A4A2"}}>No upcoming appointments</div><BtnPrimary style={{marginTop:14}} onClick={()=>navigate("/book")}>Book now →</BtnPrimary></div>
          )}
        </div>
        <div style={S.card} className="mh-card-hover">
          <CardLabel>Latest Vitals</CardLabel>
          {lv?(
            <div style={{marginTop:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{icon:"🩺",l:"BP",v:lv.bp},{icon:"💓",l:"Pulse",v:lv.pulse&&`${lv.pulse} bpm`},{icon:"🩸",l:"Sugar",v:lv.sugar&&`${lv.sugar} mg/dL`},{icon:"💨",l:"SpO₂",v:lv.spo2&&`${lv.spo2}%`}].filter(x=>x.v).map(x=>(
                  <div key={x.l} style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>{x.icon}</span><div><div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>{x.v}</div><div style={{fontSize:10,color:"#B0A4A2"}}>{x.l}</div></div></div>
                ))}
              </div>
              <div style={{fontSize:10,color:"#C8BBBA",marginTop:10}}>{lv.createdAt?new Date(lv.createdAt).toLocaleString("en-IN"):lv.date}</div>
            </div>
          ):(
            <div style={{marginTop:10}}><div style={{fontSize:13,color:"#B0A4A2"}}>No vitals logged yet</div><BtnPrimary style={{marginTop:14}} onClick={()=>setTab("vitals")}>Log vitals →</BtnPrimary></div>
          )}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[{icon:"🩸",l:"Blood Group",v:user?.bloodGroup||"—"},{icon:"💊",l:"Prescriptions",v:`${rxList.length} saved`},{icon:"🚨",l:"Emergency",v:`${contacts.length} contacts`},{icon:"🗺️",l:"Find Hospital",v:"View nearby",action:()=>setTab("map")}].map(x=>(
          <div key={x.l} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:x.action?"pointer":"default"}} className="mh-card-hover" onClick={x.action}>
            <span style={{fontSize:20,flexShrink:0}}>{x.icon}</span>
            <div><div style={{fontSize:10,color:"#B0A4A2",fontWeight:600,letterSpacing:0.3}}>{x.l}</div><div style={{fontSize:13,fontWeight:600,color:x.action?"#C0392B":"#1C1C1E",marginTop:2}}>{x.v}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
        {[{icon:"🗺️",l:"Find Hospital",id:"map"},{icon:"🎥",l:"Teleconsult",id:"teleconsult"},{icon:"💊",l:"Rx Vault",id:"prescriptions"},{icon:"💓",l:"Vitals",id:"vitals"},{icon:"✦",l:"MedGamma AI",id:"ai"},{icon:"🚨",l:"Emergency",id:"emergency"}].map(q=>(
          <div key={q.id} style={S.quickCard} className="mh-quick" onClick={()=>setTab(q.id)}>
            <span style={{fontSize:22}}>{q.icon}</span>
            <span style={{fontSize:11,fontWeight:500,color:"#8A7E7C",textAlign:"center",lineHeight:1.3}}>{q.l}</span>
          </div>
        ))}
      </div>
    </Fade>
  );

  const renderAppointments = () => (
    <Fade>
      <PageHead title="My Appointments" sub="All your bookings and their status"><BtnPrimary onClick={()=>navigate("/book")}>+ New</BtnPrimary></PageHead>
      {safe.length===0?<Empty icon="📋" text="No appointments yet" onAction={()=>navigate("/book")} actionLabel="Book now"/>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {safe.map(a=>(
            <div key={a._id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,padding:"18px 22px"}} className="mh-card-hover">
              <div>
                <div style={{fontFamily:"'Instrument Serif',serif",fontSize:19,color:"#1C1C1E"}}>Dr. {a.doctor?.username||"—"}</div>
                <div style={{fontSize:12,color:"#B0A4A2",marginTop:4}}>🏥 {a.hospital?.username||"—"} &nbsp;·&nbsp; 📅 {formatDate(a.date)} &nbsp;·&nbsp; 🕐 {a.time}</div>
                {a.prescription?.issuedAt&&<span style={{fontSize:11,color:"#7c3aed",background:"rgba(124,58,237,0.07)",padding:"2px 9px",borderRadius:20,marginTop:6,display:"inline-block",fontWeight:600}}>💊 Prescription issued</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <StatusPill status={a.status}/>
                {a.tokenNumber&&<span style={S.token}>🎫 {a.tokenNumber}</span>}
                {a.reportUrl&&<a href={a.reportUrl} target="_blank" rel="noreferrer" style={{color:"#C0392B",fontSize:12,fontWeight:600}}>📄 Report</a>}
                {["pending","approved"].includes(a.status)&&<BtnGhost style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setCancelling(a);setCancelNote("");}}>Cancel</BtnGhost>}
                {a.status==="done"&&!a.patientRating&&<BtnGhost style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setRatingAppt(a);setRatingVal(5);setRatingText("");}}>⭐ Rate</BtnGhost>}
                {a.patientRating&&<span style={{fontSize:13,color:"#f59e0b"}}>{"★".repeat(a.patientRating)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {cancelling&&(<Modal onClose={()=>setCancelling(null)}><div style={{fontSize:30,marginBottom:12}}>🗓</div><h3 style={{fontFamily:"'Instrument Serif',serif",fontWeight:400,fontSize:22,marginBottom:6}}>Cancel Appointment?</h3><p style={{fontSize:13,color:"#B0A4A2",marginBottom:20}}>Dr. {cancelling.doctor?.username} — {formatDate(cancelling.date)}</p><div style={{marginBottom:16}}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:6,fontWeight:600}}>Reason (optional)</label><Inp placeholder="e.g. Schedule conflict" value={cancelNote} onChange={e=>setCancelNote(e.target.value)}/></div><div style={{display:"flex",gap:10}}><BtnPrimary style={{flex:1,justifyContent:"center",background:"#DC2626"}} onClick={()=>cancelAppt(cancelling._id,cancelNote)}>Yes, Cancel</BtnPrimary><BtnGhost style={{flex:1,justifyContent:"center"}} onClick={()=>setCancelling(null)}>Keep it</BtnGhost></div></Modal>)}
      {ratingAppt&&(<Modal onClose={()=>setRatingAppt(null)}><div style={{fontSize:30,marginBottom:12}}>⭐</div><h3 style={{fontFamily:"'Instrument Serif',serif",fontWeight:400,fontSize:22,marginBottom:6}}>Rate Your Experience</h3><p style={{fontSize:13,color:"#B0A4A2",marginBottom:16}}>Dr. {ratingAppt.doctor?.username}</p><div style={{display:"flex",gap:6,marginBottom:18}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRatingVal(n)} style={{fontSize:28,background:"none",border:"none",cursor:"pointer",opacity:n<=ratingVal?1:0.2,transition:"opacity .15s"}}>★</button>)}</div><div style={{marginBottom:18}}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:6,fontWeight:600}}>Comment (optional)</label><Inp placeholder="How was your visit?" value={ratingText} onChange={e=>setRatingText(e.target.value)}/></div><div style={{display:"flex",gap:10}}><BtnPrimary style={{flex:1,justifyContent:"center"}} onClick={rateAppt}>Submit Rating</BtnPrimary><BtnGhost style={{flex:1,justifyContent:"center"}} onClick={()=>setRatingAppt(null)}>Skip</BtnGhost></div></Modal>)}
    </Fade>
  );

  const renderMap = () => (
    <Fade>
      <PageHead title="Find a Hospital" sub="Hospitals and clinics near your current location"/>
      <EmbeddedMap/>
      <p style={{fontSize:11,color:"#C8BBBA",textAlign:"center",marginTop:10}}>
        Allow location access to see nearby hospitals. Click a card or marker to book an appointment.
      </p>
    </Fade>
  );

  const renderTeleconsult = () => {
    const active = safe.filter(a => ["approved","in-progress"].includes(a.status));
    return (
      <Fade>
        <PageHead title="Teleconsultation" sub="Join your video consultation sessions"/>
        <div style={{...S.card,marginBottom:16}}>
          <CardLabel>Active Sessions</CardLabel>
          <div style={{marginTop:14}}>
            {active.length===0?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>🎥</div>
                <p style={{color:"#B0A4A2",fontSize:13,marginBottom:14}}>No active appointments for video consult.</p>
                <BtnGhost onClick={()=>setTab("appointments")}>Book an Appointment</BtnGhost>
              </div>
            ):active.map(a=>(
              <div key={a._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(232,116,97,0.08)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:42,height:42,borderRadius:12,background:"rgba(26,82,118,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>👨‍⚕️</div>
                  <div>
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:17,color:"#1C1C1E"}}>Dr. {a.doctor?.username}</div>
                    <div style={{fontSize:12,color:"#B0A4A2"}}>{formatDate(a.date)} · {a.time}</div>
                    {a.doctor?.specialization&&<div style={{fontSize:11,color:"#C8BBBA"}}>{a.doctor.specialization}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <StatusPill status={a.status}/>
                  <BtnPrimary style={{background:"#1A5276"}} onClick={()=>startTeleconsult(a)}>🎥 Join</BtnPrimary>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tcAppt&&(
          <div style={{...S.card,border:"2px solid rgba(26,82,118,0.18)",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:42,height:42,borderRadius:12,background:"rgba(26,82,118,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>🎥</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:"#1C1C1E"}}>Session with Dr. {tcAppt.doctor?.username}</div>
                <div style={{fontSize:12,color:"#B0A4A2"}}>{formatDate(tcAppt.date)} · {tcAppt.time}</div>
              </div>
              <button onClick={()=>{setTcAppt(null);setTcRoom("");setTcJoin(false);}} style={{background:"rgba(239,68,68,0.08)",color:"#DC2626",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>End Session</button>
            </div>
            <div style={{background:"rgba(26,82,118,0.05)",border:"1px solid rgba(26,82,118,0.12)",borderRadius:11,padding:"11px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,color:"#1A5276",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",marginBottom:3}}>Room Code</div>
                <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:"#1A5276",letterSpacing:"0.05em"}}>{tcRoom||"Generating…"}</div>
              </div>
              {tcRoom&&<button onClick={()=>navigator.clipboard.writeText(tcRoom)} style={{fontSize:11,color:"#1A5276",background:"rgba(26,82,118,0.1)",border:"none",borderRadius:7,padding:"5px 11px",cursor:"pointer",fontWeight:600}}>Copy</button>}
            </div>
            {tcRoom?(
              <div style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(26,82,118,0.15)",background:"#000"}}>
                <iframe
                  src={`https://meet.jit.si/MedicareHub-${tcRoom}`}
                  style={{width:"100%",height:480,border:"none",display:"block"}}
                  allow="camera; microphone; fullscreen; display-capture"
                  title="Video Consultation"
                />
              </div>
            ):(
              <div style={{textAlign:"center",padding:"20px 0",color:"#B0A4A2",fontSize:13}}>Generating room code…</div>
            )}
            <p style={{fontSize:11,color:"#C8BBBA",textAlign:"center",marginTop:10}}>
              Share code <strong style={{color:"#1A5276"}}>{tcRoom}</strong> with your doctor so they can join.
            </p>
          </div>
        )}

        <div style={{...S.card,background:"rgba(26,82,118,0.03)"}}>
          <CardLabel>How Teleconsult Works</CardLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14}}>
            {[["1","Book","Schedule with your doctor"],["2","Approve","Wait for confirmation"],["3","Join","Click Join when ready"],["4","Consult","Live video via Jit.si"]].map(([num,title,desc])=>(
              <div key={title} style={{textAlign:"center"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#1A5276",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,margin:"0 auto 8px"}}>{num}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#1A5276",marginBottom:3}}>{title}</div>
                <div style={{fontSize:11,color:"#8A7E7C",lineHeight:1.4}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Fade>
    );
  };

  const renderRx = () => (
    <Fade>
      <PageHead title="Rx Vault" sub="Doctor-issued and manually added prescriptions"><BtnPrimary onClick={()=>setAddRx(true)}>+ Add Manually</BtnPrimary></PageHead>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[["Total",rxList.length,"#C0392B"],["Doctor-Issued",rxList.filter(r=>!r.isManual).length,"#1A5276"],["Manual",rxList.filter(r=>r.isManual).length,"#8A7E7C"]].map(([label,val,col])=>(
          <div key={label} style={{...S.statCard,borderTop:`3px solid ${col}`}}>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:36,color:col,fontWeight:400}}>{val}</div>
            <div style={{fontSize:11,color:"#B0A4A2",fontWeight:600,marginTop:4}}>{label} Prescriptions</div>
          </div>
        ))}
      </div>
      {rxList.length===0?<Empty icon="💊" text="No prescriptions yet. Doctor-issued ones appear here automatically."/>:rxList.map(rx=>(
        <div key={rx._id} style={{...S.card,marginBottom:12}} className="mh-card-hover">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:"#1C1C1E"}}>Dr. {rx.doctorName||"Unknown"}</div>
              <div style={{fontSize:12,color:"#B0A4A2"}}>{rx.date?formatDate(rx.date):"No date"} · <span style={{background:rx.isManual?"rgba(124,58,237,0.07)":"rgba(192,57,43,0.07)",color:rx.isManual?"#7c3aed":"#C0392B",padding:"1px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>{rx.isManual?"Manual":"Doctor-issued"}</span></div>
              {rx.medicines?.length>0&&(<div style={{marginTop:12,borderTop:"1px solid rgba(232,116,97,0.1)",paddingTop:12}}><div style={{fontSize:10,fontWeight:700,color:"#B0A4A2",letterSpacing:0.4,textTransform:"uppercase",marginBottom:8}}>Medicines</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>{rx.medicines.map((m,i)=><div key={i} style={{background:"#fafafa",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(232,116,97,0.12)"}}><div style={{fontWeight:600,fontSize:13,color:"#1C1C1E"}}>{m.name}</div><div style={{fontSize:11,color:"#B0A4A2",marginTop:2}}>{m.dosage} · {m.duration} · {m.timing}</div></div>)}</div></div>)}
              {rx.advice&&<div style={{fontSize:13,color:"#7c3aed",marginTop:10,padding:"8px 12px",background:"rgba(124,58,237,0.05)",borderRadius:10}}>📝 {rx.advice}</div>}
              {rx.fileUrl&&<a href={rx.fileUrl} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#1A5276",marginTop:8,display:"inline-flex",alignItems:"center",gap:4}}>📄 View File</a>}
            </div>
            {rx.isManual&&<button onClick={()=>deleteRx(rx._id)} style={{color:"#DC2626",background:"rgba(239,68,68,0.07)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:14,marginLeft:12,flexShrink:0}}>🗑</button>}
          </div>
        </div>
      ))}
      {addRxOpen&&(<Modal onClose={()=>setAddRx(false)} width={540}>
        <h3 style={{fontFamily:"'Instrument Serif',serif",fontWeight:400,fontSize:22,marginBottom:20}}>Add Prescription</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>Doctor Name *</label><Inp value={rxForm.doctorName} onChange={e=>setRxForm(p=>({...p,doctorName:e.target.value}))} placeholder="Dr. Name"/></div>
          <div><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>Date</label><Inp type="date" value={rxForm.date} onChange={e=>setRxForm(p=>({...p,date:e.target.value}))}/></div>
        </div>
        <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E",marginBottom:10}}>Medicines</div>
        {rxMeds.map((m,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1.2fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
            <Inp placeholder="Medicine name" value={m.name} onChange={e=>updateMed(i,"name",e.target.value)}/>
            <Inp placeholder="Dosage" value={m.dosage} onChange={e=>updateMed(i,"dosage",e.target.value)}/>
            <Inp placeholder="Duration" value={m.duration} onChange={e=>updateMed(i,"duration",e.target.value)}/>
            <select value={m.timing} onChange={e=>updateMed(i,"timing",e.target.value)} style={{padding:"9px 8px",border:"1px solid rgba(232,116,97,0.2)",borderRadius:9,fontSize:13,background:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",color:"#1C1C1E"}}>
              {["Before food","After food","With food","Bedtime"].map(t=><option key={t}>{t}</option>)}
            </select>
            {rxMeds.length>1&&<button onClick={()=>removeMed(i)} style={{color:"#DC2626",background:"rgba(239,68,68,0.07)",border:"none",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:14}}>×</button>}
          </div>
        ))}
        <button onClick={addMedRow} style={{fontSize:13,color:"#C0392B",background:"none",border:"1px dashed rgba(192,57,43,0.3)",borderRadius:9,padding:"8px 16px",cursor:"pointer",marginBottom:14,width:"100%",fontWeight:600}}>+ Add Medicine Row</button>
        <div style={{marginBottom:12}}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>Doctor's Advice</label><textarea value={rxForm.advice} onChange={e=>setRxForm(p=>({...p,advice:e.target.value}))} rows={2} style={{width:"100%",padding:"9px 13px",border:"1px solid rgba(232,116,97,0.2)",borderRadius:9,fontSize:13,resize:"vertical",background:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",color:"#1C1C1E"}}/></div>
        <div style={{marginBottom:20}}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>File URL (optional)</label><Inp placeholder="https://…" value={rxForm.fileUrl} onChange={e=>setRxForm(p=>({...p,fileUrl:e.target.value}))}/></div>
        <div style={{display:"flex",gap:10}}><BtnPrimary onClick={saveRx} disabled={rxSaving} style={{flex:1,justifyContent:"center"}}>{rxSaving?"Saving…":"Save Prescription"}</BtnPrimary><BtnGhost onClick={()=>setAddRx(false)} style={{flex:1,justifyContent:"center"}}>Cancel</BtnGhost></div>
      </Modal>)}
    </Fade>
  );

  const renderVitals = () => (
    <Fade>
      <PageHead title="Vitals Tracker" sub="Track and monitor your health metrics"/>
      <div style={{...S.card,marginBottom:18}}>
        <CardLabel>Log Today's Vitals</CardLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:14,marginBottom:12}}>
          {[["🩸 Blood Pressure","bp","e.g. 120/80"],["💓 Pulse (bpm)","pulse","e.g. 72"],["🍬 Blood Sugar","sugar","e.g. 95"],["🌡️ Temperature","temp","e.g. 98.6°F"],["💨 SpO₂ (%)","spo2","e.g. 99"],["⚖️ Weight","weight","e.g. 65 kg"]].map(([label,key,ph])=>(
            <div key={key}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>{label}</label><Inp placeholder={ph} value={vForm[key]} onChange={e=>setVForm(p=>({...p,[key]:e.target.value}))}/></div>
          ))}
        </div>
        <Inp placeholder="Note (optional)" value={vForm.note} onChange={e=>setVForm(p=>({...p,note:e.target.value}))} style={{marginBottom:14}}/>
        <BtnPrimary onClick={addVital} disabled={vSaving}>{vSaving?"Saving…":"Log Vitals"}</BtnPrimary>
      </div>
      <div style={S.card}>
        <CardLabel>History</CardLabel>
        {vitals.length===0?<p style={{color:"#B0A4A2",fontSize:13,textAlign:"center",padding:"24px 0"}}>No vitals logged yet.</p>:vitals.map(v=>(
          <div key={v._id} style={{padding:"14px 0",borderBottom:"1px solid rgba(232,116,97,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:"#C8BBBA",marginBottom:8}}>{v.createdAt?new Date(v.createdAt).toLocaleString("en-IN"):v.date}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["BP",v.bp,"#C0392B"],["Pulse",v.pulse,"#B45309"],["Sugar",v.sugar,"#7c3aed"],["Temp",v.temp,"#1A5276"],["SpO₂",v.spo2,"#C0392B"],["Weight",v.weight,"#8A7E7C"]].filter(([,val])=>val).map(([lbl,val,col])=>(
                  <span key={lbl} style={{fontSize:12,background:"#fafafa",border:"1px solid rgba(232,116,97,0.12)",padding:"4px 12px",borderRadius:20}}><strong style={{color:col}}>{lbl}</strong> {val}</span>
                ))}
              </div>
              {v.note&&<div style={{fontSize:11,color:"#C8BBBA",marginTop:6}}>📝 {v.note}</div>}
            </div>
            <button onClick={()=>deleteVital(v._id)} style={{color:"#DC2626",background:"rgba(239,68,68,0.07)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13,marginLeft:12,flexShrink:0}}>🗑</button>
          </div>
        ))}
      </div>
    </Fade>
  );

  /* ── renderAI: uses handleImageUpload declared above ── */
  const renderAI = () => (
    <Fade>
      <div style={{ height: "calc(100vh - 130px)", display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#7c3aed,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", color: "#fff"
          }}>✦</div>
          <div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: "#1C1C1E" }}>
              MedGamma AI
            </div>
            <div style={{ fontSize: 12, color: "#B0A4A2" }}>Symptom checker & health guidance</div>
          </div>
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#C0392B",
            background: "rgba(192,57,43,0.07)", padding: "4px 12px", borderRadius: 20
          }}>● Online</span>
        </div>

        {/* CHAT BOX */}
        <div ref={aiRef} style={{
          flex: 1, overflowY: "auto", background: "#fff", borderRadius: 16,
          padding: "16px 20px", marginBottom: 14,
          border: "1px solid rgba(232,116,97,0.15)",
          boxShadow: "0 2px 10px rgba(192,57,43,0.04)"
        }}>
          {aiMsgs.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 14
            }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", color: "#fff", marginRight: 10, marginTop: 2, flexShrink: 0
                }}>✦</div>
              )}
              {/* FIX #11: severity-based background color for assistant messages */}
              <div style={{
                maxWidth: "70%",
                padding: "11px 15px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "#C0392B" : "#fafafa",
                color: m.role === "user" ? "#fff" : "#1C1C1E",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                ...(m.role === "assistant" ? severityColor(m.severity) : {})
              }}>
                {m.role === "assistant" && (
                  <span style={{
                    fontSize: 10, color: "#7c3aed", fontWeight: 700,
                    display: "block", marginBottom: 4
                  }}>MedGamma</span>
                )}
                {/* Show pulse dots for the loading placeholder */}
                {m.isLoading ? (
                  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
                    {[0,1,2].map(idx => (
                      <div key={idx} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#7c3aed",
                        animation: `mhDot 1.2s ${idx * 0.2}s ease infinite`
                      }}/>
                    ))}
                  </div>
                ) : m.text}
              </div>
            </div>
          ))}

          {aiLoad && (
            <div style={{ display: "flex", gap: 5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#C0392B",
                  animation: `mhDot 1.2s ${i * 0.2}s ease infinite`
                }}/>
              ))}
            </div>
          )}
        </div>

        {/* TEXT INPUT */}
        {/* FIX #4: Shift+Enter for newline, Enter alone sends */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendAI();
              }
            }}
            placeholder="Describe your symptoms… (Enter to send, Shift+Enter for newline)"
            className="mh-input"
            style={{ flex: 1, padding: "12px 16px", borderRadius: 12 }}
          />
          <BtnPrimary onClick={sendAI} disabled={aiLoad || !aiInput.trim()}>
            Send →
          </BtnPrimary>
        </div>

        {/* IMAGE AI SECTION */}
        <div style={{
          marginTop: 12, background: "#fff", padding: "12px 14px",
          borderRadius: 12, border: "1px solid rgba(232,116,97,0.15)"
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1C1E", marginBottom: 8 }}>
            📸 Analyze Medical Image
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ fontSize: 12, color: "#8A7E7C", flex: 1, minWidth: 0 }}
            />
            {/* FIX #5: Show selected file name as preview indicator */}
            {image && (
              <span style={{
                fontSize: 11, color: "#7c3aed", background: "rgba(124,58,237,0.07)",
                padding: "3px 10px", borderRadius: 20, fontWeight: 600, flexShrink: 0
              }}>
                ✓ {image.name?.length > 20 ? image.name.slice(0,20) + "…" : image.name}
              </span>
            )}
            <button
              onClick={handleImageUpload}
              disabled={imageLoading || !image}
              style={{
                background: imageLoading ? "#8A7E7C" : "#1A5276",
                color: "#fff", border: "none", padding: "8px 16px",
                borderRadius: 8, cursor: imageLoading || !image ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                transition: "background .15s", flexShrink: 0,
                opacity: !image ? 0.6 : 1
              }}
            >
              {imageLoading ? "Analyzing…" : "Upload & Analyze"}
            </button>
          </div>
        </div>
      </div>
    </Fade>
  );

  const renderProfile = () => (
    <Fade>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,fontWeight:400,color:"#1C1C1E",margin:0}}>Health Profile</h2><p style={{fontSize:13,color:"#B0A4A2",marginTop:4}}>Manage your personal health information</p></div>
        {!editMode?<BtnGhost onClick={()=>setEdit(true)}>✏️ Edit Profile</BtnGhost>:<div style={{display:"flex",gap:10}}><BtnPrimary onClick={saveProfile} disabled={saving}>{saving?"Saving…":"Save Changes"}</BtnPrimary><BtnGhost onClick={()=>setEdit(false)}>Cancel</BtnGhost></div>}
      </div>
      {saveMsg&&<div style={{background:"rgba(192,57,43,0.07)",color:"#C0392B",padding:"10px 16px",borderRadius:10,marginBottom:18,fontSize:13,fontWeight:600}}>{saveMsg}</div>}
      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#C0392B,#E87461)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",color:"#fff",fontWeight:700,fontFamily:"'Instrument Serif',serif",flexShrink:0}}>{(user?.username||"?").charAt(0).toUpperCase()}</div>
          <div><div style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:"#1C1C1E"}}>{user?.username}</div><div style={{fontSize:13,color:"#B0A4A2"}}>{user?.email}</div>{form.bloodGroup&&<span style={{fontSize:11,fontWeight:700,color:"#C0392B",background:"rgba(192,57,43,0.07)",padding:"3px 10px",borderRadius:20,marginTop:4,display:"inline-block"}}>🩸 {form.bloodGroup}</span>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
          {[["Full Name","username","text"],["Phone","phone","tel"],["Address","address","text"],["Allergies","allergies","text"]].map(([label,key,type])=>(
            <div key={key}><label style={{fontSize:10,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"}}>{label}</label>{editMode?<Inp type={type} value={form[key]||""} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>:<div style={{fontSize:14,fontWeight:500,color:form[key]?"#1C1C1E":"#C8BBBA"}}>{form[key]||"Not set"}</div>}</div>
          ))}
          <div><label style={{fontSize:10,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"}}>Blood Group</label>{editMode?<select value={form.bloodGroup||""} onChange={e=>setForm(p=>({...p,bloodGroup:e.target.value}))} style={{padding:"9px 13px",border:"1px solid rgba(232,116,97,0.2)",borderRadius:9,fontSize:13,width:"100%",background:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",color:"#1C1C1E"}}><option value="">Select</option>{BLOOD_GROUPS.map(g=><option key={g}>{g}</option>)}</select>:<div style={{fontSize:14,fontWeight:500,color:form.bloodGroup?"#C0392B":"#C8BBBA"}}>{form.bloodGroup||"Not set"}</div>}</div>
        </div>
        <div><label style={{fontSize:10,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"}}>Medical History</label>{editMode?<textarea value={form.medicalHistory||""} onChange={e=>setForm(p=>({...p,medicalHistory:e.target.value}))} rows={4} style={{width:"100%",padding:"9px 13px",border:"1px solid rgba(232,116,97,0.2)",borderRadius:9,fontSize:13,resize:"vertical",background:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",color:"#1C1C1E"}}/>:<div style={{fontSize:14,color:form.medicalHistory?"#1C1C1E":"#C8BBBA",lineHeight:1.7}}>{form.medicalHistory||"Not set"}</div>}</div>
      </div>
    </Fade>
  );

  const renderHistory = () => (
    <Fade>
      <PageHead title="Appointment History" sub="Past and completed consultations"/>
      {safe.filter(a=>["done","rejected"].includes(a.status)).length===0?<Empty icon="🗂️" text="No past appointments yet."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {safe.filter(a=>["done","rejected"].includes(a.status)).map(a=>(
            <div key={a._id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,padding:"18px 22px"}} className="mh-card-hover">
              <div><div style={{fontFamily:"'Instrument Serif',serif",fontSize:19,color:"#1C1C1E"}}>Dr. {a.doctor?.username||"—"}</div><div style={{fontSize:12,color:"#B0A4A2",marginTop:4}}>🏥 {a.hospital?.username||"—"} · 📅 {formatDate(a.date)} · 🕐 {a.time}</div></div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}><StatusPill status={a.status}/>{a.patientRating&&<span style={{fontSize:13,color:"#f59e0b"}}>{"★".repeat(a.patientRating)}</span>}{a.reportUrl&&<a href={a.reportUrl} target="_blank" rel="noreferrer" style={{color:"#C0392B",fontSize:12,fontWeight:600}}>📄 Report</a>}</div>
            </div>
          ))}
        </div>
      )}
    </Fade>
  );

  const renderBmi = () => (
    <Fade>
      <PageHead title="BMI & Health Tools" sub="Quick health calculators"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={S.card}>
          <CardLabel>BMI Calculator</CardLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"14px 0"}}>
            <div><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>Height (cm)</label><Inp type="number" placeholder="170" value={height} onChange={e=>setHeight(e.target.value)}/></div>
            <div><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>Weight (kg)</label><Inp type="number" placeholder="65" value={weight} onChange={e=>setWeight(e.target.value)}/></div>
          </div>
          <BtnPrimary onClick={calcBmi} style={{width:"100%",justifyContent:"center",marginBottom:16}}>Calculate BMI</BtnPrimary>
          {bmi&&(()=>{const cat=bmiCat(bmi);return(<div style={{textAlign:"center",padding:"20px 16px",background:cat.bg,borderRadius:14}}><div style={{fontFamily:"'Instrument Serif',serif",fontSize:52,color:cat.color,fontWeight:400}}>{bmi}</div><div style={{fontSize:16,fontWeight:600,color:cat.color,marginTop:4}}>{cat.label}</div><div style={{fontSize:11,color:"#B0A4A2",marginTop:8,lineHeight:1.6}}>Underweight &lt;18.5 · Normal 18.5–24.9<br/>Overweight 25–29.9 · Obese ≥30</div></div>);})()}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["💓","Heart Rate Zones","Calculate target HR zones for your age & fitness goal.","#C0392B"],["💧","Water Intake","Daily water requirement based on weight and activity.","#1A5276"],["🍳","Calorie Tracker","Estimate daily caloric needs based on your profile.","#C0392B"]].map(([icon,label,desc,col])=>(
            <div key={label} style={{...S.card,display:"flex",gap:14,cursor:"pointer",alignItems:"center"}} className="mh-card-hover" onClick={()=>navigate("/tools")}>
              <div style={{width:46,height:46,borderRadius:12,background:`${col}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>{icon}</div>
              <div><div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:"#1C1C1E",marginBottom:3}}>{label}</div><div style={{fontSize:12,color:"#B0A4A2"}}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </Fade>
  );

  const renderEmergency = () => (
    <Fade>
      <PageHead title="Emergency" sub="Emergency contacts and national helplines"><BtnPrimary onClick={()=>setAddC(true)}>+ Add Contact</BtnPrimary></PageHead>
      <div style={{background:"rgba(192,57,43,0.04)",border:"1px solid rgba(192,57,43,0.12)",borderRadius:18,padding:22,marginBottom:20}}>
        <CardLabel>🆘 Emergency Numbers (India)</CardLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginTop:14}}>
          {[["Ambulance","108","#C0392B"],["Police","100","#1A5276"],["Fire","101","#d97706"],["Women Helpline","1091","#7c3aed"],["National Emergency","112","#DC2626"]].map(([label,num,col])=>(
            <a key={label} href={`tel:${num}`} style={{textDecoration:"none",background:"#fff",borderRadius:14,padding:"14px 16px",display:"block",border:"1px solid rgba(232,116,97,0.12)",transition:"box-shadow .15s"}}>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:col,fontWeight:400}}>{num}</div>
              <div style={{fontSize:11,color:"#B0A4A2",marginTop:4}}>{label}</div>
            </a>
          ))}
        </div>
      </div>
      <CardLabel>Personal Contacts</CardLabel>
      {contacts.length===0?<Empty icon="👤" text="No personal emergency contacts added yet."/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12,marginTop:14}}>
          {contacts.map(c=>(
            <div key={c.id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center"}} className="mh-card-hover">
              <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:12,background:"rgba(192,57,43,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>👤</div><div><div style={{fontWeight:600,color:"#1C1C1E",fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:"#B0A4A2"}}>{c.relation}</div><a href={`tel:${c.phone}`} style={{fontSize:13,color:"#C0392B",fontWeight:700}}>{c.phone}</a></div></div>
              <button onClick={()=>deleteContact(c.id)} style={{color:"#DC2626",background:"rgba(239,68,68,0.07)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13}}>🗑</button>
            </div>
          ))}
        </div>
      )}
      {addCOpen&&(<Modal onClose={()=>setAddC(false)} width={380}><h3 style={{fontFamily:"'Instrument Serif',serif",fontWeight:400,fontSize:22,marginBottom:20}}>Add Emergency Contact</h3>{[["Name","name","text"],["Relation","relation","text"],["Phone","phone","tel"]].map(([label,key,type])=>(<div key={key} style={{marginBottom:14}}><label style={{fontSize:11,color:"#B0A4A2",display:"block",marginBottom:5,fontWeight:600}}>{label}</label><Inp type={type} value={cForm[key]} onChange={e=>setCForm(p=>({...p,[key]:e.target.value}))}/></div>))}<div style={{display:"flex",gap:10}}><BtnPrimary onClick={saveContact} style={{flex:1,justifyContent:"center"}}>Save</BtnPrimary><BtnGhost onClick={()=>setAddC(false)} style={{flex:1,justifyContent:"center"}}>Cancel</BtnGhost></div></Modal>)}
    </Fade>
  );

  const renderTab = () => {
    switch(tab){
      case "overview":      return renderOverview();
      case "appointments":  return renderAppointments();
      case "map":           return renderMap();
      case "teleconsult":   return renderTeleconsult();
      case "prescriptions": return renderRx();
      case "vitals":        return renderVitals();
      case "ai":            return renderAI();
      case "profile":       return renderProfile();
      case "history":       return renderHistory();
      case "bmi":           return renderBmi();
      case "emergency":     return renderEmergency();
      default: return null;
    }
  };

  /* ── LAYOUT ── */
  return(
    <div style={S.root}>
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#C0392B,#E87461)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",boxShadow:"0 4px 10px rgba(192,57,43,0.3)",flexShrink:0}}>⚕</div>
          <div><div style={{fontSize:15,fontWeight:600,color:"#1C1C1E",fontFamily:"'DM Sans',sans-serif"}}>Medicare<span style={{color:"#E87461"}}>Hub</span></div><div style={{fontSize:10,color:"#B0A4A2",letterSpacing:0.3}}>Patient Portal</div></div>
        </div>
        <div style={S.sideUser}>
          <div style={S.avatar}>{user?.username?.[0]?.toUpperCase()||"P"}</div>
          <div style={{overflow:"hidden",flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.username}</div>
            <div style={{fontSize:11,color:"#B0A4A2",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
          </div>
        </div>
        <nav style={{padding:"10px 10px",flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} className="mh-nav-btn" style={{...S.navBtn,...(tab===n.id?S.navActive:{})}} onClick={()=>setTab(n.id)}>
              <span style={{fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.id==="ai"&&<span style={{background:"rgba(192,57,43,0.1)",color:"#C0392B",fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:4,letterSpacing:0.5}}>AI</span>}
              {n.id==="map"&&<span style={{background:"rgba(26,82,118,0.1)",color:"#1A5276",fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:4,letterSpacing:0.5}}>GPS</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"10px 10px",borderTop:"1px solid rgba(232,116,97,0.1)",display:"flex",flexDirection:"column",gap:6}}>
          <button className="mh-btn-hover" style={S.sideBtn} onClick={()=>navigate("/book")}>+ Book Appointment</button>
          <button className="mh-ghost-hover" style={{...S.sideBtn,background:"transparent",color:"#B0A4A2",border:"1px solid rgba(232,116,97,0.15)"}} onClick={logout}>↩ Logout</button>
        </div>
      </aside>
      <main style={{flex:1,overflowY:"auto",padding:"36px 40px",background:"#FDF2F0"}}>
        {renderTab()}
      </main>
    </div>
  );
}