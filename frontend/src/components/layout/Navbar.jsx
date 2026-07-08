import { useState } from "react";
import { Bell, Menu, Moon, Sun, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import SidebarNav from "./SidebarNav";
import ProfileMenu from "./ProfileMenu";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated }    = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="premium-navbar sticky top-0 z-20 flex h-[60px] items-center justify-between px-5 lg:px-7">
      {/* ── Left ── */}
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger render={
            <button className="nav-icon-btn md:hidden" aria-label="Open menu">
              <Menu size={16} />
            </button>
          } />
          <SheetContent side="left" className="w-[240px] p-0 border-0" style={{ background: "var(--sidebar)" }}>
            <SidebarNav mobile />
          </SheetContent>
        </Sheet>

        {/* Brand label for mobile */}
        <span className="md:hidden text-sm font-bold gradient-text">Trust A2A</span>
      </div>

      {/* ── Right ── */}
      <div className="ml-3 flex items-center gap-1.5">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="nav-icon-btn" aria-label="Toggle theme">
          {theme === "dark"
            ? <Sun size={15} style={{ color: "#F59E0B" }} />
            : <Moon size={15} style={{ color: "#6366F1" }} />}
        </button>

        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)} className="nav-icon-btn relative" aria-label="Notifications">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--primary)", boxShadow: "0 0 0 2px var(--card)" }} />
              </button>

              {notifOpen && (
                <div className="notif-dropdown animate-scale-in absolute right-0 top-11 w-80 rounded-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Notifications</h3>
                    <button onClick={() => setNotifOpen(false)} className="nav-icon-btn h-7 w-7">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: "🟢", text: "Worker Agent online",   time: "Just now", dot: "#10B981" },
                      { icon: "⚡", text: "Task pipeline ready",   time: "2m ago",   dot: "var(--primary)" },
                      { icon: "🔐", text: "Escrow service active", time: "5m ago",   dot: "var(--accent)" },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors hover:bg-[var(--muted)]"
                        style={{ border: "1px solid var(--border)" }}>
                        <span className="text-base mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{n.text}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{n.time}</p>
                        </div>
                        <Zap size={11} style={{ color: n.dot }} className="mt-1 shrink-0" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>All systems nominal</p>
                </div>
              )}
            </div>
            <ProfileMenu />
          </>
        ) : (
          <div className="flex items-center gap-2 ml-1">
            <Link to="/login" className="hidden sm:flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
              onMouseLeave={e => e.currentTarget.style.background = ""}>
              Log In
            </Link>
            <Link to="/signup" className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
