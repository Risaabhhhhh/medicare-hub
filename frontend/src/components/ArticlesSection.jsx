import { Link } from "react-router-dom";

export default function ArticlesSection() {
  const articles = [
    {
      tag: "Immunology",
      title: "What Is an Allergy?",
      desc: "Learn what happens when your immune system overreacts to harmless substances like pollen, dust, or certain foods.",
      read: "4 min read",
    },
    {
      tag: "Genetics",
      title: "Who Gets Allergies?",
      desc: "Anyone can develop allergies at any age, from childhood to adulthood. Here's what puts you at risk.",
      read: "3 min read",
    },
    {
      tag: "Biology",
      title: "What Causes an Allergic Reaction?",
      desc: "Discover how allergens trigger immune responses inside the body and why symptoms vary between people.",
      read: "5 min read",
    },
  ];

  return (
    <section style={{
      padding: "120px 0",
      background: "#fff",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .art-card {
          padding: 24px 26px;
          background: #fff;
          border: 1px solid rgba(232,116,97,0.14);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .art-card::after {
          content: '→';
          position: absolute;
          right: 22px; top: 50%;
          transform: translateY(-50%) translateX(4px);
          color: #E87461;
          font-size: 18px;
          opacity: 0;
          transition: all 0.22s ease;
        }
        .art-card:hover {
          border-color: rgba(192,57,43,0.25);
          box-shadow: 0 8px 28px rgba(192,57,43,0.09);
          transform: translateX(4px);
        }
        .art-card:hover::after {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .art-viewall {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 26px;
          background: #C0392B; color: #fff;
          border-radius: 10px; text-decoration: none;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .art-viewall:hover {
          background: #7B1D2E;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(123,29,46,0.25);
        }

        @media (max-width: 860px) {
          .art-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
        <div className="art-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 72, alignItems: "center",
        }}>

          {/* Left — Visual */}
          <div style={{
            background: "#FDF2F0",
            borderRadius: 20, padding: "48px 40px",
            border: "1px solid rgba(232,116,97,0.12)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative circles */}
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 200, height: 200, borderRadius: "50%",
              background: "rgba(232,116,97,0.08)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -30, left: -30,
              width: 140, height: 140, borderRadius: "50%",
              background: "rgba(192,57,43,0.06)", pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 15,
                background: "rgba(192,57,43,0.1)",
                border: "1px solid rgba(192,57,43,0.2)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 26, marginBottom: 24,
              }}>📖</div>

              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 32, color: "#1C1C1E", fontWeight: 400,
                lineHeight: 1.2, marginBottom: 16,
              }}>
                Evidence-based<br />
                <em style={{ color: "#C0392B" }}>health knowledge</em>
              </div>

              <p style={{
                fontSize: 14, color: "#8A7E7C",
                lineHeight: 1.75, marginBottom: 32, maxWidth: 340,
              }}>
                Our articles are written and reviewed by medical professionals. Stay informed with clinically accurate, easy-to-understand health content.
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 28 }}>
                {[
                  { v: "120+", l: "Articles" },
                  { v: "12",   l: "Specialties" },
                  { v: "4.9",  l: "Avg rating" },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: 26, color: "#1C1C1E", fontWeight: 400,
                    }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#B0A4A2", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Articles */}
          <div>
            <span style={{
              fontSize: 11, color: "#C0392B", fontWeight: 600,
              letterSpacing: 2, textTransform: "uppercase",
            }}>Health Education</span>

            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(30px, 3.2vw, 46px)",
              color: "#1C1C1E", margin: "14px 0 32px",
              fontWeight: 400, lineHeight: 1.1,
            }}>
              Explore our<br />
              <em style={{ color: "#C0392B" }}>articles</em>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {articles.map((item, i) => (
                <div key={i} className="art-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: "#C0392B",
                      background: "rgba(192,57,43,0.08)",
                      padding: "3px 10px", borderRadius: 100,
                      letterSpacing: 0.8, textTransform: "uppercase",
                    }}>{item.tag}</span>
                    <span style={{ fontSize: 11, color: "#C8BBBA" }}>·</span>
                    <span style={{ fontSize: 11, color: "#C8BBBA" }}>{item.read}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 18, color: "#1C1C1E",
                    margin: "0 0 6px", fontWeight: 400,
                  }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: "#8A7E7C", margin: 0, lineHeight: 1.6, paddingRight: 28 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <Link to="/articles" className="art-viewall">
                View all articles →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}