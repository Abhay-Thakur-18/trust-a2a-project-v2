import { Link, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ScrollToTop from "../components/layout/ScrollToTop";

function AuthLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="auth-shell min-h-screen bg-slate-50 flex flex-col">
      <ScrollToTop />

      {/* Clean Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white px-6 md:px-10">
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Trust A2A</span>
            <span className="ml-2 hidden text-xs font-normal text-slate-500 sm:inline">Enterprise Agent Network</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Network Online</span>
          </div>
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-4 text-center text-xs text-slate-400">
        Trust A2A Multi-Agent Collaboration Platform &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default AuthLayout;
