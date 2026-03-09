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

interface Rate {
  id: string; name: string; rate: number; unit: string; description: string | null; created_at: string;
}

export default function RateMaster() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", rate: "", unit: "per_km", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("rate_master").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("rate_master").insert({
      name: form.name, rate: parseFloat(form.rate) || 0, unit: form.unit,
      description: form.description || null, company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Rate added" }); setForm({ name: "", rate: "", unit: "per_km", description: "" }); setDialogOpen(false); fetchRows(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rate_master").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rate Master</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRows}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Rate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Rate</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Rate</Label><Input type="number" step="0.01" required value={form.rate} onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Unit</Label><Input required value={form.unit} placeholder="per_km, per_trip, etc." onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">No rates found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Rate</TableHead><TableHead>Unit</TableHead><TableHead>Description</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>₹{r.rate.toLocaleString()}</TableCell>
                      <TableCell>{r.unit}</TableCell>
                      <TableCell>{r.description ?? "—"}</TableCell>
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
