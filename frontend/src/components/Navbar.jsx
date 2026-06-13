import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  {
    label: "Solutions",
    href: "#solutions",
    dropdown: [
      { icon: "🏥", label: "Find Hospitals", sub: "Locate care near you", href: "/find-hospital" },
      { icon: "📹", label: "Teleconsult", sub: "Video consult doctors", href: "/teleconsult" },
      { icon: "💊", label: "Rx Vault", sub: "Manage prescriptions", href: "/rx-vault" },
      { icon: "🤖", label: "MedGamma AI", sub: "AI health assistant", href: "/ai" },
    ],
  },
  {
    label: "Features",
    href: "#features",
    dropdown: [
      { icon: "❤️", label: "Vitals Tracker", sub: "Monitor your health", href: "/vitals" },
      { icon: "📅", label: "Appointments", sub: "Book & manage visits", href: "/appointments" },
      { icon: "⚖️", label: "Health Tools", sub: "BMI, Heart Rate & more", href: "/tools" },
      { icon: "📰", label: "Health Articles", sub: "Expert-reviewed content", href: "/articles" },
    ],
  },
  { label: "Pricing", href: "#pricing" },
];

function DropdownMenu({ items, visible }) {
  return (
    <div className={`nav-dropdown ${visible ? "dd-visible" : ""}`}>
      {items.map((item) => (
        <Link to={item.href} className="dd-item" key={item.label}>
          <span className="dd-icon">{item.icon}</span>
          <span className="dd-text">
            <span className="dd-label">{item.label}</span>
            <span className="dd-sub">{item.sub}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const timeoutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setMobileExpanded(null); }, [location]);

  const handleMouseEnter = (label) => {
    clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        :root {
          --red: #C0392B;
          --red-light: #E74C3C;
          --red-soft: #FDF2F2;
          --red-mid: #FADBD8;
          --red-glow: rgba(192,57,43,0.15);
          --text: #1a1a2e;
          --muted: #6B7280;
        }

        .navbar {
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 2px 24px rgba(192,57,43,0.08), 0 1px 0 rgba(0,0,0,0.06);
        }
        .navbar.top {
          background: rgba(255,248,248,0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(192,57,43,0.08);
        }

        .nav-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, var(--red), #e74c3c);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 14px var(--red-glow);
          transition: transform 0.25s ease;
        }
        .nav-logo:hover .logo-icon { transform: rotate(-8deg) scale(1.06); }
        .logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
        }
        .logo-text em {
          font-style: normal;
          color: var(--red);
        }

        /* ── Desktop nav links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0; padding: 0;
        }
        @media (max-width: 860px) { .nav-links { display: none; } }

        .nav-item {
          position: relative;
        }
        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 13px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .nav-link:hover, .nav-link.active-link {
          background: var(--red-soft);
          color: var(--red);
        }
        .nav-chevron {
          font-size: 0.6rem;
          opacity: 0.5;
          transition: transform 0.2s ease;
          display: inline-block;
        }
        .nav-item:hover .nav-chevron { transform: rotate(180deg); opacity: 1; }

        /* ── Dropdown ── */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(192,57,43,0.1);
          border-radius: 18px;
          padding: 10px;
          min-width: 240px;
          box-shadow: 0 16px 50px rgba(0,0,0,0.1), 0 4px 16px rgba(192,57,43,0.08);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 100;
        }
        .nav-dropdown.dd-visible {
          opacity: 1;
          pointer-events: all;
          transform: translateX(-50%) translateY(0);
        }

        /* Dropdown arrow pointer */
        .nav-dropdown::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px; height: 10px;
          background: #fff;
          border-left: 1px solid rgba(192,57,43,0.1);
          border-top: 1px solid rgba(192,57,43,0.1);
        }

        .dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .dd-item:hover { background: var(--red-soft); }
        .dd-icon {
          width: 34px; height: 34px;
          background: var(--red-mid);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .dd-item:hover .dd-icon { transform: scale(1.08); }
        .dd-text { display: flex; flex-direction: column; }
        .dd-label { font-weight: 600; font-size: 0.83rem; color: var(--text); line-height: 1.3; }
        .dd-sub { font-size: 0.72rem; color: var(--muted); }

        /* ── CTA buttons ── */
        .nav-cta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        @media (max-width: 860px) { .nav-cta { display: none; } }

        .btn-login {
          padding: 8px 18px;
          border: 1.5px solid rgba(192,57,43,0.2);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text);
          text-decoration: none;
          background: transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-login:hover {
          border-color: var(--red);
          color: var(--red);
          background: var(--red-soft);
        }

        .btn-signup {
          padding: 9px 20px;
          background: linear-gradient(135deg, var(--red) 0%, #e74c3c 100%);
          color: #fff;
          border-radius: 10px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          box-shadow: 0 4px 14px var(--red-glow);
          transition: all 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .btn-signup:hover { transform: translateY(-2px); box-shadow: 0 8px 22px var(--red-glow); }
        .btn-signup .su-arrow { transition: transform 0.2s ease; }
        .btn-signup:hover .su-arrow { transform: translateX(3px); }

        /* ── Hamburger ── */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          border-radius: 10px;
          background: none;
          border: none;
          transition: background 0.2s;
        }
        @media (max-width: 860px) { .hamburger { display: flex; } }
        .hamburger:hover { background: var(--red-soft); }
        .hb-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.28s ease;
          transform-origin: center;
        }
        .hamburger.open .hb-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open .hb-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open .hb-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile menu ── */
        .mobile-menu {
          display: none;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
          opacity: 0;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(192,57,43,0.08);
        }
        @media (max-width: 860px) { .mobile-menu { display: block; } }
        .mobile-menu.mob-open { max-height: 600px; opacity: 1; }

        .mob-inner { padding: 1.2rem 1.4rem 1.6rem; display: flex; flex-direction: column; gap: 0.3rem; }

        .mob-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .mob-link-row:hover { background: var(--red-soft); }
        .mob-link-row span:first-child {
          font-weight: 500;
          font-size: 0.92rem;
          color: var(--text);
        }
        .mob-chevron {
          font-size: 0.65rem;
          color: var(--muted);
          transition: transform 0.25s;
        }
        .mob-chevron.open { transform: rotate(180deg); }

        .mob-dropdown {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          padding-left: 0.5rem;
        }
        .mob-dropdown.open { max-height: 400px; }

        .mob-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s;
          margin: 2px 0;
        }
        .mob-dd-item:hover { background: var(--red-soft); }
        .mob-dd-icon {
          width: 30px; height: 30px;
          background: var(--red-mid);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .mob-dd-label { font-size: 0.83rem; font-weight: 600; color: var(--text); }

        .mob-divider { height: 1px; background: rgba(192,57,43,0.08); margin: 0.5rem 0; }

        .mob-cta-row { display: flex; gap: 0.7rem; margin-top: 0.4rem; }
        .mob-btn-login {
          flex: 1;
          padding: 11px;
          border: 1.5px solid rgba(192,57,43,0.2);
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text);
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .mob-btn-login:hover { border-color: var(--red); color: var(--red); background: var(--red-soft); }
        .mob-btn-signup {
          flex: 1;
          padding: 11px;
          background: linear-gradient(135deg, var(--red), #e74c3c);
          color: #fff;
          border-radius: 11px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          text-align: center;
          box-shadow: 0 4px 14px var(--red-glow);
        }

        /* Progress bar */
        .scroll-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--red), #e74c3c, #ff8a80);
          width: 0%;
          transition: width 0.1s linear;
          border-radius: 0 2px 2px 0;
        }
      `}</style>

      <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">⚕️</div>
            <span className="logo-text"><em>Medicare</em>Hub</span>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li
                key={link.label}
                className="nav-item"
                onMouseEnter={() => link.dropdown && handleMouseEnter(link.label)}
                onMouseLeave={() => link.dropdown && handleMouseLeave()}
              >
                {link.dropdown ? (
                  <>
                    <button className="nav-link">
                      {link.label}
                      <span className="nav-chevron">▼</span>
                    </button>
                    <DropdownMenu
                      items={link.dropdown}
                      visible={activeDropdown === link.label}
                    />
                  </>
                ) : (
                  <Link to={link.href} className="nav-link">{link.label}</Link>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="nav-cta">
            <Link to="/login" className="btn-login">Log in</Link>
            <Link to="/signup" className="btn-signup">
              Start Free <span className="su-arrow">→</span>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${open ? "open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className="hb-line" />
            <span className="hb-line" />
            <span className="hb-line" />
          </button>
        </div>

        {/* Scroll progress bar */}
        <ScrollProgress />

        {/* Mobile Menu */}
        <div className={`mobile-menu ${open ? "mob-open" : ""}`}>
          <div className="mob-inner">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.dropdown ? (
                  <>
                    <div
                      className="mob-link-row"
                      onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                    >
                      <span>{link.label}</span>
                      <span className={`mob-chevron ${mobileExpanded === link.label ? "open" : ""}`}>▼</span>
                    </div>
                    <div className={`mob-dropdown ${mobileExpanded === link.label ? "open" : ""}`}>
                      {link.dropdown.map((item) => (
                        <Link to={item.href} className="mob-dd-item" key={item.label}>
                          <div className="mob-dd-icon">{item.icon}</div>
                          <span className="mob-dd-label">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link to={link.href} className="mob-link-row" style={{ textDecoration: "none" }}>
                    <span>{link.label}</span>
                  </Link>
                )}
              </div>
            ))}
            <div className="mob-divider" />
            <div className="mob-cta-row">
              <Link to="/login" className="mob-btn-login">Log in</Link>
              <Link to="/signup" className="mob-btn-signup">Start Free →</Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

/* Scroll progress bar sub-component */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}