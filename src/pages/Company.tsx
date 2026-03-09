import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";

interface Company {
  id: string; name: string; address: string | null; phone: string | null; email: string | null;
}

export default function Company() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCompany = async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else if (data) {
      setCompany(data);
      setForm({ name: data.name, address: data.address ?? "", phone: data.phone ?? "", email: data.email ?? "" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchCompany(); }, [companyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      name: form.name, address: form.address || null, phone: form.phone || null, email: form.email || null,
    }).eq("id", companyId);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Company updated" });
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading…</p>;
  if (!company) return <p className="py-8 text-center text-muted-foreground">No company linked to your profile.</p>;

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Details</CardTitle>
          <Button variant="outline" size="icon" onClick={fetchCompany}><RefreshCw className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <Button type="submit" disabled={saving}><Save className="mr-1 h-4 w-4" />{saving ? "Saving…" : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
