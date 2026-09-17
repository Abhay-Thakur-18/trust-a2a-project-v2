import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO_EMAIL = "demo@trusta2a.com";
const DEMO_PASS  = "demo123456";

function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState(null);

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
      try { await signup({ name: "Demo Operator", email: DEMO_EMAIL, password: DEMO_PASS, role: "Operator", organization: "Trust A2A Network" }); }
      catch { await login(DEMO_EMAIL, DEMO_PASS); }
      navigate(redirectTo, { replace: true });
    } catch { setError("Demo login failed. Please try again."); }
    finally { setDemoLoading(false); }
  };

  const busy = loading || demoLoading;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs relative">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-xs text-white">
            <ShieldCheck size={24} />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Sign in to Trust A2A</h1>
        <p className="text-xs text-slate-500 mt-1">Decentralized multi-agent collaboration dashboard</p>
      </div>

      {/* Demo Account Button */}
      <button
        type="button"
        onClick={handleDemo}
        disabled={busy}
        className="w-full mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100/70 disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-blue-600" />
          <span>{demoLoading ? "Authenticating demo..." : "Explore Demo Environment"}</span>
        </div>
        {!demoLoading && <ArrowRight size={13} />}
      </button>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">or email access</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-9 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? (
            <>Signing in...</>
          ) : (
            <><LogIn size={13} /> Sign In</>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Need an operator account?{" "}
        <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default Login;
