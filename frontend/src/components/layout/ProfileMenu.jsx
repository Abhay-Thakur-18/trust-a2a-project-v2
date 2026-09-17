import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, UserRound, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { profile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeAndNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar size="sm" className="h-7 w-7 ring-1 ring-slate-200">
          {profile.picture ? <AvatarImage src={profile.picture} alt={profile.name} /> : null}
          <AvatarFallback className="bg-blue-50 text-xs font-semibold text-blue-700">
            {profile.avatarInitials || "OP"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-medium text-slate-800 leading-tight">{profile.name || "Operator"}</p>
          <p className="text-[10px] text-slate-500 leading-tight">{profile.role || "Admin"}</p>
        </div>
        <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-slate-800 shadow-lg animate-fade-in"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile.name || "Operator"}</p>
            <p className="truncate text-[11px] text-slate-500">{profile.email || "operator@trusta2a.network"}</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => closeAndNavigate("/profile")}
            >
              <UserRound size={13} className="text-slate-400" />
              Profile Settings
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => closeAndNavigate("/settings")}
            >
              <Settings size={13} className="text-slate-400" />
              Workspace Preferences
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={13} className="text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileMenu;
