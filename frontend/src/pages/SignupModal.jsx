import { useState, useEffect } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

/* Password strength scorer */
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#e74c3c", "#f39c12", "#27ae60", "#16a085"];

export default function SignupModal() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const strength = getStrength(password);

  const handleSignup = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/register", { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --red: #C0392B;
          --red-light: #E74C3C;
          --red-soft: #FDF2F2;
          --red-mid: #FADBD8;
          --red-glow: rgba(192,57,43,0.18);
          --text: #1a1a2e;
          --muted: #6B7280;
        }

        .su-overlay {
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(26,26,46,0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .su-overlay.mounted { opacity: 1; }

        .su-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 55% 55% at 15% 25%, rgba(192,57,43,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 45% 50% at 85% 75%, rgba(231,76,60,0.09) 0%, transparent 55%);
          pointer-events: none;
        }

        .su-card {
          background: #ffffff;
          border-radius: 28px;
          width: 100%;
          max-width: 450px;
          box-shadow:
            0 32px 80px rgba(0,0,0,0.18),
            0 4px 20px rgba(192,57,43,0.1),
            inset 0 1px 0 rgba(255,255,255,1);
          position: relative;
          overflow: hidden;
          transform: translateY(24px) scale(0.97);
          opacity: 0;
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
        }
        .su-overlay.mounted .su-card {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .su-strip {
          height: 4px;
          background: linear-gradient(90deg, var(--red), #e74c3c, #ff8a80, #e74c3c);
          background-size: 200% 100%;
          animation: stripMove 3s linear infinite;
        }
        @keyframes stripMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .su-body { padding: 2.2rem 2.4rem 2.4rem; }

        .close-btn {
          position: absolute;
          top: 18px; right: 18px;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #f5f5f5;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          color: var(--muted);
          transition: background 0.2s, color 0.2s, transform 0.2s;
          text-decoration: none;
          z-index: 2;
        }
        .close-btn:hover { background: var(--red-mid); color: var(--red); transform: rotate(90deg); }

        /* Header */
        .su-header { text-align: center; margin-bottom: 1.8rem; }
        .su-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px; height: 52px;
          background: linear-gradient(135deg, var(--red), #e74c3c);
          border-radius: 16px;
          font-size: 1.4rem;
          box-shadow: 0 6px 20px var(--red-glow);
          margin-bottom: 1.1rem;
        }
        .su-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 5px;
          line-height: 1.2;
        }
        .su-sub { font-size: 0.83rem; color: var(--muted); margin: 0; }

        /* Progress steps */
        .step-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 1.8rem;
        }
        .step-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          transition: all 0.3s ease;
          border: 2px solid #e8dede;
          color: var(--muted);
          background: #fff;
          flex-shrink: 0;
        }
        .step-dot.active { background: var(--red); border-color: var(--red); color: #fff; box-shadow: 0 3px 10px var(--red-glow); }
        .step-dot.done { background: #16a085; border-color: #16a085; color: #fff; }
        .step-line { width: 36px; height: 2px; background: #ede5e5; transition: background 0.3s; }
        .step-line.filled { background: var(--red); }
        .step-label {
          font-size: 0.65rem;
          color: var(--muted);
          text-align: center;
          margin-top: 4px;
          font-weight: 500;
        }
        .step-wrap { display: flex; flex-direction: column; align-items: center; }

        /* Error / success */
        .error-box {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #fff5f5;
          border: 1px solid #fca5a5;
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 1.2rem;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .error-msg { font-size: 0.82rem; color: #b91c1c; font-weight: 500; }

        .success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          text-align: center;
          gap: 0.8rem;
          animation: fadeUp 0.5s ease forwards;
        }
        .success-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #16a085, #1abc9c);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem;
          box-shadow: 0 6px 22px rgba(22,160,133,0.3);
          animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .success-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text);
          margin: 0;
        }
        .success-sub { font-size: 0.85rem; color: var(--muted); margin: 0; }
        .success-redirect {
          font-size: 0.78rem;
          color: var(--red);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .redirect-dots span {
          display: inline-block;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--red);
          animation: dotBounce 1s ease-in-out infinite;
        }
        .redirect-dots span:nth-child(2) { animation-delay: 0.15s; }
        .redirect-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBounce {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        /* Form */
        .form-group { margin-bottom: 1rem; }
        .form-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 7px;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute;
          left: 13px;
          font-size: 0.95rem;
          color: var(--muted);
          pointer-events: none;
          z-index: 1;
        }
        .form-input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          border: 1.5px solid #e8dede;
          border-radius: 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--text);
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--red);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(192,57,43,0.08);
        }
        .form-input::placeholder { color: #c0b8b8; }
        .form-input.valid { border-color: #16a085; }
        .form-input.valid:focus { box-shadow: 0 0 0 4px rgba(22,160,133,0.1); }

        .valid-check {
          position: absolute;
          right: 12px;
          font-size: 0.9rem;
          color: #16a085;
          animation: fadeUp 0.3s ease;
        }
        .eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: var(--muted);
          padding: 4px;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: var(--red); }

        /* Strength meter */
        .strength-wrap { margin-top: 8px; }
        .strength-bars {
          display: flex;
          gap: 4px;
          margin-bottom: 4px;
        }
        .strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: #f0e8e8;
          transition: background 0.3s ease;
        }
        .strength-text { font-size: 0.72rem; font-weight: 600; transition: color 0.3s; }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, var(--red) 0%, #e74c3c 100%);
          color: #fff;
          border: none;
          border-radius: 13px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 6px 22px var(--red-glow);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1.4rem;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #e74c3c, #ff6b6b);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px var(--red-glow); }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn span, .submit-btn .spinner { position: relative; z-index: 1; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 10px; margin: 1.3rem 0 1rem; }
        .divider-line { flex: 1; height: 1px; background: #f0e8e8; }
        .divider-text { font-size: 0.7rem; color: #c0aaaa; font-weight: 500; letter-spacing: 0.05em; }

        .social-row { display: flex; gap: 0.7rem; }
        .social-btn {
          flex: 1;
          padding: 10px;
          border: 1.5px solid #ede5e5;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: all 0.2s ease;
        }
        .social-btn:hover { border-color: var(--red-mid); background: var(--red-soft); transform: translateY(-1px); }

        .su-footer { text-align: center; margin-top: 1.3rem; font-size: 0.82rem; color: var(--muted); }
        .su-footer a { color: var(--red); font-weight: 600; text-decoration: none; }
        .su-footer a:hover { text-decoration: underline; }

        .trust-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.2rem;
          padding: 0.9rem 2.4rem;
          border-top: 1px solid #f9f0f0;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.7rem; color: #b0a0a0; font-weight: 500;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={`su-overlay ${mounted ? "mounted" : ""}`}>
        <div className="su-card">
          <div className="su-strip" />

          <Link to="/" className="close-btn" aria-label="Close">✕</Link>

          <div className="su-body">
            {/* Header */}
            <div className="su-header">
              <div className="su-logo">⚕️</div>
              <h2 className="su-title">Create your account</h2>
              <p className="su-sub">Join MedicareHub — it's free forever.</p>
            </div>

            {/* Step indicator */}
            <div className="step-row">
              {[
                { label: "Account" },
                { label: "Verify" },
                { label: "Done" },
              ].map((s, i) => {
                const filled = i === 0 ? !!username && !!email : i === 1 ? !!password : false;
                const active = i === 0;
                return (
                  <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                    <div className="step-wrap">
                      <div className={`step-dot ${active ? "active" : filled ? "done" : ""}`}>
                        {filled && !active ? "✓" : i + 1}
                      </div>
                      <span className="step-label">{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div className={`step-line ${filled ? "filled" : ""}`} style={{ marginBottom: "16px" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Success state */}
            {success ? (
              <div className="success-box">
                <div className="success-icon">✓</div>
                <p className="success-title">Account Created!</p>
                <p className="success-sub">Welcome to MedicareHub. Redirecting you to login…</p>
                <div className="success-redirect">
                  <div className="redirect-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Error */}
                {error && (
                  <div className="error-box">
                    <span>⚠️</span>
                    <span className="error-msg">{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} noValidate>
                  {/* Username */}
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrap">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        className={`form-input ${username.length >= 3 ? "valid" : ""}`}
                        placeholder="e.g. john_doe"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                        required
                        autoComplete="username"
                      />
                      {username.length >= 3 && <span className="valid-check">✓</span>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        className={`form-input ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "valid" : ""}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                        autoComplete="email"
                      />
                      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <span className="valid-check">✓</span>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>

                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="strength-wrap">
                        <div className="strength-bars">
                          {[1, 2, 3, 4].map((lvl) => (
                            <div
                              key={lvl}
                              className="strength-bar"
                              style={{ background: lvl <= strength ? STRENGTH_COLORS[strength] : "#f0e8e8" }}
                            />
                          ))}
                        </div>
                        <span className="strength-text" style={{ color: STRENGTH_COLORS[strength] }}>
                          {STRENGTH_LABELS[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <><div className="spinner" /><span>Creating account…</span></>
                    ) : (
                      <><span>Create Account</span><span style={{ position: "relative", zIndex: 1 }}>→</span></>
                    )}
                  </button>
                </form>

                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">OR SIGN UP WITH</span>
                  <div className="divider-line" />
                </div>

                <div className="social-row">
                  <button className="social-btn"><span>🌐</span> Google</button>
                  <button className="social-btn"><span>📱</span> Phone OTP</button>
                </div>

                <p className="su-footer">
                  Already have an account?{" "}
                  <Link to="/login">Sign in</Link>
                </p>
              </>
            )}
          </div>

          <div className="trust-strip">
            <div className="trust-item"><span>🔒</span><span>256-bit SSL</span></div>
            <div className="trust-item"><span>✓</span><span>HIPAA Compliant</span></div>
            <div className="trust-item"><span>🛡️</span><span>Data Protected</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

