import { useState } from "react";
import { Bell, Menu, X, CheckCircle2, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useAuth } from "../../context/AuthContext";
import SidebarNav from "./SidebarNav";
import ProfileMenu from "./ProfileMenu";

const ROUTE_TITLES = {
  "/": { title: "Dashboard", group: "Overview" },
  "/tasks": { title: "Tasks", group: "Operations" },
  "/workers": { title: "Workers", group: "Operations" },
  "/verifications": { title: "Verifications", group: "Operations" },
  "/escrow": { title: "Escrow", group: "Finance" },
  "/transactions": { title: "Transactions", group: "Finance" },
  "/reports": { title: "Reports", group: "Intelligence" },
  "/settings": { title: "Settings", group: "System" },
  "/profile": { title: "Profile", group: "System" },
};

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const routeMeta = ROUTE_TITLES[location.pathname] || { title: "Trust A2A Platform", group: "Workspace" };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      {/* ── Left: Page Context / Breadcrumb ── */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger render={
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
          } />
          <SheetContent side="left" className="w-[260px] p-0 border-r border-slate-200 bg-white">
            <SidebarNav mobile />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb / Hierarchy */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-500 hidden sm:inline">Trust A2A</span>
          <ChevronRight size={13} className="text-slate-300 hidden sm:inline" />
          <span className="font-medium text-slate-500 hidden md:inline">{routeMeta.group}</span>
          <ChevronRight size={13} className="text-slate-300 hidden md:inline" />
          <span className="font-bold text-slate-900 text-sm">{routeMeta.title}</span>
        </nav>
      </div>

      {/* ── Right: Operations & Profile ── */}
      <div className="flex items-center gap-3">
        {/* Network Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>4 Services Online</span>
        </div>

        {isAuthenticated ? (
          <>
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">System Notifications</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">3 Live</span>
                    </div>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { title: "Escrow Service Active", desc: "Automated fund locking ready on Port 8003", time: "Just now" },
                      { title: "Verifier Agent Connected", desc: "Gemini judge scoring operational on Port 8002", time: "2m ago" },
                      { title: "Worker Fleet Online", desc: "Autonomous nodes ready for task assignments", time: "5m ago" },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200" />

            <ProfileMenu />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
