import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "trust-profile";

const defaultProfile = {
  name: "Abhay Thakur",
  role: "Senior Operator",
  email: "ops@trusta2a.com",
  organization: "Trust A2A Network",
  bio: "Managing agent workflows, escrow settlement, and verification quality.",
  avatarInitials: "AT",
  picture: null,
};

const defaultPreferences = {
  emailAlerts: true,
  taskUpdates: true,
  escrowAlerts: true,
  autoRefresh: false,
  compactTables: false,
  workspaceName: "Trust A2A Control Center",
  alertEmail: "ops@trusta2a.com",
  webhookUrl: "",
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const loadSaved = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (saved.profile) setProfile({ ...defaultProfile, ...saved.profile });
        if (saved.preferences) setPreferences({ ...defaultPreferences, ...saved.preferences });
      } catch {
        // ignore invalid storage
      }
    };

    loadSaved();
    window.addEventListener("trust-auth-change", loadSaved);
    return () => window.removeEventListener("trust-auth-change", loadSaved);
  }, []);

  const persist = (nextProfile, nextPreferences) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile: nextProfile, preferences: nextPreferences }),
    );
  };

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      persist(next, preferences);
      return next;
    });
  };

  const updatePreferences = (updates) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      persist(profile, next);
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, preferences, updateProfile, updatePreferences }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
