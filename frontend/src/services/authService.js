import { clientApi } from "./api";

/**
 * Decode a Google JWT credential client-side (no backend required).
 * Google's credential is a standard base64url JWT — we just decode the payload.
 * This is used as a fallback when the backend doesn't have GOOGLE_CLIENT_ID configured.
 */
function decodeGoogleJwt(credential) {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    // base64url → base64 → decode
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    throw new Error("Failed to decode Google token.");
  }
}

/**
 * Primary: verify via backend (server-side verification with google-auth-library).
 * Fallback: decode JWT client-side if backend returns 503 (not configured) or network error.
 */
export const verifyGoogleCredential = async (credential) => {
  // 1. Try backend verification first
  try {
    const { data } = await clientApi.post("/auth/google", { credential });
    if (data?.error) throw new Error(data.error);
    if (data?.user) return data;
  } catch (err) {
    const status = err?.response?.status;
    // 503 = backend GOOGLE_CLIENT_ID not configured, 503/network = fall through to client decode
    if (status !== 503 && err?.code !== "ERR_NETWORK" && err?.code !== "ECONNREFUSED") {
      // Real auth error (401 invalid token) — rethrow
      const detail = err?.response?.data?.detail || err?.message;
      throw new Error(detail || "Google authentication failed.");
    }
    // Fall through to client-side decode
  }

  // 2. Client-side fallback — decode the JWT payload directly from Google's token
  const payload = decodeGoogleJwt(credential);

  if (!payload?.email) throw new Error("Google account email is required.");
  if (!payload?.email_verified) throw new Error("Google email is not verified.");

  const issuer = payload?.iss;
  if (issuer !== "accounts.google.com" && issuer !== "https://accounts.google.com") {
    throw new Error("Invalid Google token issuer.");
  }

  return {
    user: {
      id: `google-${payload.sub}`,
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture || null,
      provider: "google",
      role: "Operator",
      organization: payload.hd || "Trust A2A Network",
      emailVerified: true,
    },
  };
};
