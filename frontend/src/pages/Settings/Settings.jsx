import { useEffect, useState } from "react";
import {
  Bell, Database, LayoutGrid, Moon, Save,
  ShieldAlert, Sun, Trash2, Webhook, Eye, EyeOff, Copy, Check,
  Accessibility, Type, Keyboard, Clock, Activity, Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import PageHeader from "../../components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { resetPlatform } from "../../services/taskService";

const TABS = [
  { id: "general",       label: "General",       icon: LayoutGrid    },
  { id: "notifications", label: "Notifications", icon: Bell          },
  { id: "platform",      label: "Platform",      icon: Database      },
  { id: "security",      label: "Security",      icon: ShieldAlert   },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "danger",        label: "Danger Zone",   icon: Trash2        },
];

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 p-4 transition-all hover:bg-muted/25 hover:border-primary/20">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}

function CopyableKey({ label, value, masked = true }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
        <code className="flex-1 truncate font-mono text-xs text-foreground">
          {masked && !show ? value.replace(/./g, "•").slice(0, 32) + "••••" : value}
        </code>
        {masked && (
          <button onClick={() => setShow(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        <button onClick={copy} className="text-muted-foreground hover:text-primary transition-colors">
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

function Settings() {
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences } = useProfile();
  const [tab, setTab] = useState("general");
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

  const tabBtnStyle = (id) =>
    tab === id
      ? { background: "linear-gradient(135deg, oklch(0.55 0.25 264), oklch(0.52 0.22 290))", color: "white", boxShadow: "0 4px 12px oklch(0.55 0.25 264 / 30%)" }
      : {};

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Workspace preferences, notifications, security, platform controls, and data management." />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${tab === item.id ? "border-transparent" : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
              style={tabBtnStyle(item.id)}
            >
              <Icon size={13} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how the dashboard looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {[
                  { val: "light", icon: Sun, label: "Light" },
                  { val: "dark",  icon: Moon, label: "Dark"  },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${theme === val ? "border-transparent text-white" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
                    style={theme === val ? { background: "linear-gradient(135deg, oklch(0.55 0.25 264), oklch(0.52 0.22 290))", boxShadow: "0 4px 12px oklch(0.55 0.25 264 / 30%)" } : {}}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
              <ToggleRow label="Compact tables" description="Denser row spacing on data tables." checked={form.compactTables} onChange={(v) => setForm({ ...form, compactTables: v })} />
              <ToggleRow label="Auto refresh dashboard" description="Refresh KPIs every 30 seconds." checked={form.autoRefresh} onChange={(v) => setForm({ ...form, autoRefresh: v })} />
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Customize your control center label.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Workspace name</label>
                <Input className="rounded-xl" value={form.workspaceName} onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} placeholder="Trust A2A Control Center" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Default currency</label>
                <select
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
                  value={form.currency || "USD"}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 264), oklch(0.52 0.22 290))", boxShadow: "0 4px 12px oklch(0.55 0.25 264 / 30%)" }}
              >
                <Save size={14} />
                {saved ? "Saved ✓" : "Save Preferences"}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === "notifications" && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure alerts for task, escrow, and verification events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow label="Email alerts" description="Receive critical platform alerts by email." checked={form.emailAlerts} onChange={(v) => setForm({ ...form, emailAlerts: v })} />
            <ToggleRow label="Task lifecycle updates" description="Notify when tasks move through stages." checked={form.taskUpdates} onChange={(v) => setForm({ ...form, taskUpdates: v })} />
            <ToggleRow label="Escrow settlement alerts" description="Notify on fund lock, release, and blocked payments." checked={form.escrowAlerts} onChange={(v) => setForm({ ...form, escrowAlerts: v })} />
            <ToggleRow label="Verification failures" description="Immediate alert when a task fails verification." checked={form.verifyAlerts ?? true} onChange={(v) => setForm({ ...form, verifyAlerts: v })} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Alert email</label>
                <Input type="email" className="rounded-xl" value={form.alertEmail} onChange={(e) => setForm({ ...form, alertEmail: e.target.value })} placeholder="ops@trusta2a.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Webhook URL</label>
                <div className="relative">
                  <Webhook size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 rounded-xl" value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://hooks.example.com/events" />
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 264), oklch(0.52 0.22 290))", boxShadow: "0 4px 12px oklch(0.55 0.25 264 / 30%)" }}>
              <Save size={14} />
              {saved ? "Saved ✓" : "Save Notifications"}
            </button>
          </CardContent>
        </Card>
      )}

      {/* ── PLATFORM ── */}
      {tab === "platform" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Service Endpoints</CardTitle>
              <CardDescription>Connected microservices for the Trust A2A pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Client Agent",   url: "http://localhost:8000", color: "oklch(0.65 0.25 264)" },
                { name: "Worker Agent",   url: "http://localhost:8001", color: "oklch(0.65 0.2 195)"  },
                { name: "Verifier Agent", url: "http://localhost:8002", color: "oklch(0.65 0.18 150)" },
                { name: "Escrow Service", url: "http://localhost:8003", color: "oklch(0.7 0.2 310)"   },
              ].map(({ name, url, color }) => (
                <div key={name} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">{url}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>Runtime environment information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Dashboard version", value: <Badge>v2.0</Badge> },
                { label: "Pipeline mode",     value: <Badge variant="outline">Lock → Execute → Release</Badge> },
                { label: "Table density",     value: <span>{preferences.compactTables ? "Compact" : "Comfortable"}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
                  <span className="text-muted-foreground">{label}</span>
                  {value}
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2.5">
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Agents
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Operational</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock size={16} /> Session Security</CardTitle>
              <CardDescription>Control authentication and session behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Two-Factor Authentication" description="Add an extra layer of security (UI preview)." checked={twoFA} onChange={setTwoFA} />
              <ToggleRow label="Login alerts" description="Receive an email on new sign-in." checked={loginAlerts} onChange={setLoginAlerts} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2"><Clock size={13} /> Session timeout</label>
                <select
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 264), oklch(0.52 0.22 290))", boxShadow: "0 4px 12px oklch(0.55 0.25 264 / 30%)" }}>
                <Save size={14} />
                Save Security Settings
              </button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity size={16} /> Recent Activity</CardTitle>
              <CardDescription>Last sign-in events for your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { event: "Login via Email",  time: "Just now",   device: "Windows · Chrome",  status: "success" },
                { event: "Login via Email",  time: "2 days ago", device: "Windows · Chrome",  status: "success" },
                { event: "Failed attempt",   time: "5 days ago", device: "Unknown",            status: "error"   },
              ].map((log, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl border border-border/50 px-3 py-2.5 text-sm hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="font-medium">{log.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.device}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold ${log.status === "success" ? "text-emerald-500" : "text-destructive"}`}>
                      {log.status === "success" ? "✓ Success" : "✗ Failed"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}



      {/* ── ACCESSIBILITY ── */}
      {tab === "accessibility" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Type size={16} /> Display</CardTitle>
              <CardDescription>Adjust visual display for comfort and readability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Font size: {fontSize}%</label>
                <input
                  type="range"
                  min={80}
                  max={130}
                  step={5}
                  value={fontSize}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFontSize(v);
                    document.documentElement.style.fontSize = `${v}%`;
                  }}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small (80%)</span><span>Default (100%)</span><span>Large (130%)</span>
                </div>
              </div>
              <ToggleRow label="Reduce motion" description="Disable animations for accessibility." checked={reducedMotion} onChange={(v) => { setReducedMotion(v); document.documentElement.classList.toggle("reduce-motion", v); }} />
              <ToggleRow label="High contrast mode" description="Increase text/background contrast." checked={highContrast} onChange={setHighContrast} />
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Keyboard size={16} /> Keyboard Shortcuts</CardTitle>
              <CardDescription>Available keyboard shortcuts in the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { keys: ["G", "D"], desc: "Go to Dashboard" },
                  { keys: ["G", "T"], desc: "Go to Tasks"     },
                  { keys: ["G", "R"], desc: "Go to Reports"   },
                  { keys: ["G", "S"], desc: "Go to Settings"  },
                  { keys: ["Ctrl", "K"], desc: "Open search"  },
                  { keys: ["Ctrl", "/"], desc: "Show shortcuts" },
                ].map(({ keys, desc }) => (
                  <div key={desc} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{desc}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd key={k} className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">{k}</kbd>
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
        <Card className="glass-panel border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2"><Trash2 size={16} /> Reset Platform Data</CardTitle>
            <CardDescription>Clear all tasks, escrow transactions, verifications, and reputation to start from zero. This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive/80">
              ⚠ This will permanently delete all tasks, transactions, verifications, and reputation data from the database.
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "oklch(0.58 0.24 27)", boxShadow: "0 4px 12px oklch(0.58 0.24 27 / 30%)" }}
            >
              {resetting ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Resetting…</>
              ) : (
                <><Trash2 size={14} />Reset All Data</>
              )}
            </button>
            {resetMessage && <p className="text-sm text-muted-foreground">{resetMessage}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Settings;
