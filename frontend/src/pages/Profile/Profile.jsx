import { useEffect, useState } from "react";
import { Building2, LogOut, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { profile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSave = (e) => {
    e.preventDefault();
    const initials = form.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    updateProfile({ ...form, avatarInitials: initials || "OP" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Operator Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your agent network identity, authority credentials, and organization context.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile Summary Card */}
        <Card className="border border-slate-200 bg-white shadow-xs h-fit">
          <CardContent className="flex flex-col items-center gap-3.5 pt-8 pb-6 text-center">
            <Avatar className="h-24 w-24 text-lg font-bold bg-blue-50 text-blue-700 ring-4 ring-slate-100">
              {form.picture ? <AvatarImage src={form.picture} alt={form.name} className="object-cover" /> : null}
              <AvatarFallback>{form.avatarInitials || "OP"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{form.name}</h2>
              <p className="text-xs font-medium text-slate-500">{form.email}</p>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">{form.role || "Platform Operator"}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={14} />
              {user?.provider === "google" ? "Google Verified Operator" : "Verified Enterprise Operator"}
            </span>
            <p className="text-xs leading-relaxed text-slate-600 px-4 pt-1">{form.bio || "Autonomous multi-agent orchestration manager."}</p>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-semibold text-slate-900">Operator Details</CardTitle>
            <CardDescription className="text-xs text-slate-500">Update your operator display name and communication credentials</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <UserRound size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <Input className="h-9 pl-8 text-xs" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Operational Role</label>
                <Input className="h-9 text-xs" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Organization</label>
                <div className="relative">
                  <Building2 size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <Input className="h-9 pl-8 text-xs" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Contact Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <Input className="h-9 pl-8 text-xs" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Operator Bio</label>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
                <Button type="submit" size="sm" className="h-8 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700">
                  <Save size={13} className="mr-1" />
                  {saved ? "Saved ✓" : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut size={13} className="mr-1" />
                  Log Out
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
