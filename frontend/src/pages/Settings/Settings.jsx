import { useEffect, useState } from "react";
import {
  Bell, Database, LayoutGrid, Moon, Save,
  ShieldAlert, Sun, Trash2, Webhook,
  Accessibility, Type, Keyboard, Clock, Activity, Lock, UserRound,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { resetPlatform } from "../../services/taskService";
import { SERVICE_URLS } from "../../services/api";

const TABS = [
  { id: "account", label: "Account", icon: UserRound },
  { id: "authentication", label: "Authentication & Security", icon: ShieldAlert },
  { id: "services", label: "Services & Topology", icon: Database },
  { id: "application", label: "Application Preferences", icon: LayoutGrid },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200/80 bg-slate-50/40 p-3.5 transition-all hover:bg-slate-50 hover:border-slate-300">
      <div>
        <p className="text-xs font-semibold text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-slate-500 leading-normal">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}

function Settings() {
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences } = useProfile();
  const [tab, setTab] = useState("account");
  const [form, setForm] = useState(preferences);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const [fontSize, setFontSize] = useState(100);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  useEffect(() => { setForm(preferences); }, [preferences]);

  const handleSave = () => {
    updatePreferences(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all tasks, escrow, verifications, and reputation data?")) return;
    setResetting(true);
    setResetMessage(null);
    try {
      const result = await resetPlatform();
      setResetMessage(result?.message || "Platform reset complete.");
    } catch (err) {
      setResetMessage(err?.message || "Reset failed.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system endpoints, notification alerts, session policies, and platform data governance.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {TABS.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-2xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── ACCOUNT ── */}
      {tab === "account" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900">Workspace & Identity</CardTitle>
              <CardDescription className="text-xs text-slate-500">Configure organization details and currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Workspace Label</label>
                <Input className="h-9 text-xs" value={form.workspaceName} onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} placeholder="Trust A2A Control Center" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reporting Currency</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  value={form.currency || "USD"}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <Button onClick={handleSave} size="sm" className="h-8 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700">
                <Save size={13} className="mr-1" />
                {saved ? "Saved ✓" : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900">Notification Alerts</CardTitle>
              <CardDescription className="text-xs text-slate-500">Channels for real-time task and escrow updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <ToggleRow label="Email Critical Alerts" description="Forward high-priority escrow release notifications." checked={form.emailAlerts} onChange={(v) => setForm({ ...form, emailAlerts: v })} />
              <ToggleRow label="Task Lifecycle Updates" description="Notify on dispatch and completion events." checked={form.taskUpdates} onChange={(v) => setForm({ ...form, taskUpdates: v })} />
              <ToggleRow label="Escrow Settlement Alerts" description="Real-time alerts on vault locks and payout executions." checked={form.escrowAlerts} onChange={(v) => setForm({ ...form, escrowAlerts: v })} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── AUTHENTICATION ── */}
      {tab === "authentication" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lock size={14} className="text-slate-500" /> Session Security
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Operator authentication policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <ToggleRow label="Two-Factor Authentication" description="Require authenticator OTP for critical escrow actions." checked={twoFA} onChange={setTwoFA} />
              <ToggleRow label="Sign-In Alerts" description="Email operator whenever a new session is established." checked={loginAlerts} onChange={setLoginAlerts} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock size={12} /> Idle Session Timeout
                </label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="never">Never expire</option>
                </select>
              </div>
              <Button onClick={handleSave} size="sm" className="h-8 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700">
                <Save size={13} className="mr-1" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity size={14} className="text-slate-500" /> Authentication Audit
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Recent operator access logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {[
                { event: "Operator Session Active", time: "Just now", device: "Browser UI · Localhost", status: "success" },
                { event: "API Token Verified", time: "1 hour ago", device: "Client Agent Orchestrator", status: "success" },
                { event: "Escrow Settlement Authorized", time: "3 hours ago", device: "Gemini Verifier Node", status: "success" },
              ].map((log, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg border border-slate-200/70 bg-slate-50/40 px-3 py-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{log.event}</p>
                    <p className="text-[11px] text-slate-500">{log.device}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Success
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SERVICES ── */}
      {tab === "services" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900">Microservice Topology</CardTitle>
              <CardDescription className="text-xs text-slate-500">Connected network services for Trust A2A</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {[
                { name: "Client Orchestrator", url: SERVICE_URLS.client, port: "8000" },
                { name: "Gemini Worker Agent", url: SERVICE_URLS.worker, port: "8001" },
                { name: "Gemini Verifier Agent", url: SERVICE_URLS.verifier, port: "8002" },
                { name: "Escrow Ledger Vault", url: SERVICE_URLS.escrow, port: "8003" },
              ].map(({ name, url, port }) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/40 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{name}</span>
                    <span className="text-slate-400 font-mono">(:{port})</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                    {url}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900">Runtime Architecture</CardTitle>
              <CardDescription className="text-xs text-slate-500">Deployment and environment state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-xs">
              {[
                { label: "Platform Version", value: "v2.0 (Enterprise B2B)" },
                { label: "Protocol Pipeline", value: "Escrow Lock → Worker Execute → Verifier Audit → Payout" },
                { label: "AI Engine", value: "Google Gemini 2.5 Multi-Agent" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/40 px-3 py-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Autonomous Mesh
                </span>
                <span className="font-bold text-emerald-800">Operational</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── APPLICATION ── */}
      {tab === "application" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900">Appearance & Theme</CardTitle>
              <CardDescription className="text-xs text-slate-500">Configure visual layout preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex gap-2">
                {[
                  { val: "light", icon: Sun, label: "Light (Default)" },
                  { val: "dark", icon: Moon, label: "Dark" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      theme === val
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
              <ToggleRow label="Compact Table View" description="Use tighter padding for dense data inspection." checked={form.compactTables} onChange={(v) => setForm({ ...form, compactTables: v })} />
              <ToggleRow label="Auto Refresh Dashboard" description="Poll microservices every 30 seconds for live updates." checked={form.autoRefresh} onChange={(v) => setForm({ ...form, autoRefresh: v })} />
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Keyboard size={14} className="text-slate-500" /> Hotkeys & Navigation
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Standard operational shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-1.5 text-xs">
                {[
                  { keys: ["G", "D"], desc: "Navigate to Dashboard" },
                  { keys: ["G", "T"], desc: "Navigate to Tasks" },
                  { keys: ["G", "R"], desc: "Navigate to Reports" },
                  { keys: ["G", "S"], desc: "Navigate to Settings" },
                  { keys: ["Ctrl", "K"], desc: "Focus Global Search" },
                ].map(({ keys, desc }) => (
                  <div key={desc} className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50/40 px-3 py-2">
                    <span className="text-slate-600">{desc}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd key={k} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 shadow-2xs">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── DANGER ZONE ── */}
      {tab === "danger" && (
        <Card className="border border-rose-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/50">
            <CardTitle className="text-sm font-semibold text-rose-800 flex items-center gap-1.5">
              <Trash2 size={14} /> Reset Platform Ledger
            </CardTitle>
            <CardDescription className="text-xs text-rose-600">
              Purge all tasks, escrow transactions, verifications, and reputation scores to start from zero.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 leading-relaxed">
              ⚠️ Warning: This action will truncate all records from the database across client-agent, worker-agent, verifier-agent, and escrow-service.
            </div>
            <Button
              onClick={handleReset}
              disabled={resetting}
              variant="destructive"
              size="sm"
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {resetting ? (
                <>Resetting Database…</>
              ) : (
                <><Trash2 size={13} className="mr-1" /> Reset All Platform Data</>
              )}
            </Button>
            {resetMessage && <p className="text-xs font-medium text-slate-700">{resetMessage}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Settings;
