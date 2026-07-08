import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, Users, ShieldCheck, Wallet, ArrowLeftRight, ChartSpline, Settings, UserRound, Activity } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

const groups = [
  { label: "Overview",    items: [
    { icon: LayoutDashboard, title: "Dashboard",     path: "/" },
    { icon: ListTodo,        title: "Tasks",         path: "/tasks" },
    { icon: Users,           title: "Workers",       path: "/workers" },
  ]},
  { label: "Operations",  items: [
    { icon: ShieldCheck,    title: "Verifications", path: "/verifications" },
    { icon: Wallet,         title: "Escrow",        path: "/escrow" },
    { icon: ArrowLeftRight, title: "Transactions",  path: "/transactions" },
  ]},
  { label: "Analytics",   items: [
    { icon: ChartSpline, title: "Reports",  path: "/reports" },
    { icon: Settings,    title: "Settings", path: "/settings" },
  ]},
];

function SidebarNav({ mobile = false }) {
  const { profile, preferences } = useProfile();

  const content = (
    <div className="flex h-full flex-col" style={{ background: "var(--sidebar)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, var(--primary), #3B82F6)", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
          <ShieldCheck size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold" style={{ color: "var(--sidebar-foreground)" }}>Trust A2A</h2>
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            {preferences.workspaceName || "Control Center"}
          </p>
        </div>
        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-500">Live</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="section-label mb-1.5 px-3">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} end={item.path === "/"}
                    className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
                    {({ isActive }) => (
                      <>
                        <div className="sidebar-item-icon shrink-0">
                          <Icon size={14} style={{ color: isActive ? "white" : "var(--muted-foreground)" }} />
                        </div>
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--sidebar-primary)" }} />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <NavLink to="/profile"
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
          {profile.picture
            ? <img src={profile.picture} alt="" className="h-8 w-8 rounded-full object-cover ring-2" style={{ ringColor: "var(--sidebar-primary)" }} />
            : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--primary), #3B82F6)" }}>
                {profile.avatarInitials || "AT"}
              </div>
          }
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--sidebar-foreground)" }}>{profile.name || "Operator"}</p>
            <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>{profile.role || "Administrator"}</p>
          </div>
          <UserRound size={13} style={{ color: "var(--muted-foreground)" }} />
        </NavLink>

        {/* Status */}
        <div className="flex items-center gap-2.5 rounded-xl p-2.5"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-emerald-500 flex-1">All agents operational</span>
          <Activity size={11} className="text-emerald-500 shrink-0" />
        </div>
      </div>
    </div>
  );

  if (mobile) return content;

  return (
    <div className="premium-sidebar hidden w-[240px] shrink-0 md:block">
      {content}
    </div>
  );
}

export default SidebarNav;
