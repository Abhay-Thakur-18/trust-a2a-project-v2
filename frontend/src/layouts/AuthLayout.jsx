import { Link, Outlet } from "react-router-dom";
import { Moon, ShieldCheck, Sun, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ScrollToTop from "../components/layout/ScrollToTop";

function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated }    = useAuth();

  return (
    <div className="auth-shell min-h-screen">
      <ScrollToTop />
      <div className="dot-grid" />
      <div className="mesh-gradient" />

      {/* Header */}
      <header className="premium-navbar relative z-20 flex items-center justify-between px-6 py-4 md:px-10">
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--primary), #3B82F6)", boxShadow: "var(--shadow-blue)" }}>
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Trust A2A</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Secure Operator Access
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Status */}
          <span className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems online
          </span>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="nav-icon-btn" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={14} style={{ color: "#F59E0B" }} /> : <Moon size={14} style={{ color: "#6366F1" }} />}
          </button>

          <Link to="/login"
            className="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}>
            Log In
          </Link>

          <Link to="/signup" className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white">
            <Sparkles size={13} />
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-65px)] items-center justify-center p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
