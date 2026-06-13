import { useState, useEffect } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      if (user.role === "hospital") navigate("/dashboard/hospital");
      else if (user.role === "doctor") navigate("/dashboard/doctor");
      else navigate("/dashboard/user");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
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

        .login-overlay {
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
        .login-overlay.mounted { opacity: 1; }

        /* Background mesh behind overlay */
        .login-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 60% at 20% 30%, rgba(192,57,43,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 80% 70%, rgba(231,76,60,0.1) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Card */
        .login-card {
          background: #ffffff;
          border-radius: 28px;
          width: 100%;
          max-width: 440px;
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
        .login-overlay.mounted .login-card {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* Top accent strip */
        .card-strip {
          height: 4px;
          background: linear-gradient(90deg, var(--red), #e74c3c, #ff8a80, #e74c3c);
          background-size: 200% 100%;
          animation: stripMove 3s linear infinite;
        }
        @keyframes stripMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .card-body { padding: 2.2rem 2.4rem 2.4rem; }

        /* Close */
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
        .login-header { text-align: center; margin-bottom: 2rem; }
        .login-logo {
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
        .login-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .login-sub {
          font-size: 0.85rem;
          color: var(--muted);
          margin: 0;
        }

        /* Error */
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
        .error-icon { font-size: 1rem; flex-shrink: 0; }
        .error-msg { font-size: 0.82rem; color: #b91c1c; font-weight: 500; }

        /* Form */
        .form-group { margin-bottom: 1.1rem; }
        .form-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 7px;
        }
        .form-label span:first-child {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .forgot-link {
          font-size: 0.75rem;
          color: var(--red);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 0.7; }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
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
          line-height: 1;
        }
        .eye-btn:hover { color: var(--red); }

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
          margin-top: 1.6rem;
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
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .submit-btn span { position: relative; z-index: 1; }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: relative; z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 1.4rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #f0e8e8; }
        .divider-text { font-size: 0.72rem; color: #c0aaaa; font-weight: 500; letter-spacing: 0.05em; }

        /* Social login */
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

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 1.4rem;
          font-size: 0.82rem;
          color: var(--muted);
        }
        .login-footer a { color: var(--red); font-weight: 600; text-decoration: none; }
        .login-footer a:hover { text-decoration: underline; }

        /* Trust strip */
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
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          color: #b0a0a0;
          font-weight: 500;
        }
        .trust-item span:first-child { font-size: 0.75rem; }
      `}</style>

      <div className={`login-overlay ${mounted ? "mounted" : ""}`}>
        <div className="login-card">
          {/* Animated top strip */}
          <div className="card-strip" />

          {/* Close button */}
          <Link to="/" className="close-btn" aria-label="Close">✕</Link>

          <div className="card-body">
            {/* Header */}
            <div className="login-header">
              <div className="login-logo">⚕️</div>
              <h2 className="login-title">Welcome back</h2>
              <p className="login-sub">Sign in to your account to continue.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="error-box">
                <span className="error-icon">⚠️</span>
                <span className="error-msg">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate>
              {/* Email */}
              <div className="form-group">
                <div className="form-label">
                  <span>Email Address</span>
                </div>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="form-label">
                  <span>Password</span>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /><span>Signing in…</span></>
                ) : (
                  <><span>Sign in</span><span style={{ position: "relative", zIndex: 1 }}>→</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <div className="divider-line" />
            </div>

            {/* Social */}
            <div className="social-row">
              <button className="social-btn">
                <span>🌐</span> Google
              </button>
              <button className="social-btn">
                <span>📱</span> Phone OTP
              </button>
            </div>

            {/* Footer */}
            <p className="login-footer">
              Don't have an account?{" "}
              <Link to="/signup">Create one free</Link>
            </p>
          </div>

          {/* Trust strip */}
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