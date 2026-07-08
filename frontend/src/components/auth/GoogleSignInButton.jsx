import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, ExternalLink, Copy, Check } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function GoogleSignInButton({ onSuccess, onError, text = "signin_with" }) {
  const [localError, setLocalError] = useState(null);
  const [copied, setCopied] = useState(false);

  /* ── No Client ID configured ── */
  if (!GOOGLE_CLIENT_ID) {
    const copyStep = `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`;
    const handleCopy = () => {
      navigator.clipboard.writeText(copyStep);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-2.5">
        {/* Warning card */}
        <div
          className="rounded-xl border px-4 py-3.5 text-sm"
          style={{ borderColor: "oklch(0.7 0.15 75 / 30%)", background: "oklch(0.7 0.15 75 / 8%)" }}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-700 dark:text-amber-400">
                Google Sign-In needs setup
              </p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                Add your Google OAuth Client ID to <code className="font-mono bg-amber-500/15 px-1 rounded">.env</code>:
              </p>

              {/* Copy-able instruction */}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 font-mono text-[11px] text-amber-300/90">
                <span className="flex-1 truncate">GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 transition-colors hover:text-white"
                  title="Copy"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>

              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                <ExternalLink size={11} />
                Get Client ID from Google Cloud Console →
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Use email / Demo login below while Google is not configured
        </p>
      </div>
    );
  }

  /* ── Client ID available — render real Google button ── */
  return (
    <div className="space-y-2">
      <div className="google-signin-wrap flex justify-center">
        <GoogleLogin
          onSuccess={async (response) => {
            setLocalError(null);
            if (!response?.credential) {
              const message = "Google did not return a valid credential.";
              setLocalError(message);
              onError?.(message);
              return;
            }
            try {
              await onSuccess(response.credential);
            } catch (err) {
              const message =
                err?.response?.data?.detail || err?.message || "Google sign-in failed.";
              setLocalError(message);
              onError?.(message);
            }
          }}
          onError={() => {
            const message = "Google sign-in was cancelled or failed.";
            setLocalError(message);
            onError?.(message);
          }}
          useOneTap={false}
          theme="outline"
          size="large"
          text={text}
          shape="rectangular"
          width="360"
        />
      </div>
      {localError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {localError}
        </p>
      )}
    </div>
  );
}

export default GoogleSignInButton;
