import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  ShieldCheck,
  Wallet,
  ArrowLeftRight,
  FileBarChart,
  Settings,
  Activity,
  UserRound,
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

const groups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, title: "Dashboard", path: "/" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: ListTodo, title: "Tasks", path: "/tasks" },
      { icon: Users, title: "Workers", path: "/workers" },
      { icon: ShieldCheck, title: "Verifications", path: "/verifications" },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: Wallet, title: "Escrow", path: "/escrow" },
      { icon: ArrowLeftRight, title: "Transactions", path: "/transactions" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { icon: FileBarChart, title: "Reports", path: "/reports" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Settings, title: "Settings", path: "/settings" },
      { icon: UserRound, title: "Profile", path: "/profile" },
    ],
  },
];

function SidebarNav({ mobile = false }) {
  const { profile, preferences } = useProfile();

  const content = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200 select-none">
      {/* ── Brand / Logo ── */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">Trust A2A</h2>
          <p className="truncate text-[11px] font-medium text-slate-500">
            {preferences.workspaceName || "Enterprise Platform"}
          </p>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
                        <span className="flex-1 truncate">{item.title}</span>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / Operator Widget ── */}
      <div className="p-3.5 border-t border-slate-200 space-y-2 bg-slate-50/50">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg p-2 transition-colors border ${
              isActive ? "bg-white border-slate-300 shadow-2xs" : "border-transparent hover:bg-white hover:border-slate-200"
            }`
          }
        >
          {profile.picture ? (
            <img src={profile.picture} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {profile.avatarInitials || "OP"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800 leading-tight">{profile.name || "Operator"}</p>
            <p className="truncate text-[10px] text-slate-500 leading-tight">{profile.role || "Admin"}</p>
          </div>
          <UserRound size={14} className="text-slate-400 shrink-0" />
        </NavLink>

        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold truncate flex-1">Agent Protocol Live</span>
          <Activity size={13} className="text-emerald-600 shrink-0" />
        </div>
      </div>
    </div>
  );

  if (mobile) return content;

  return (
    <aside className="hidden w-[250px] shrink-0 md:block min-h-screen">
      <div className="sticky top-0 h-screen">{content}</div>
    </aside>
  );
}

export default SidebarNav;
