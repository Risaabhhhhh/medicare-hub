import { useState } from "react";

/* ── Shared input styles ── */
const LS = {
  lab: {
    fontSize: 10, fontWeight: 600, color: "#B0A4A2",
    letterSpacing: 0.8, display: "block", marginBottom: 6,
    textTransform: "uppercase",
  },
  inp: {
    width: "100%", padding: "9px 13px",
    background: "#FDF2F0",
    border: "1px solid rgba(232,116,97,0.2)",
    borderRadius: 9, color: "#1C1C1E",
    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  btn: {
    padding: "9px 20px",
    background: "rgba(192,57,43,0.08)",
    color: "#C0392B",
    border: "1px solid rgba(192,57,43,0.2)",
    borderRadius: 9, cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
};

/* ── Sub-components ── */
function OvulationCalc() {
  const [lmp, setLmp]     = useState("");
  const [cycle, setCycle] = useState("28");
  const [result, setRes]  = useState(null);

  const calc = () => {
    if (!lmp) return;
    const d  = new Date(lmp);
    const ov = new Date(d); ov.setDate(ov.getDate() + parseInt(cycle) - 14);
    const s  = new Date(ov); s.setDate(s.getDate() - 2);
    const e  = new Date(ov); e.setDate(e.getDate() + 2);
    setRes({ ov: ov.toDateString(), start: s.toDateString(), end: e.toDateString() });
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={LS.lab}>Last period</label>
          <input style={LS.inp} type="date" value={lmp} onChange={e => setLmp(e.target.value)} />
        </div>
        <div>
          <label style={LS.lab}>Cycle (days)</label>
          <input style={LS.inp} type="number" value={cycle} onChange={e => setCycle(e.target.value)} />
        </div>
      </div>
      <button style={{ ...LS.btn, background: "rgba(232,116,97,0.1)", color: "#E87461", borderColor: "rgba(232,116,97,0.25)" }} onClick={calc}>
        Calculate
      </button>
      {result && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          background: "rgba(232,116,97,0.06)",
          border: "1px solid rgba(232,116,97,0.18)",
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 10, color: "#E87461", fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>FERTILE WINDOW</div>
          <div style={{ fontSize: 13, color: "#1C1C1E" }}>{result.start} → {result.end}</div>
          <div style={{ fontSize: 11, color: "#B0A4A2", marginTop: 4 }}>
            Ovulation: <strong style={{ color: "#C0392B" }}>{result.ov}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function HRZoneCalc() {
  const [age, setAge] = useState("");
  const zones = age ? (() => {
    const max = 220 - parseInt(age);
    return [
      { l: "Zone 1 – Warm up",    r: `${Math.round(max * 0.5)}–${Math.round(max * 0.6)} bpm`, c: "#B0A4A2" },
      { l: "Zone 2 – Fat burn",   r: `${Math.round(max * 0.6)}–${Math.round(max * 0.7)} bpm`, c: "#E87461" },
      { l: "Zone 3 – Aerobic",    r: `${Math.round(max * 0.7)}–${Math.round(max * 0.8)} bpm`, c: "#C0392B" },
      { l: "Zone 4 – Anaerobic",  r: `${Math.round(max * 0.8)}–${Math.round(max * 0.9)} bpm`, c: "#7B1D2E" },
      { l: "Zone 5 – Max effort", r: `${Math.round(max * 0.9)}–${max} bpm`,                   c: "#3D0A13" },
    ];
  })() : null;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={LS.lab}>Your age</label>
        <input style={{ ...LS.inp, maxWidth: 130 }} type="number" placeholder="28" value={age} onChange={e => setAge(e.target.value)} />
      </div>
      {zones ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {zones.map(z => (
            <div key={z.l} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "7px 11px", background: "#FDF2F0", borderRadius: 8,
            }}>
              <span style={{ fontSize: 12, color: "#8A7E7C" }}>{z.l}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: z.c }}>{z.r}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "#C8BBBA", margin: 0 }}>Enter your age to see personalised heart rate zones.</p>
      )}
    </div>
  );
}

function WaterCalc() {
  const [wt, setWt]   = useState("");
  const [act, setAct] = useState("moderate");

  const amount = wt ? (() => {
    const base = parseFloat(wt) * 0.033;
    const mult = act === "low" ? 1 : act === "moderate" ? 1.2 : 1.4;
    return (base * mult).toFixed(1);
  })() : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={LS.lab}>Weight (kg)</label>
          <input style={LS.inp} type="number" placeholder="65" value={wt} onChange={e => setWt(e.target.value)} />
        </div>
        <div>
          <label style={LS.lab}>Activity</label>
          <select style={LS.inp} value={act} onChange={e => setAct(e.target.value)}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {amount ? (
        <div style={{
          padding: "14px 16px",
          background: "rgba(26,82,118,0.06)",
          border: "1px solid rgba(26,82,118,0.14)",
          borderRadius: 10, display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 32, color: "#1A5276", fontWeight: 400,
          }}>{amount}L</span>
          <div style={{ fontSize: 12, color: "#8A7E7C", lineHeight: 1.5 }}>
            recommended<br />daily intake
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "#C8BBBA", margin: 0 }}>Enter your weight to calculate daily water intake.</p>
      )}
    </div>
  );
}

/* ── Main Tools Section ── */
export default function Tools() {
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [bmi, setBmi] = useState(null);

  const calcBmi = () => {
    const hn = parseFloat(h) / 100, wn = parseFloat(w);
    if (hn > 0 && wn > 0) setBmi((wn / (hn * hn)).toFixed(1));
  };

  const bmiCat = b =>
    b < 18.5 ? { l: "Underweight", c: "#1A5276" } :
    b < 25   ? { l: "Normal",      c: "#C0392B" } :
    b < 30   ? { l: "Overweight",  c: "#E87461" } :
               { l: "Obese",       c: "#7B1D2E" };

  const tools = [
    {
      icon: "⚖️", title: "BMI Calculator", color: "#C0392B",
      desc: "Instantly calculate your Body Mass Index and discover your weight category.",
      body: (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <label style={LS.lab}>Height (cm)</label>
              <input style={LS.inp} type="number" placeholder="170" value={h} onChange={e => setH(e.target.value)} />
            </div>
            <div>
              <label style={LS.lab}>Weight (kg)</label>
              <input style={LS.inp} type="number" placeholder="65" value={w} onChange={e => setW(e.target.value)} />
            </div>
          </div>
          <button style={{ ...LS.btn, background: "rgba(192,57,43,0.08)", color: "#C0392B", borderColor: "rgba(192,57,43,0.2)" }} onClick={calcBmi}>
            Calculate BMI
          </button>
          {bmi && (() => {
            const cat = bmiCat(parseFloat(bmi));
            return (
              <div style={{
                marginTop: 12, padding: "12px 16px", background: "#FDF2F0",
                border: "1px solid rgba(232,116,97,0.2)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 32, color: cat.c, fontWeight: 400,
                }}>{bmi}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: cat.c,
                  background: `${cat.c}12`, padding: "4px 14px", borderRadius: 20,
                }}>{cat.l}</span>
              </div>
            );
          })()}
        </div>
      ),
    },
    {
      icon: "🌸", title: "Ovulation Calculator", color: "#E87461",
      desc: "Predict your fertile window based on your last period date and cycle length.",
      body: <OvulationCalc />,
    },
    {
      icon: "💓", title: "Heart Rate Zones", color: "#7B1D2E",
      desc: "Find your optimal training zones. Just enter your age to get personalised heart rate ranges.",
      body: <HRZoneCalc />,
    },
    {
      icon: "💧", title: "Water Intake Tracker", color: "#1A5276",
      desc: "Calculate your daily recommended water intake based on your weight and activity level.",
      body: <WaterCalc />,
    },
  ];

  return (
    <section id="tools" style={{
      background: "#FDF2F0", padding: "120px 0",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .tool-card {
          padding: 28px 26px;
          background: #fff;
          border: 1px solid rgba(232,116,97,0.14);
          border-radius: 18px;
          transition: all 0.25s ease;
        }
        .tool-card:hover {
          box-shadow: 0 12px 40px rgba(192,57,43,0.1);
          border-color: rgba(232,116,97,0.3);
          transform: translateY(-2px);
        }

        input[type="number"]:focus,
        input[type="date"]:focus,
        select:focus {
          border-color: rgba(192,57,43,0.4) !important;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.07);
        }

        @media (max-width: 768px) {
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{
            fontSize: 11, color: "#C0392B", fontWeight: 600,
            letterSpacing: 2, textTransform: "uppercase",
          }}>Free Health Tools</span>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px, 3.5vw, 52px)",
            color: "#1C1C1E", margin: "14px 0 0",
            fontWeight: 400, lineHeight: 1.1,
          }}>
            Understand your body,<br />
            <em style={{ color: "#C0392B" }}>right here.</em>
          </h2>
          <p style={{
            color: "#8A7E7C", fontSize: 14, marginTop: 16,
            maxWidth: 400, margin: "16px auto 0", lineHeight: 1.75,
          }}>
            No sign-up needed. All calculators work instantly, right on this page.
          </p>
        </div>

        {/* Grid */}
        <div className="tools-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {tools.map((t, i) => (
            <div key={i} className="tool-card">
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${t.color}0e`,
                  border: `1px solid ${t.color}22`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 19, color: "#1C1C1E",
                    fontWeight: 400, lineHeight: 1.15, marginBottom: 4,
                  }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#B0A4A2", lineHeight: 1.55 }}>{t.desc}</div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(232,116,97,0.1)", paddingTop: 16 }}>
                {t.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}