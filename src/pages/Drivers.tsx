import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";

interface Driver {
  id: string; name: string; phone: string; license_number: string;
  is_active: boolean; company_id: string; created_at: string;
}

export default function Drivers() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", license_number: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    if (!companyId) { setDrivers([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("drivers").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setDrivers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("drivers").insert({ ...form, is_active: true, company_id: companyId });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Driver added" }); setForm({ name: "", phone: "", license_number: "" }); setDialogOpen(false); fetchDrivers(); }
  };

  const toggleActive = async (d: Driver) => {
    const { error } = await supabase.from("drivers").update({ is_active: !d.is_active }).eq("id", d.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchDrivers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Drivers</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchDrivers}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Driver</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Driver</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>License Number</Label><Input value={form.license_number} onChange={(e) => setForm(f => ({ ...f, license_number: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : drivers.length === 0 ? <p className="py-8 text-center text-muted-foreground">No drivers found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>License</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                <TableBody>
                  {drivers.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      <TableCell>{d.license_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} />
                          <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
