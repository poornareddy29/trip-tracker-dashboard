import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

interface Vendor {
  id: string; name: string; phone: string | null; email: string | null;
  address: string | null; service_type: string | null; created_at: string;
}

export default function Vendors() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", service_type: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("vendors").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("vendors").insert({
      name: form.name, phone: form.phone || null, email: form.email || null,
      address: form.address || null, service_type: form.service_type || null, company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Vendor added" }); setForm({ name: "", phone: "", email: "", address: "", service_type: "" }); setDialogOpen(false); fetchRows(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendors</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRows}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Vendor</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Vendor</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Service Type</Label><Input value={form.service_type} placeholder="e.g. Maintenance, Fuel" onChange={(e) => setForm(f => ({ ...f, service_type: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">No vendors found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Service Type</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.email ?? "—"}</TableCell>
                      <TableCell>{r.phone ?? "—"}</TableCell>
                      <TableCell>{r.service_type ?? "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
