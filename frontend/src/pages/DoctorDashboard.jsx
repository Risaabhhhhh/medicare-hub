import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";

if (!document.getElementById("hd-fonts")) {
  const l = document.createElement("link");
  l.id = "hd-fonts";
  l.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
}
if (!document.getElementById("hd-anim")) {
  const s = document.createElement("style");
  s.id = "hd-anim";
  s.textContent = `
    @keyframes hdSpin { to{transform:rotate(360deg);} }
    @keyframes hdUp   { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
    .hd-nav:hover     { background:rgba(192,57,43,0.06)!important; color:#C0392B!important; }
    .hd-row:hover     { background:#FDF2F0!important; }
    .hd-card:hover    { transform:translateY(-2px); box-shadow:0 10px 28px rgba(192,57,43,0.09)!important; }
    .hd-inp:focus     { border-color:#C0392B!important; box-shadow:0 0 0 3px rgba(192,57,43,0.08)!important; outline:none; }
    .hd-inp::placeholder { color:#C8BBBA; }
    .hd-btn-hover:hover  { background:#7B1D2E!important; transform:translateY(-1px); }
    .hd-ghost-hover:hover{ border-color:#C0392B!important; color:#C0392B!important; background:rgba(192,57,43,0.04)!important; }
    ::-webkit-scrollbar       { width:4px; }
    ::-webkit-scrollbar-thumb { background:rgba(232,116,97,0.2); border-radius:8px; }
  `;
  document.head.appendChild(s);
}

const NAV_HOSPITAL = [
  { id:"overview",     icon:"◈",  label:"Overview"       },
  { id:"appointments", icon:"📋", label:"Appointments"   },
  { id:"doctors",      icon:"👨‍⚕️", label:"Doctors"        },
  { id:"walkin",       icon:"🚶", label:"Walk-in Token"  },
  { id:"queue",        icon:"🔢", label:"Live Queue"     },
  { id:"reports",      icon:"📊", label:"Reports"        },
];
const NAV_DOCTOR = [
  { id:"overview",     icon:"◈",  label:"Overview"      },
  { id:"appointments", icon:"📋", label:"Appointments"  },
  { id:"queue",        icon:"🔢", label:"My Queue"      },
  { id:"reports",      icon:"📊", label:"Reports"       },
];

function statusCfg(s) {
  return ({
    pending:       { bg:"rgba(217,119,6,0.09)",   color:"#B45309", dot:"#F59E0B" },
    approved:      { bg:"rgba(192,57,43,0.08)",   color:"#C0392B", dot:"#C0392B" },
    rejected:      { bg:"rgba(239,68,68,0.08)",   color:"#DC2626", dot:"#EF4444" },
    "in-progress": { bg:"rgba(26,82,118,0.09)",   color:"#1A5276", dot:"#1A5276" },
    done:          { bg:"rgba(176,164,162,0.12)", color:"#8A7E7C", dot:"#B0A4A2" },
  })[s] || { bg:"rgba(176,164,162,0.1)", color:"#8A7E7C", dot:"#C8BBBA" };
}

/* ── Shared micro-components ── */
const Fade    = ({ children }) => <div style={{ animation:"hdUp .3s ease" }}>{children}</div>;

const PH = ({ title, sub, children }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
    <div>
      <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, fontWeight:400, color:"#1C1C1E", margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"#B0A4A2", marginTop:3, margin:0 }}>{sub}</p>}
    </div>
    {children && <div>{children}</div>}
  </div>
);

const CL    = ({ children }) => <div style={{ fontSize:10, fontWeight:600, color:"#B0A4A2", letterSpacing:0.5, textTransform:"uppercase" }}>{children}</div>;
const FL    = ({ children }) => <div style={{ fontSize:11, color:"#B0A4A2", fontWeight:600, letterSpacing:0.3 }}>{children}</div>;
const Muted = ({ children }) => <div style={{ fontSize:13, color:"#B0A4A2", padding:"16px 0" }}>{children}</div>;

const SPill = ({ status }) => {
  const c = statusCfg(status);
  return (
    <span style={{ background:c.bg, color:c.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.dot, display:"inline-block" }}/>
      {status}
    </span>
  );
};

const Btn = ({ children, onClick, style, disabled }) => (
  <button className="hd-btn-hover" disabled={disabled} onClick={onClick} style={{
    padding:"8px 18px", background:"#C0392B", color:"#fff", border:"none", borderRadius:9,
    fontSize:13, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
    fontFamily:"'DM Sans',sans-serif", transition:"all .18s", display:"inline-flex", alignItems:"center", gap:6,
    ...style
  }}>{children}</button>
);

const GhostBtn = ({ children, onClick, style }) => (
  <button className="hd-ghost-hover" onClick={onClick} style={{
    padding:"8px 16px", background:"transparent", color:"#8A7E7C", border:"1px solid rgba(232,116,97,0.2)",
    borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", transition:"all .18s",
    ...style
  }}>{children}</button>
);

const AB = ({ children, onClick, color="#C0392B" }) => (
  <button onClick={onClick} style={{
    padding:"4px 10px", background:`${color}12`, color, border:`1px solid ${color}22`,
    borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
    transition:"background .15s", whiteSpace:"nowrap",
  }}>{children}</button>
);

const TH = ({ children }) => <th style={{ padding:"8px 14px", textAlign:"left", fontSize:10, color:"#B0A4A2", fontWeight:700, letterSpacing:0.4, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{children}</th>;
const TD = ({ children }) => <td style={{ padding:"11px 14px", fontSize:13, color:"#1C1C1E", borderBottom:"1px solid rgba(232,116,97,0.07)", fontFamily:"'DM Sans',sans-serif", verticalAlign:"middle" }}>{children}</td>;

const Empty = ({ icon, text, onAction, actionLabel }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:44, textAlign:"center", border:"1px solid rgba(232,116,97,0.1)" }}>
    <div style={{ fontSize:36, marginBottom:10 }}>{icon}</div>
    <p style={{ color:"#B0A4A2", fontSize:14, marginBottom: onAction ? 16 : 0 }}>{text}</p>
    {onAction && <Btn onClick={onAction}>{actionLabel}</Btn>}
  </div>
);

const Modal = ({ onClose, children, width=460 }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(28,28,30,0.4)", display:"flex", alignItems:"center",
    justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:"#fff", borderRadius:18, padding:28, width, maxHeight:"88vh", overflowY:"auto",
      boxShadow:"0 24px 60px rgba(192,57,43,0.12)", animation:"hdUp .22s ease" }}>
      {children}
    </div>
  </div>
);

const FI = { padding:"8px 12px", border:"1px solid rgba(232,116,97,0.18)", borderRadius:9, fontSize:13,
  background:"#fff", fontFamily:"'DM Sans',sans-serif", color:"#1C1C1E", minWidth:130 };

const S = {
  root:    { display:"flex", height:"100vh", background:"#FDF2F0", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" },
  sidebar: { width:220, background:"#fff", display:"flex", flexDirection:"column", flexShrink:0, borderRight:"1px solid rgba(232,116,97,0.12)", boxShadow:"2px 0 16px rgba(192,57,43,0.04)" },
  brand:   { padding:"20px 16px 14px", borderBottom:"1px solid rgba(232,116,97,0.1)", display:"flex", alignItems:"center", gap:10 },
  userRow: { padding:"12px 14px", borderBottom:"1px solid rgba(232,116,97,0.08)", display:"flex", alignItems:"center", gap:10 },
  avatar:  { width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#C0392B,#E87461)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700, flexShrink:0 },
  navBtn:  { width:"100%", textAlign:"left", padding:"9px 14px", background:"transparent", color:"#8A7E7C", border:"none", cursor:"pointer", fontSize:13, borderRadius:8, transition:"all .15s", display:"flex", alignItems:"center", gap:9, fontFamily:"'DM Sans',sans-serif", fontWeight:500 },
  navActive:{ background:"rgba(192,57,43,0.08)", color:"#C0392B", fontWeight:600 },
  logoutBtn:{ width:"100%", padding:"9px 14px", background:"transparent", color:"#B0A4A2", border:"1px solid rgba(232,116,97,0.15)", borderRadius:9, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" },
  main:    { flex:1, overflowY:"auto", padding:"36px 40px", background:"#FDF2F0" },
  card:    { background:"#fff", borderRadius:16, padding:"20px 22px", border:"1px solid rgba(232,116,97,0.1)", boxShadow:"0 2px 10px rgba(192,57,43,0.04)", marginBottom:16, transition:"all .2s" },
  statCard:{ background:"#fff", borderRadius:16, padding:"18px 20px", border:"1px solid rgba(232,116,97,0.1)", boxShadow:"0 2px 10px rgba(192,57,43,0.04)", transition:"all .2s" },
  inp:     { padding:"9px 13px", border:"1px solid rgba(232,116,97,0.18)", borderRadius:9, fontSize:13, background:"#fff", width:"100%", fontFamily:"'DM Sans',sans-serif", color:"#1C1C1E", transition:"border-color .15s, box-shadow .15s", outline:"none" },
};

const PIE_COLORS = ["#F59E0B", "#C0392B", "#1A5276", "#8A7E7C"];

/* ── Helper: resolve id from either _id or id field ── */
const getId = (obj) => obj?._id || obj?.id || "";

/* ══════════════════════════════════════════════════════════ */
export default function HospitalDashboard() {
  const navigate = useNavigate();

  const [role,    setRole]    = useState("");
  const [profile, setProfile] = useState(null);
  const [tab,     setTab]     = useState("overview");
  const [appts,   setAppts]   = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  /* Filters */
  const [filterDate,   setFDate]  = useState("");
  const [filterStatus, setFStat]  = useState("");
  const [filterDoc,    setFDoc]   = useState("");
  const [search,       setSearch] = useState("");

  /* Walk-in */
  const [wiDoctor,  setWiDoc]  = useState("");
  const [wiDate,    setWiDate] = useState(new Date().toISOString().split("T")[0]);
  const [wiName,    setWiName] = useState("");
  const [wiResult,  setWiRes]  = useState(null);
  const [wiLoading, setWiLoad] = useState(false);

  /* Add doctor */
  const [newDoc,     setNewDoc]  = useState({ username:"", email:"", password:"", specialization:"" });
  const [addDocOpen, setAddDoc]  = useState(false);
  const [docMsg,     setDocMsg]  = useState("");

  /* Queue */
  const [queueDoc,  setQDoc]  = useState("");
  const [queueDate, setQDate] = useState(new Date().toISOString().split("T")[0]);
  const [queue,     setQueue] = useState([]);
  const [qLoading,  setQLd]   = useState(false);

  /* Report upload */
  const [reportModal, setRModal] = useState(null);
  const [reportUrl,   setRUrl]   = useState("");
  const [reportMsg,   setRMsg]   = useState("");

  /* Prescription */
  const [rxModal,  setRxModal]  = useState(null);
  const [rxForm,   setRxForm]   = useState({ medicines:"", advice:"" });
  const [rxMsg,    setRxMsg]    = useState("");

  /* ── Data load ── */
  useEffect(() => {
    (async () => {
      try {
        const pRes = await api.get("/auth/me");
        const prof = pRes.data;
        setProfile(prof);
        setRole(prof.role);

        const aRes = await api.get("/appointments/doctor");
        const apptList = Array.isArray(aRes.data)
          ? aRes.data
          : Array.isArray(aRes.data?.data)
            ? aRes.data.data
            : [];
        setAppts(apptList);

        if (prof.role === "hospital") {
          const profId = getId(prof);
          let dRes;
          try {
            dRes = await api.get(`/users/doctors/${profId}`);
          } catch {
            dRes = await api.get("/hospital/doctors");
          }

          const sRes = await api.get("/appointments/stats");

          const docList =
            dRes.data?.doctors ||
            dRes.data?.data ||
            (Array.isArray(dRes.data) ? dRes.data : []);

          // FIX: log what we got so we can see the shape of each doctor object
          console.log("[HospitalDashboard] doctors loaded:", docList);

          setDoctors(docList);
          setStats(sRes.data);
        }
      } catch (err) {
        if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Dedicated doctor fetch — always hits /hospital/doctors directly ── */
  useEffect(() => {
    if (!profile || role !== "hospital") return;
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/hospital/doctors");
        console.log("Doctors API response:", res.data);
        setDoctors(
          res.data.doctors ||
          res.data.data    ||
          (Array.isArray(res.data) ? res.data : [])
        );
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, [profile, role]);

  /* ── Actions ── */
  const approve = async (id) => {
    try {
      const res = await api.put(`/appointments/approve/${id}`);
      setAppts(p => p.map(a => a._id === id ? { ...a, status:"approved", tokenNumber:res.data.tokenNumber } : a));
    } catch (err) { alert(err.response?.data?.message || "Error approving"); }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this appointment?")) return;
    try {
      await api.put(`/appointments/reject/${id}`);
      setAppts(p => p.map(a => a._id === id ? { ...a, status:"rejected" } : a));
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/appointments/status/${id}`, { status });
      setAppts(p => p.map(a => a._id === id ? (res.data.appointment || { ...a, status }) : a));
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const uploadReport = async () => {
    if (!reportUrl.trim()) return;
    try {
      await api.put(`/appointments/upload-report/${reportModal._id}`, { reportUrl });
      setAppts(p => p.map(a => a._id === reportModal._id ? { ...a, reportUrl } : a));
      setRMsg("Report uploaded ✓");
      setTimeout(() => { setRModal(null); setRUrl(""); setRMsg(""); }, 1500);
    } catch (err) { setRMsg(err.response?.data?.message || "Upload failed"); }
  };

  const issuePrescription = async () => {
    if (!rxForm.medicines.trim()) return setRxMsg("Enter at least one medicine.");
    try {
      await api.put(`/appointments/prescribe/${rxModal._id}`, rxForm);
      setAppts(p => p.map(a => a._id === rxModal._id ? { ...a, prescription:{ medicines:rxForm.medicines, advice:rxForm.advice, issuedAt:new Date() } } : a));
      setRxMsg("Prescription issued ✓");
      setTimeout(() => { setRxModal(null); setRxForm({ medicines:"", advice:"" }); setRxMsg(""); }, 1500);
    } catch (err) { setRxMsg(err.response?.data?.message || "Failed"); }
  };

  // FIX: use getId() helper — handles both _id and id shapes from any backend
  const loginAsDoctor = async (doctorId) => {
    console.log("[loginAsDoctor] doctorId:", doctorId);
    if (!doctorId) return alert("Doctor ID missing — check console for doctor object shape");
    try {
      const res = await api.post(`/hospital-impersonate/login-as-doctor/${doctorId}`);
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("userRole", "doctor");
      localStorage.setItem("userId",   getId(res.data.user));
      window.location.href = "/dashboard/doctor";
    } catch (err) { alert(err.response?.data?.message || "Login failed"); }
  };

  const deleteDoctor = async (id, name) => {
    if (!id)                                       return alert("Doctor ID missing");
    if (!window.confirm(`Remove Dr. ${name}?`))   return;
    try {
      await api.delete(`/hospital/doctors/${id}`);
      setDoctors(p => p.filter(d => getId(d) !== id));
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const addDoctor = async () => {
    if (!newDoc.username || !newDoc.email || !newDoc.password) return setDocMsg("Name, email and password required.");
    try {
      const res = await api.post("/hospital/create-doctor", newDoc);
      setDoctors(p => [...p, res.data.doctor || res.data]);
      setNewDoc({ username:"", email:"", password:"", specialization:"" });
      setAddDoc(false); setDocMsg("");
    } catch (err) { setDocMsg(err.response?.data?.message || "Error"); }
  };

  const createWalkIn = async () => {
    if (!wiDoctor || !wiDate) return alert("Select doctor and date");
    setWiLoad(true);
    try {
      const res = await api.post("/appointments/offline", { doctor:wiDoctor, date:wiDate, patientName:wiName || "Walk-in Patient" });
      setWiRes(res.data);
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setWiLoad(false); }
  };

  const loadQueue = async () => {
    const doc = role === "doctor" ? getId(profile) : queueDoc;
    if (!doc) return alert("Select a doctor");
    setQLd(true);
    try {
      const res = await api.get(`/appointments/queue/today?doctorId=${doc}&date=${queueDate}`);
      setQueue(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setQLd(false); }
  };

  /* ── Derived stats ── */
  const safe       = Array.isArray(appts) ? appts : [];
  const total      = safe.length;
  const pending    = safe.filter(a => a.status === "pending").length;
  const approved   = safe.filter(a => a.status === "approved").length;
  const inProgress = safe.filter(a => a.status === "in-progress").length;
  const done       = safe.filter(a => a.status === "done").length;
  const rejected   = safe.filter(a => a.status === "rejected").length;
  const today      = new Date().toISOString().split("T")[0];
  const todayAppts = safe.filter(a => a.date === today);

  const pieData = [
    { name:"Pending",     value: pending    },
    { name:"Approved",    value: approved   },
    { name:"In Progress", value: inProgress },
    { name:"Done",        value: done       },
  ].filter(d => d.value > 0);

  const filtered = safe.filter(a => {
    if (filterDate   && a.date !== filterDate)             return false;
    if (filterStatus && a.status !== filterStatus)         return false;
    if (filterDoc    && getId(a.doctor) !== filterDoc)     return false;
    if (search) {
      const q  = search.toLowerCase();
      const pn = (a.patient?.username || a.walkInPatientName || "").toLowerCase();
      const dn = (a.doctor?.username  || "").toLowerCase();
      if (!pn.includes(q) && !dn.includes(q)) return false;
    }
    return true;
  });

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FDF2F0" }}>
      <div style={{ width:38, height:38, border:"3px solid rgba(232,116,97,0.2)", borderTop:"3px solid #C0392B", borderRadius:"50%", animation:"hdSpin 0.7s linear infinite" }}/>
    </div>
  );

  const NAV = role === "hospital" ? NAV_HOSPITAL : NAV_DOCTOR;

  return (
    <div style={S.root}>

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#C0392B,#E87461)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff", boxShadow:"0 4px 10px rgba(192,57,43,0.28)", flexShrink:0 }}>⚕</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"#1C1C1E", fontFamily:"'DM Sans',sans-serif" }}>Medicare<span style={{ color:"#E87461" }}>Hub</span></div>
            <div style={{ fontSize:10, color:"#B0A4A2" }}>{role === "hospital" ? "Hospital Portal" : "Doctor Portal"}</div>
          </div>
        </div>

        <div style={S.userRow}>
          <div style={S.avatar}>{profile?.username?.[0]?.toUpperCase() || "H"}</div>
          <div style={{ overflow:"hidden", flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#1C1C1E", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile?.username}</div>
            <div style={{ fontSize:11, color:"#B0A4A2" }}>{role === "hospital" ? "🏥 Hospital" : "👨‍⚕️ Doctor"}</div>
          </div>
        </div>

        <nav style={{ padding:"10px 10px", flex:1, display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(n => (
            <button key={n.id} className="hd-nav"
              style={{ ...S.navBtn, ...(tab === n.id ? S.navActive : {}) }}
              onClick={() => setTab(n.id)}>
              <span style={{ width:18, textAlign:"center", fontSize:13, flexShrink:0 }}>{n.icon}</span>
              <span style={{ flex:1 }}>{n.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding:"10px 10px", borderTop:"1px solid rgba(232,116,97,0.1)" }}>
          <button className="hd-ghost-hover" style={S.logoutBtn} onClick={() => { localStorage.clear(); navigate("/"); }}>↩ Logout</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>

        {/* ════ OVERVIEW ════ */}
        {tab === "overview" && (
          <Fade>
            <PH
              title={`${role === "hospital" ? "Hospital" : "Doctor"} Dashboard`}
              sub={`Welcome back, ${profile?.username}.`}
            />

            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:20 }}>
              {[
                { label:"Total",       v: stats?.total      ?? total,             c:"#C0392B" },
                { label:"Today",       v: stats?.todayCount ?? todayAppts.length, c:"#1A5276" },
                { label:"Pending",     v: stats?.pending    ?? pending,           c:"#B45309" },
                { label:"Approved",    v: stats?.approved   ?? approved,          c:"#C0392B" },
                { label:"In Progress", v: stats?.inProgress ?? inProgress,        c:"#1A5276" },
                { label:"Completed",   v: stats?.done       ?? done,              c:"#8A7E7C" },
              ].map(s => (
                <div key={s.label} style={S.statCard} className="hd-card">
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:38, color:s.c, fontWeight:400, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"#B0A4A2", fontWeight:600, marginTop:6, letterSpacing:0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:16, marginBottom:16 }}>
              <div style={{ ...S.card, marginBottom:0 }}>
                <CL>Appointment Breakdown</CL>
                <div style={{ height:200, marginTop:12 }}>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius:10, border:"1px solid rgba(232,116,97,0.2)", fontFamily:"'DM Sans',sans-serif", fontSize:12 }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Muted>No data yet</Muted>
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#8A7E7C" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:PIE_COLORS[i] }}/>
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...S.card, marginBottom:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <CL>Today's Appointments — {today}</CL>
                  <span style={{ fontSize:11, fontWeight:700, color:"#C0392B", background:"rgba(192,57,43,0.07)", padding:"3px 10px", borderRadius:20 }}>{todayAppts.length} total</span>
                </div>
                {todayAppts.length === 0
                  ? <Muted>No appointments today</Muted>
                  : (
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead><tr style={{ borderBottom:"1px solid rgba(232,116,97,0.1)" }}>
                          {["Patient","Doctor","Time","Status","Token"].map(h => <TH key={h}>{h}</TH>)}
                        </tr></thead>
                        <tbody>
                          {todayAppts.map(a => (
                            <tr key={a._id} className="hd-row" style={{ transition:"background 0.1s" }}>
                              <TD>{a.isWalkIn ? `🚶 ${a.walkInPatientName}` : (a.patient?.username || "—")}</TD>
                              <TD>Dr. {a.doctor?.username || "—"}</TD>
                              <TD>{a.time}</TD>
                              <TD><SPill status={a.status}/></TD>
                              <TD><span style={{ fontWeight:700, color:"#C0392B", fontSize:13 }}>{a.tokenNumber || "—"}</span></TD>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            </div>

            {role === "hospital" && (
              <div style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <CL>Doctors ({doctors.length})</CL>
                  <Btn onClick={() => setTab("doctors")}>Manage →</Btn>
                </div>
                {doctors.length === 0
                  ? <Muted>No doctors added yet.</Muted>
                  : (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
                      {/* FIX: key uses getId() to handle both _id and id */}
                      {doctors.map(d => (
                        <div key={getId(d)} style={{ background:"#FDF2F0", border:"1px solid rgba(232,116,97,0.12)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }} className="hd-card">
                          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#C0392B,#E87461)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>
                            {d.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:13, color:"#1C1C1E" }}>Dr. {d.username}</div>
                            <div style={{ fontSize:11, color:"#B0A4A2" }}>{d.specialization || "General"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}
          </Fade>
        )}

        {/* ════ APPOINTMENTS ════ */}
        {tab === "appointments" && (
          <Fade>
            <PH title="Appointments" sub="View, approve and manage all appointments"/>

            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <input className="hd-inp" style={FI} placeholder="🔍 Search patient / doctor" value={search} onChange={e => setSearch(e.target.value)}/>
              <input className="hd-inp" style={FI} type="date" value={filterDate} onChange={e => setFDate(e.target.value)}/>
              <select className="hd-inp" style={FI} value={filterStatus} onChange={e => setFStat(e.target.value)}>
                <option value="">All Statuses</option>
                {["pending","approved","in-progress","done","rejected"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {role === "hospital" && (
                <select className="hd-inp" style={FI} value={filterDoc} onChange={e => setFDoc(e.target.value)}>
                  <option value="">All Doctors</option>
                  {/* FIX: key and value use getId() */}
                  {doctors.map(d => <option key={getId(d)} value={getId(d)}>Dr. {d.username}</option>)}
                </select>
              )}
              <GhostBtn onClick={() => { setFDate(""); setFStat(""); setFDoc(""); setSearch(""); }}>Clear</GhostBtn>
            </div>
            <div style={{ fontSize:11, color:"#B0A4A2", marginBottom:12 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>

            {filtered.length === 0
              ? <Empty icon="📋" text="No appointments match your filters"/>
              : (
                <div style={{ ...S.card, overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ borderBottom:"1px solid rgba(232,116,97,0.1)" }}>
                      {["Patient","Doctor","Date","Time","Status","Token","Actions"].map(h => <TH key={h}>{h}</TH>)}
                    </tr></thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a._id} className="hd-row" style={{ transition:"background 0.1s" }}>
                          <TD>
                            <div style={{ fontWeight:600, color:"#1C1C1E" }}>{a.isWalkIn ? `🚶 ${a.walkInPatientName}` : (a.patient?.username || "—")}</div>
                            {a.patient?.email && <div style={{ fontSize:11, color:"#B0A4A2" }}>{a.patient.email}</div>}
                          </TD>
                          <TD>Dr. {a.doctor?.username || "—"}</TD>
                          <TD>{a.date}</TD>
                          <TD>{a.time}</TD>
                          <TD><SPill status={a.status}/></TD>
                          <TD><span style={{ fontWeight:700, color:"#C0392B" }}>{a.tokenNumber || "—"}</span></TD>
                          <TD>
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                              {a.status === "pending"      && <><AB color="#C0392B" onClick={() => approve(a._id)}>✓ Approve</AB><AB color="#DC2626" onClick={() => reject(a._id)}>✕ Reject</AB></>}
                              {a.status === "approved"     && <AB color="#1A5276"   onClick={() => updateStatus(a._id,"in-progress")}>▶ Start</AB>}
                              {a.status === "in-progress"  && <AB color="#8A7E7C"   onClick={() => updateStatus(a._id,"done")}>✓ Done</AB>}
                              {(a.status === "approved" || a.status === "in-progress" || a.status === "done") && (
                                <AB color="#8A7E7C" onClick={() => { setRModal(a); setRUrl(a.reportUrl || ""); }}>📄 Report</AB>
                              )}
                              {(a.status === "approved" || a.status === "in-progress" || a.status === "done") && !a.prescription?.issuedAt && (
                                <AB color="#7c3aed" onClick={() => { setRxModal(a); setRxForm({ medicines:"", advice:"" }); setRxMsg(""); }}>💊 Prescribe</AB>
                              )}
                              {a.prescription?.issuedAt && (
                                <span style={{ fontSize:11, color:"#7c3aed", background:"rgba(124,58,237,0.07)", padding:"3px 9px", borderRadius:7, fontWeight:700 }}>💊 Rx issued</span>
                              )}
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Fade>
        )}

        {/* ════ DOCTORS ════ */}
        {tab === "doctors" && role === "hospital" && (
          <Fade>
            <PH title="Doctors" sub="Manage your medical staff">
              <Btn onClick={() => setAddDoc(true)}>+ Add Doctor</Btn>
            </PH>

            {addDocOpen && (
              <div style={{ ...S.card, marginBottom:18 }}>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"#1C1C1E", marginBottom:14, fontWeight:400 }}>New Doctor</div>
                {docMsg && <div style={{ color:"#DC2626", fontSize:12, marginBottom:10, padding:"8px 12px", background:"rgba(239,68,68,0.07)", borderRadius:8 }}>{docMsg}</div>}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { l:"Full Name *",     f:"username",       ph:"Dr. Anjali Mane"     },
                    { l:"Email *",         f:"email",          ph:"anjali@hospital.com", t:"email"    },
                    { l:"Password *",      f:"password",       ph:"Min. 6 chars",        t:"password" },
                    { l:"Specialization",  f:"specialization", ph:"e.g. Cardiologist"   },
                  ].map(x => (
                    <div key={x.f}>
                      <FL>{x.l}</FL>
                      <input className="hd-inp" style={{ ...S.inp, marginTop:6 }} type={x.t || "text"} placeholder={x.ph} value={newDoc[x.f]} onChange={e => setNewDoc(p => ({ ...p, [x.f]:e.target.value }))}/>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <Btn onClick={addDoctor}>Create Doctor</Btn>
                  <GhostBtn onClick={() => { setAddDoc(false); setDocMsg(""); }}>Cancel</GhostBtn>
                </div>
              </div>
            )}

            {doctors.length === 0 && !addDocOpen
              ? <Empty icon="👨‍⚕️" text="No doctors yet." onAction={() => setAddDoc(true)} actionLabel="Add Doctor"/>
              : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                  {/* FIX: key, loginAsDoctor, deleteDoctor all use getId() */}
                  {doctors.map(d => (
                    <div key={getId(d)} style={{ ...S.card, marginBottom:0, display:"flex", justifyContent:"space-between", alignItems:"center" }} className="hd-card">
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#C0392B,#E87461)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700, color:"#fff", flexShrink:0 }}>
                          {d.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, color:"#1C1C1E" }}>Dr. {d.username}</div>
                          <div style={{ fontSize:11, color:"#B0A4A2" }}>{d.specialization || "General"}</div>
                          <div style={{ fontSize:11, color:"#B0A4A2" }}>{d.email}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                        {/* FIX: log doctor object on click, use getId() fallback */}
                        <AB color="#1A5276" onClick={() => {
                          console.log("[Login as Doctor] doctor object:", d);
                          loginAsDoctor(getId(d));
                        }}>Login as →</AB>
                        <AB color="#DC2626" onClick={() => deleteDoctor(getId(d), d.username)}>Remove</AB>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </Fade>
        )}

        {/* ════ WALK-IN TOKEN ════ */}
        {tab === "walkin" && (
          <Fade>
            <PH title="Walk-in Token" sub="Create instant tokens for walk-in patients"/>
            <div style={{ ...S.card, maxWidth:520 }}>
              <CL>New Walk-in</CL>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14, marginBottom:14 }}>
                <div>
                  <FL>Doctor *</FL>
                  {/* FIX: option value uses getId() */}
                  <select className="hd-inp" style={{ ...S.inp, marginTop:6 }} value={wiDoctor} onChange={e => setWiDoc(e.target.value)}>
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={getId(d)} value={getId(d)}>Dr. {d.username}</option>)}
                  </select>
                </div>
                <div>
                  <FL>Date *</FL>
                  <input className="hd-inp" style={{ ...S.inp, marginTop:6 }} type="date" value={wiDate} onChange={e => setWiDate(e.target.value)}/>
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <FL>Patient Name (optional)</FL>
                <input className="hd-inp" style={{ ...S.inp, marginTop:6 }} placeholder="Walk-in Patient" value={wiName} onChange={e => setWiName(e.target.value)}/>
              </div>
              <Btn onClick={createWalkIn} disabled={wiLoading}>{wiLoading ? "Creating…" : "Create Token"}</Btn>

              {wiResult && (
                <div style={{ marginTop:20, background:"rgba(192,57,43,0.05)", border:"1px solid rgba(192,57,43,0.15)", borderRadius:14, padding:20, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#B0A4A2", fontWeight:700, marginBottom:8, letterSpacing:0.4, textTransform:"uppercase" }}>Token Issued</div>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:52, color:"#C0392B", fontWeight:400, lineHeight:1 }}>{wiResult.tokenNumber || wiResult.appointment?.tokenNumber}</div>
                  <div style={{ fontSize:13, color:"#8A7E7C", marginTop:8 }}>
                    Dr. {wiResult.doctor?.username || "—"} · {wiResult.date || wiDate}
                  </div>
                  <button onClick={() => setWiRes(null)} style={{ marginTop:14, fontSize:12, color:"#B0A4A2", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
                </div>
              )}
            </div>
          </Fade>
        )}

        {/* ════ LIVE QUEUE ════ */}
        {tab === "queue" && (
          <Fade>
            <PH title="Live Queue" sub={role === "doctor" ? "Your patient queue for today" : "View any doctor's queue"}/>
            <div style={{ ...S.card, marginBottom:16 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-end", flexWrap:"wrap" }}>
                {role === "hospital" && (
                  <div>
                    <FL>Doctor</FL>
                    {/* FIX: option value uses getId() */}
                    <select className="hd-inp" style={{ ...S.inp, marginTop:6, width:200 }} value={queueDoc} onChange={e => setQDoc(e.target.value)}>
                      <option value="">Select doctor</option>
                      {doctors.map(d => <option key={getId(d)} value={getId(d)}>Dr. {d.username}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <FL>Date</FL>
                  <input className="hd-inp" style={{ ...S.inp, marginTop:6, width:160 }} type="date" value={queueDate} onChange={e => setQDate(e.target.value)}/>
                </div>
                <Btn onClick={loadQueue} disabled={qLoading}>{qLoading ? "Loading…" : "Load Queue"}</Btn>
              </div>
            </div>

            {queue.length === 0
              ? <Empty icon="🔢" text="No queue loaded. Select a doctor and click Load Queue."/>
              : (
                <div style={S.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <CL>Queue — {queue.length} patients</CL>
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ borderBottom:"1px solid rgba(232,116,97,0.1)" }}>
                      {["Token","Patient","Time","Status","Action"].map(h => <TH key={h}>{h}</TH>)}
                    </tr></thead>
                    <tbody>
                      {queue.map(a => (
                        <tr key={a._id} className="hd-row" style={{ transition:"background 0.1s" }}>
                          <TD><span style={{ fontWeight:800, color:"#C0392B", fontSize:16, fontFamily:"'Instrument Serif',serif" }}>{a.tokenNumber || "—"}</span></TD>
                          <TD>{a.isWalkIn ? `🚶 ${a.walkInPatientName}` : (a.patient?.username || "—")}</TD>
                          <TD>{a.time}</TD>
                          <TD><SPill status={a.status}/></TD>
                          <TD>
                            <div style={{ display:"flex", gap:5 }}>
                              {a.status === "approved"    && <AB color="#1A5276" onClick={() => updateStatus(a._id,"in-progress")}>▶ Start</AB>}
                              {a.status === "in-progress" && <AB color="#8A7E7C" onClick={() => updateStatus(a._id,"done")}>✓ Done</AB>}
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </Fade>
        )}

        {/* ════ REPORTS ════ */}
        {tab === "reports" && (
          <Fade>
            <PH title="Reports" sub="Upload and manage patient reports"/>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Total Appts",  v:total,    c:"#C0392B" },
                { label:"Completed",    v:done,     c:"#8A7E7C" },
                { label:"With Reports", v:safe.filter(a => a.reportUrl).length, c:"#1A5276" },
                { label:"Rejected",     v:rejected, c:"#DC2626" },
              ].map(s => (
                <div key={s.label} style={S.statCard} className="hd-card">
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:38, color:s.c, fontWeight:400, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"#B0A4A2", fontWeight:600, marginTop:6, letterSpacing:0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, overflowX:"auto" }}>
              <CL>Completed Appointments</CL>
              {safe.filter(a => a.status === "done").length === 0
                ? <Muted>No completed appointments yet.</Muted>
                : (
                  <table style={{ width:"100%", borderCollapse:"collapse", marginTop:12 }}>
                    <thead><tr style={{ borderBottom:"1px solid rgba(232,116,97,0.1)" }}>
                      {["Patient","Doctor","Date","Report","Action"].map(h => <TH key={h}>{h}</TH>)}
                    </tr></thead>
                    <tbody>
                      {safe.filter(a => a.status === "done").map(a => (
                        <tr key={a._id} className="hd-row" style={{ transition:"background 0.1s" }}>
                          <TD>{a.isWalkIn ? `🚶 ${a.walkInPatientName}` : (a.patient?.username || "—")}</TD>
                          <TD>Dr. {a.doctor?.username || "—"}</TD>
                          <TD>{a.date}</TD>
                          <TD>
                            {a.reportUrl
                              ? <a href={a.reportUrl} target="_blank" rel="noreferrer" style={{ color:"#C0392B", fontSize:12, fontWeight:700 }}>📄 View</a>
                              : <span style={{ color:"#C8BBBA", fontSize:12 }}>—</span>
                            }
                          </TD>
                          <TD>
                            <AB color="#8A7E7C" onClick={() => { setRModal(a); setRUrl(a.reportUrl || ""); }}>
                              {a.reportUrl ? "Update" : "Upload"}
                            </AB>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </Fade>
        )}

      </main>

      {/* ════ REPORT UPLOAD MODAL ════ */}
      {reportModal && (
        <Modal onClose={() => { setRModal(null); setRUrl(""); setRMsg(""); }}>
          <div style={{ fontSize:28, marginBottom:12 }}>📄</div>
          <h3 style={{ fontFamily:"'Instrument Serif',serif", fontWeight:400, fontSize:20, marginBottom:6 }}>Upload Report</h3>
          <p style={{ fontSize:13, color:"#B0A4A2", marginBottom:20 }}>
            {reportModal.isWalkIn ? reportModal.walkInPatientName : reportModal.patient?.username} · Dr. {reportModal.doctor?.username}
          </p>
          <div style={{ marginBottom:16 }}>
            <FL>Report URL</FL>
            <input className="hd-inp" style={{ ...S.inp, marginTop:6 }} placeholder="https://…" value={reportUrl} onChange={e => setRUrl(e.target.value)}/>
          </div>
          {reportMsg && <div style={{ fontSize:12, color:"#C0392B", marginBottom:12, fontWeight:600 }}>{reportMsg}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={uploadReport} style={{ flex:1, justifyContent:"center" }}>Upload</Btn>
            <GhostBtn onClick={() => { setRModal(null); setRUrl(""); setRMsg(""); }} style={{ flex:1, justifyContent:"center" }}>Cancel</GhostBtn>
          </div>
        </Modal>
      )}

      {/* ════ PRESCRIPTION MODAL ════ */}
      {rxModal && (
        <Modal onClose={() => { setRxModal(null); setRxMsg(""); }}>
          <div style={{ fontSize:28, marginBottom:12 }}>💊</div>
          <h3 style={{ fontFamily:"'Instrument Serif',serif", fontWeight:400, fontSize:20, marginBottom:6 }}>Issue Prescription</h3>
          <p style={{ fontSize:13, color:"#B0A4A2", marginBottom:20 }}>
            {rxModal.isWalkIn ? rxModal.walkInPatientName : rxModal.patient?.username} · Dr. {rxModal.doctor?.username}
          </p>
          <div style={{ marginBottom:14 }}>
            <FL>Medicines *</FL>
            <textarea value={rxForm.medicines} onChange={e => setRxForm(p => ({ ...p, medicines:e.target.value }))} rows={3}
              placeholder="e.g. Paracetamol 500mg · Twice daily · 5 days"
              style={{ ...S.inp, marginTop:6, resize:"vertical" }}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <FL>Advice / Notes</FL>
            <textarea value={rxForm.advice} onChange={e => setRxForm(p => ({ ...p, advice:e.target.value }))} rows={2}
              placeholder="Rest, drink fluids…"
              style={{ ...S.inp, marginTop:6, resize:"vertical" }}/>
          </div>
          {rxMsg && <div style={{ fontSize:12, color:"#C0392B", marginBottom:12, fontWeight:600 }}>{rxMsg}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={issuePrescription} style={{ flex:1, justifyContent:"center" }}>Issue Prescription</Btn>
            <GhostBtn onClick={() => { setRxModal(null); setRxMsg(""); }} style={{ flex:1, justifyContent:"center" }}>Cancel</GhostBtn>
          </div>
        </Modal>
      )}

    </div>
  );
}