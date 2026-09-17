import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, Eye, EyeOff, Lock, Mail, UserPlus, UserRound,
  ShieldCheck, CheckCircle, Circle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981", "#059669"];

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "Operator", organization: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    try {
      await signup({ name: form.name, email: form.email, password: form.password, role: form.role, organization: form.organization });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to create operator account.");
    } finally {
      setLoading(false);
    }
  };

  const checks = [
    { label: "8+ chars", ok: form.password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
    { label: "Number", ok: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xs relative">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-xs text-white">
            <ShieldCheck size={24} />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Register Operator Account</h1>
        <p className="text-xs text-slate-500 mt-1">Join the Trust A2A multi-agent network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-semibold text-slate-700">Full Name</label>
          <div className="relative">
            <UserRound size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              type="text"
              required
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.name}
              onChange={set("name")}
              placeholder="Alex Walker"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="signup-email" className="text-xs font-semibold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.email}
              onChange={set("email")}
              placeholder="alex@company.com"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="role" className="text-xs font-semibold text-slate-700">Role</label>
            <input
              id="role"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.role}
              onChange={set("role")}
              placeholder="Platform Operator"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="organization" className="text-xs font-semibold text-slate-700">Organization</label>
            <div className="relative">
              <Building2 size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                id="organization"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.organization}
                onChange={set("organization")}
                placeholder="Trust Labs"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="signup-pw" className="text-xs font-semibold text-slate-700">Password</label>
          <div className="relative">
            <Lock size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-pw"
              type={showPw ? "text" : "password"}
              required
              autoComplete="new-password"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-9 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.password}
              onChange={set("password")}
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
          {form.password.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? strengthColors[strength] : "#e2e8f0" }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
                <div className="flex gap-2">
                  {checks.map((c) => (
                    <span key={c.label} className={`flex items-center gap-0.5 ${c.ok ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                      {c.ok ? <CheckCircle size={10} /> : <Circle size={10} />}
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirm-pw" className="text-xs font-semibold text-slate-700">Confirm Password</label>
          <div className="relative">
            <Lock size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="confirm-pw"
              type={showPw ? "text" : "password"}
              required
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? (
            <>Creating account...</>
          ) : (
            <><UserPlus size={13} /> Complete Registration</>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default Signup;
