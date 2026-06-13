import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function useCounter(target, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const steps = 60, dur = 1800;
      let cur = 0;
      const iv = setInterval(() => {
        cur += target / steps;
        if (cur >= target) { setVal(target); clearInterval(iv); }
        else setVal(Math.floor(cur));
      }, dur / steps);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

export default function Hero() {
  const patients  = useCounter(12400, 0);
  const doctors   = useCounter(350,   200);
  const hospitals = useCounter(48,    400);

  return (
    <section style={{
      minHeight: "100vh",
      background: "#FDF2F0",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden", paddingTop: 68,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes hFade  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes hPulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes hSlide { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        @keyframes hDrift { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(20px,-14px) scale(1.04); } }

        .h-cta:hover {
          background: #7B1D2E !important;
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(123,29,46,0.3) !important;
        }
        .h-ghost:hover {
          border-color: #C0392B !important;
          color: #C0392B !important;
          background: rgba(192,57,43,0.05) !important;
        }
        .h-stat:hover {
          border-color: rgba(232,116,97,0.35) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232,116,97,0.12) !important;
        }
        .queue-row-next {
          background: rgba(232,116,97,0.08) !important;
          border: 1px solid rgba(232,116,97,0.25) !important;
        }
        .queue-row-prog {
          background: rgba(26,82,118,0.06) !important;
          border: 1px solid rgba(26,82,118,0.15) !important;
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-right { display: none !important; }
          .hero-stats { gap: 8px !important; }
        }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-8%", right: "-6%",
          width: 560, height: 560, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,116,97,0.14), transparent 65%)",
          animation: "hDrift 16s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", left: "-10%",
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(192,57,43,0.08), transparent 65%)",
          animation: "hDrift 20s ease-in-out infinite reverse",
        }} />
        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(232,116,97,0.18)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "60px 32px",
        width: "100%", position: "relative", zIndex: 1,
      }}>
        <div className="hero-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 72, alignItems: "center",
        }}>

          {/* ── LEFT ── */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px",
              background: "rgba(192,57,43,0.08)",
              border: "1px solid rgba(192,57,43,0.18)",
              borderRadius: 100, marginBottom: 28,
              animation: "hFade 0.5s ease both",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C0392B", display: "inline-block",
                animation: "hPulse 2s infinite",
              }} />
              <span style={{ fontSize: 11, color: "#C0392B", fontWeight: 600, letterSpacing: 0.6 }}>
                Digital Healthcare Platform · India
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(40px, 4.8vw, 68px)",
              lineHeight: 1.04, color: "#1C1C1E",
              margin: "0 0 22px", fontWeight: 400,
              animation: "hFade 0.5s 0.08s ease both",
              opacity: 0, animationFillMode: "forwards",
            }}>
              Smarter healthcare,<br />
              <em style={{ color: "#C0392B", fontStyle: "italic" }}>zero waiting</em>
              <br />
              <span style={{
                color: "#8A7E7C", fontSize: "0.58em",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400, letterSpacing: "-0.2px",
              }}>
                for patients &amp; hospitals.
              </span>
            </h1>

            <p style={{
              fontSize: 15, color: "#8A7E7C", lineHeight: 1.8,
              maxWidth: 460, margin: "0 0 36px",
              animation: "hFade 0.5s 0.16s ease both",
              opacity: 0, animationFillMode: "forwards",
              fontWeight: 400,
            }}>
              Book appointments instantly, track tokens live, teleconsult doctors, 
              store prescriptions — all from one platform built for India's healthcare system.
            </p>

            {/* CTAs */}
            <div style={{
              display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 52,
              animation: "hFade 0.5s 0.24s ease both",
              opacity: 0, animationFillMode: "forwards",
            }}>
              <Link to="/signup" className="h-cta" style={{
                padding: "13px 30px", background: "#C0392B", color: "#fff",
                borderRadius: 10, textDecoration: "none", fontSize: 14,
                fontWeight: 600, transition: "all 0.25s",
                boxShadow: "0 4px 18px rgba(192,57,43,0.28)",
                letterSpacing: "0.01em", fontFamily: "'DM Sans', sans-serif",
              }}>
                Get started free →
              </Link>
              <Link to="/login" className="h-ghost" style={{
                padding: "13px 26px",
                border: "1px solid rgba(192,57,43,0.2)",
                color: "#8A7E7C", borderRadius: 10,
                textDecoration: "none", fontSize: 14,
                fontWeight: 500, transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Log in
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats" style={{
              display: "flex", gap: 8,
              animation: "hFade 0.5s 0.32s ease both",
              opacity: 0, animationFillMode: "forwards",
            }}>
              {[
                { v: patients.toLocaleString() + "+", l: "Patients served" },
                { v: doctors + "+",                   l: "Registered doctors" },
                { v: hospitals + "+",                 l: "Partner hospitals" },
              ].map(s => (
                <div key={s.l} className="h-stat" style={{
                  padding: "14px 18px",
                  background: "#fff",
                  border: "1px solid rgba(232,116,97,0.18)",
                  borderRadius: 12, flex: 1, transition: "all 0.2s",
                  cursor: "default",
                  boxShadow: "0 2px 8px rgba(232,116,97,0.07)",
                }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 26, color: "#1C1C1E", fontWeight: 400,
                  }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#B0A4A2", marginTop: 3, fontWeight: 500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Dashboard Mock ── */}
          <div className="hero-right" style={{
            position: "relative",
            animation: "hFade 0.5s 0.2s ease both",
            opacity: 0, animationFillMode: "forwards",
          }}>

            {/* Main card */}
            <div style={{
              background: "#fff",
              border: "1px solid rgba(232,116,97,0.15)",
              borderRadius: 20, padding: 24,
              boxShadow: "0 20px 60px rgba(192,57,43,0.1), 0 4px 16px rgba(0,0,0,0.04)",
              animation: "hFloat 6s ease-in-out infinite",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#B0A4A2", fontWeight: 600, letterSpacing: 1.2 }}>
                    TODAY'S QUEUE · DR. PRIYA MANE
                  </div>
                  <div style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 19, color: "#1C1C1E", marginTop: 4,
                  }}>
                    6 patients remaining
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px",
                  background: "rgba(192,57,43,0.08)",
                  color: "#C0392B", borderRadius: 100,
                  fontSize: 10, fontWeight: 700,
                  border: "1px solid rgba(192,57,43,0.18)",
                  letterSpacing: 0.5,
                }}>
                  LIVE
                </div>
              </div>

              {/* Queue rows */}
              {[
                { t: "T-003", n: "Rahul Sharma",  note: "Follow-up",    s: "done"     },
                { t: "T-004", n: "Priya Desai",   note: "Consultation", s: "progress" },
                { t: "T-005", n: "You",           note: "General",      s: "next"     },
                { t: "T-006", n: "Amit Patil",    note: "Checkup",      s: "waiting"  },
                { t: "T-007", n: "Sunita Rao",    note: "Prescription", s: "waiting"  },
              ].map((r, i) => (
                <div key={i} className={r.s === "next" ? "queue-row-next" : r.s === "progress" ? "queue-row-prog" : ""}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 9, marginBottom: 4,
                    border: r.s === "waiting" || r.s === "done" ? "1px solid transparent" : undefined,
                    transition: "all 0.2s",
                  }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: r.s === "done" ? "#D5C9C7" : r.s === "progress" ? "#1A5276" : r.s === "next" ? "#C0392B" : "#D5C9C7",
                  }} />
                  <span style={{
                    fontWeight: 600, fontSize: 11,
                    color: r.s === "done" ? "#C8BBBA" : "#1C1C1E",
                    width: 44, fontFamily: "'DM Sans', sans-serif",
                  }}>{r.t}</span>
                  <span style={{
                    fontSize: 13, flex: 1,
                    color: r.s === "done" ? "#C8BBBA" : "#8A7E7C",
                  }}>{r.n}</span>
                  <span style={{ fontSize: 11, color: "#C8BBBA" }}>{r.note}</span>
                  {r.s === "progress" && (
                    <span style={{
                      fontSize: 9, color: "#1A5276", fontWeight: 700,
                      background: "rgba(26,82,118,0.08)", padding: "2px 8px",
                      borderRadius: 6, letterSpacing: 0.4,
                    }}>IN PROGRESS</span>
                  )}
                  {r.s === "next" && (
                    <span style={{
                      fontSize: 9, color: "#C0392B", fontWeight: 700,
                      background: "rgba(192,57,43,0.08)", padding: "2px 8px",
                      borderRadius: 6, letterSpacing: 0.4,
                    }}>YOUR TURN ↑</span>
                  )}
                  {r.s === "done" && <span style={{ fontSize: 12, color: "#D5C9C7" }}>✓</span>}
                </div>
              ))}
            </div>

            {/* Floating — Appointment */}
            <div style={{
              position: "absolute", top: -20, right: -16,
              background: "#fff", border: "1px solid rgba(232,116,97,0.2)",
              borderRadius: 14, padding: "14px 18px",
              animation: "hFloat 7s 1s ease-in-out infinite",
              boxShadow: "0 16px 48px rgba(192,57,43,0.14)", minWidth: 174,
            }}>
              <div style={{ fontSize: 9, color: "#B0A4A2", fontWeight: 600, letterSpacing: 1.2, marginBottom: 5 }}>
                APPOINTMENT
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", fontFamily: "'DM Sans', sans-serif" }}>
                Dr. Priya Mane
              </div>
              <div style={{ fontSize: 12, color: "#C0392B", marginTop: 3 }}>✓ Confirmed · 11:30 AM</div>
              <div style={{ fontSize: 11, color: "#B0A4A2", marginTop: 2 }}>City General Hospital</div>
            </div>

            {/* Floating — AI */}
            <div style={{
              position: "absolute", bottom: -18, left: -14,
              background: "#fff", border: "1px solid rgba(232,116,97,0.2)",
              borderRadius: 14, padding: "14px 18px",
              animation: "hFloat 8s 2s ease-in-out infinite",
              boxShadow: "0 16px 48px rgba(192,57,43,0.14)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, #E87461, #C0392B)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#fff",
                }}>✦</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1C1E", fontFamily: "'DM Sans', sans-serif" }}>
                    MedGamma AI
                  </div>
                  <div style={{ fontSize: 11, color: "#B0A4A2" }}>Ask a health question</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling trust bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        borderTop: "1px solid rgba(232,116,97,0.1)",
        overflow: "hidden", background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", animation: "hSlide 22s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(2)].map((_, di) =>
            ["📅 Instant Booking", "🎫 Live Token Queue", "🎥 Teleconsultation", "💊 Prescription Vault",
              "✦ MedGamma AI", "💓 Vitals Tracker", "🏥 Hospital Management", "🚨 Emergency Contacts",
              "📊 Reports & Analytics"].map((t, i) => (
              <span key={`${di}-${i}`} style={{
                display: "inline-block", padding: "13px 28px",
                fontSize: 12, color: "#B0A4A2",
                borderRight: "1px solid rgba(232,116,97,0.08)",
                fontWeight: 500, letterSpacing: "0.01em",
              }}>{t}</span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}