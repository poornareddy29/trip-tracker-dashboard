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

interface TripExpense {
  id: string; trip_id: string | null; description: string; amount: number;
  category: string | null; expense_date: string; created_at: string;
}

export default function TripExpenses() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", category: "", expense_date: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("trip_expenses").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("trip_expenses").insert({
      description: form.description, amount: parseFloat(form.amount) || 0,
      category: form.category || null, expense_date: form.expense_date || new Date().toISOString(),
      company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Expense added" }); setForm({ description: "", amount: "", category: "", expense_date: "" }); setDialogOpen(false); fetchRows(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trip_expenses").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trip Expenses</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRows}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Trip Expense</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Description</Label><Input required value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Category</Label><Input value={form.category} placeholder="e.g. Fuel, Toll, Food" onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Expense Date</Label><Input type="datetime-local" value={form.expense_date} onChange={(e) => setForm(f => ({ ...f, expense_date: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">No expenses found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.description}</TableCell>
                      <TableCell>₹{r.amount.toLocaleString()}</TableCell>
                      <TableCell>{r.category ?? "—"}</TableCell>
                      <TableCell className="text-sm">{new Date(r.expense_date).toLocaleDateString()}</TableCell>
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
