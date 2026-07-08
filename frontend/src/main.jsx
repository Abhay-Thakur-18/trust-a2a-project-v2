import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProfileProvider } from "./context/ProfileContext.jsx";

// VITE bakes this in at build time.
// Set VITE_GOOGLE_CLIENT_ID in frontend/.env (local dev) or
// GOOGLE_CLIENT_ID in root .env (Docker build) before rebuilding.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function AppProviders({ children }) {
  return (
    // Always wrap with GoogleOAuthProvider — the button component
    // handles the "no client ID" case gracefully with a setup guide.
    <GoogleOAuthProvider clientId={googleClientId || "placeholder-not-configured"}>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
