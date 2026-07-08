import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { verifyGoogleCredential } from "../services/authService";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const USERS_KEY = "trust-users";
const SESSION_KEY = "trust-session";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function toInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function syncProfileStorage(user) {
  const existing = JSON.parse(localStorage.getItem("trust-profile") || "{}");
  const profile = {
    name: user.name,
    role: user.role,
    email: user.email,
    organization: user.organization || "Trust A2A Network",
    bio: existing.profile?.bio || "Managing agent workflows, escrow settlement, and verification quality.",
    avatarInitials: toInitials(user.name),
    picture: user.picture || null,
  };
  localStorage.setItem("trust-profile", JSON.stringify({ ...existing, profile }));
  window.dispatchEvent(new CustomEvent("trust-auth-change"));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const session = readSession();
    if (session) {
      setUser(session);
      syncProfileStorage(session);
    }
    setBootstrapping(false);
  }, []);

  const persistSession = useCallback((nextUser) => {
    if (nextUser) {
      const { password, ...safeUser } = nextUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      syncProfileStorage(safeUser);
      return;
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent("trust-auth-change"));
  }, []);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const match = readUsers().find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    );
    if (!match) {
      throw new Error("Invalid email or password.");
    }
    persistSession(match);
    const { password: _, ...safeUser } = match;
    return safeUser;
  }, [persistSession]);

  const loginWithGoogle = useCallback(async (credential) => {
    const result = await verifyGoogleCredential(credential);
    if (!result?.user) {
      throw new Error("Google authentication failed.");
    }
    persistSession(result.user);
    return result.user;
  }, [persistSession]);

  const signup = useCallback(async ({ name, email, password, role, organization }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role?.trim() || "Operator",
      organization: organization?.trim() || "Trust A2A Network",
      provider: "local",
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    persistSession(newUser);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }, [persistSession]);

  const logout = useCallback(() => {
    const session = readSession();
    if (session?.provider === "google" && GOOGLE_CLIENT_ID) {
      import("@react-oauth/google")
        .then(({ googleLogout }) => {
          try {
            googleLogout();
          } catch {
            // ignore google logout errors
          }
        })
        .catch(() => null);
    }
    persistSession(null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      bootstrapping,
      login,
      loginWithGoogle,
      signup,
      logout,
    }),
    [user, bootstrapping, login, loginWithGoogle, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
