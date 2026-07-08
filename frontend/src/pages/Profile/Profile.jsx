import { useEffect, useState } from "react";
import { Building2, LogOut, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/shared/PageHeader";

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
    updateProfile({ ...form, avatarInitials: initials || "AT" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your operator identity and workspace presence across the Trust A2A dashboard."
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="glass-panel h-fit">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="h-24 w-24 text-lg ring-2 ring-primary/15">
              {form.picture ? <AvatarImage src={form.picture} alt={form.name} className="object-cover" /> : null}
              <AvatarFallback>{form.avatarInitials || "AT"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{form.name}</h2>
              <p className="text-sm text-muted-foreground">{form.role}</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <ShieldCheck size={12} />
              {user?.provider === "google" ? "Google Verified" : "Verified Operator"}
            </Badge>
            <p className="text-sm leading-relaxed text-muted-foreground">{form.bio}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your display information used in the navbar and workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <UserRound size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>
                <div className="relative">
                  <Building2 size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button type="submit">
                  <Save size={14} />
                  {saved ? "Saved" : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut size={14} />
                  Logout
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
