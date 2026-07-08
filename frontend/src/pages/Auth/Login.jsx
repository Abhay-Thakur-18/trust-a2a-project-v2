import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const DEMO_EMAIL = "demo@trusta2a.com";
const DEMO_PASS  = "demo123456";

function Login() {
  const { login, signup }    = useAuth();
  const navigate             = useNavigate();
  const location             = useLocation();
  const redirectTo           = location.state?.from || "/";
  const [email, setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]  = useState(false);
  const [loading, setLoading]     = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await login(email, password); navigate(redirectTo, { replace: true }); }
    catch (err) { setError(err?.message || "Invalid email or password."); }
    finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setDemoLoading(true); setError(null);
    try {
      try { await signup({ name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASS, role: "Operator", organization: "Trust A2A Network" }); }
      catch { await login(DEMO_EMAIL, DEMO_PASS); }
      navigate(redirectTo, { replace: true });
    } catch { setError("Demo login failed. Please try again."); }
    finally { setDemoLoading(false); }
  };

  const busy = loading || demoLoading;

  return (
    <div className="auth-card w-full max-w-md p-8 relative overflow-hidden">
      {/* Blue top accent line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-0.5 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, #2563EB, #06B6D4, transparent)" }} />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              boxShadow: "0 8px 24px rgba(37,99,235,0.3), 0 2px 8px rgba(37,99,235,0.2)",
            }}>
            <ShieldCheck size={26} className="text-white" />
            {/* Shine */}
            <div className="absolute top-1 left-1 right-1 h-6 rounded-xl opacity-20"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8), transparent)" }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#0F172A" }}>Welcome back</h1>
        <p className="text-sm" style={{ color: "#64748B" }}>Sign in to your Trust A2A control center</p>
      </div>

      {/* Demo button */}
      <button type="button" onClick={handleDemo} disabled={busy}
        className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:bg-blue-50"
        style={{
          background: "#EFF6FF",
          border: "1.5px solid #BFDBFE",
          color: "#2563EB",
        }}>
        <Zap size={14} />
        {demoLoading ? "Loading demo…" : "Try Demo Account"}
        {!demoLoading && <ArrowRight size={13} className="ml-auto" />}
      </button>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "#F1F5F9" }} />
        <span className="text-xs font-medium" style={{ color: "#CBD5E1" }}>or sign in with email</span>
        <div className="flex-1 h-px" style={{ background: "#F1F5F9" }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>
            Email Address
          </label>
          <div className="relative">
            <Mail size={14} className="absolute top-1/2 left-3.5 -translate-y-1/2" style={{ color: "#CBD5E1" }} />
            <input id="email" type="email" required autoComplete="email"
              className="ai-input w-full h-11 pl-10 pr-4"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>
            Password
          </label>
          <div className="relative">
            <Lock size={14} className="absolute top-1/2 left-3.5 -translate-y-1/2" style={{ color: "#CBD5E1" }} />
            <input id="password" type={showPw ? "text" : "password"} required autoComplete="current-password"
              className="ai-input w-full h-11 pl-10 pr-11"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors hover:text-slate-500"
              style={{ color: "#CBD5E1" }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="animate-fade-in rounded-xl px-3.5 py-2.5 text-sm"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={busy}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #2563EB, #3B82F6)",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; e.currentTarget.style.transform = ""; }}>
          {loading
            ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Signing in…</>
            : <><LogIn size={14} />Log In with Email</>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
        New here?{" "}
        <Link to="/signup" className="font-semibold transition-colors hover:text-blue-700" style={{ color: "#2563EB" }}>
          Create an account →
        </Link>
      </p>
    </div>
  );
}

export default Login;
