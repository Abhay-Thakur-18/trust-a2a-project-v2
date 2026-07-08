import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, Eye, EyeOff, Lock, Mail, UserPlus, UserRound,
  ShieldCheck, CheckCircle, Circle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";

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
const strengthColors = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"];

function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"", role:"Operator", organization:"" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    try { await signup({ name: form.name, email: form.email, password: form.password, role: form.role, organization: form.organization }); navigate("/", { replace: true }); }
    catch (err) { setError(err?.message || "Unable to create account."); }
    finally { setLoading(false); }
  };

  const checks = [
    { label: "8+ characters", ok: form.password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Number", ok: /[0-9]/.test(form.password) },
  ];

  const Field = ({ id, label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute top-1/2 left-3.5 -translate-y-1/2" style={{ color: "#CBD5E1" }} />}
        <input id={id} className={`ai-input w-full h-10 ${Icon ? "pl-10" : "pl-3.5"} pr-4`} {...props} />
      </div>
    </div>
  );

  return (
    <div className="auth-card w-full max-w-lg p-8 relative overflow-hidden">
      <div className="absolute top-0 left-[10%] right-[10%] h-0.5 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, #2563EB, #06B6D4, transparent)" }} />

      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl relative"
            style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
            <ShieldCheck size={22} className="text-white" />
            <div className="absolute top-1 left-1 right-1 h-5 rounded-xl opacity-20"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8), transparent)" }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#0F172A" }}>Create your account</h1>
        <p className="text-sm" style={{ color: "#64748B" }}>Join the Trust A2A agent network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="name"         label="Full Name"     icon={UserRound} value={form.name}         onChange={set("name")}         placeholder="Your full name" required />
        <Field id="signup-email" label="Email Address" icon={Mail}      value={form.email}        onChange={set("email")}        placeholder="you@company.com" type="email" autoComplete="email" required />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="role"         label="Role"         value={form.role}         onChange={set("role")}         placeholder="Operator" />
          <Field id="organization" label="Organization" icon={Building2} value={form.organization} onChange={set("organization")} placeholder="Company name" />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-pw" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>Password</label>
          <div className="relative">
            <Lock size={13} className="absolute top-1/2 left-3.5 -translate-y-1/2" style={{ color: "#CBD5E1" }} />
            <input id="signup-pw" type={showPw ? "text" : "password"} required autoComplete="new-password"
              className="ai-input w-full h-10 pl-10 pr-11"
              value={form.password} onChange={set("password")} placeholder="Min. 8 characters" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors hover:text-slate-500"
              style={{ color: "#CBD5E1" }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="space-y-1.5 animate-fade-in">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? strengthColors[strength] : "#E2E8F0" }} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                <div className="flex gap-3">
                  {checks.map(c => (
                    <span key={c.label} className={`flex items-center gap-1 text-[11px] font-medium ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
                      {c.ok ? <CheckCircle size={10} /> : <Circle size={10} />}{c.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Field id="confirm-pw" label="Confirm Password" icon={Lock} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" type={showPw ? "text" : "password"} required />

        {error && (
          <div className="animate-fade-in rounded-xl px-3.5 py-2.5 text-sm"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; e.currentTarget.style.transform = ""; }}>
          {loading
            ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Creating account…</>
            : <><UserPlus size={14} />Create Account</>}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "#94A3B8" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "#2563EB" }}>Log in →</Link>
      </p>
    </div>
  );
}

export default Signup;
