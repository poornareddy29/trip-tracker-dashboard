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

interface Payment {
  id: string; invoice_id: string | null; amount: number; payment_date: string;
  payment_method: string | null; reference_number: string | null; notes: string | null; created_at: string;
}

export default function Payments() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", payment_method: "", reference_number: "", notes: "", payment_date: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("payment_table").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("payment_table").insert({
      amount: parseFloat(form.amount) || 0, payment_method: form.payment_method || null,
      reference_number: form.reference_number || null, notes: form.notes || null,
      payment_date: form.payment_date || new Date().toISOString(), company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment added" }); setForm({ amount: "", payment_method: "", reference_number: "", notes: "", payment_date: "" }); setDialogOpen(false); fetchRows(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("payment_table").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRows}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Payment</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Payment</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Payment Method</Label><Input value={form.payment_method} placeholder="Cash, Bank, UPI" onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Reference #</Label><Input value={form.reference_number} onChange={(e) => setForm(f => ({ ...f, reference_number: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Payment Date</Label><Input type="datetime-local" value={form.payment_date} onChange={(e) => setForm(f => ({ ...f, payment_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">No payments found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">₹{r.amount.toLocaleString()}</TableCell>
                      <TableCell>{r.payment_method ?? "—"}</TableCell>
                      <TableCell>{r.reference_number ?? "—"}</TableCell>
                      <TableCell className="text-sm">{new Date(r.payment_date).toLocaleDateString()}</TableCell>
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
