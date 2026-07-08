import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
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
      <Button
        type="button"
        variant="ghost"
        className="h-auto rounded-xl px-2 py-1.5 hover:bg-muted/60"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-center gap-2">
          <Avatar size="sm" className="ring-2 ring-primary/20">
            {profile.picture ? <AvatarImage src={profile.picture} alt={profile.name} /> : null}
            <AvatarFallback>{profile.avatarInitials || "AT"}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-xs font-medium">{profile.name}</p>
            <p className="text-[11px] text-muted-foreground">{profile.role}</p>
          </div>
        </div>
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-xl border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-xl"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
              onClick={() => closeAndNavigate("/profile")}
            >
              <UserRound size={14} />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
              onClick={() => closeAndNavigate("/settings")}
            >
              <Settings size={14} />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
              onClick={() => {
                setOpen(false);
                toggleTheme();
              }}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <div className="border-t border-border/60 pt-1">
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition",
                "hover:bg-destructive/10",
              )}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileMenu;
