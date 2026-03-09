import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

interface Trip {
  id: string; origin: string; destination: string; driver_id: string | null;
  vehicle_id: string | null; customer_id: string | null; status: string;
  departure_date: string | null; arrival_date: string | null; notes: string | null; created_at: string;
}

const STATUSES = ["pending", "in_progress", "completed", "cancelled"];

export default function Trips() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", status: "pending", departure_date: "", arrival_date: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    if (!companyId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("trips").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("trips").insert({
      origin: form.origin, destination: form.destination, status: form.status,
      departure_date: form.departure_date || null, arrival_date: form.arrival_date || null,
      notes: form.notes || null, company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Trip added" }); setForm({ origin: "", destination: "", status: "pending", departure_date: "", arrival_date: "", notes: "" }); setDialogOpen(false); fetchRows(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("trips").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchRows();
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "default";
    if (s === "in_progress") return "secondary";
    if (s === "cancelled") return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trips</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRows}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Trip</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Trip</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Origin</Label><Input required value={form.origin} onChange={(e) => setForm(f => ({ ...f, origin: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Destination</Label><Input required value={form.destination} onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Departure Date</Label><Input type="datetime-local" value={form.departure_date} onChange={(e) => setForm(f => ({ ...f, departure_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Arrival Date</Label><Input type="datetime-local" value={form.arrival_date} onChange={(e) => setForm(f => ({ ...f, arrival_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="py-8 text-center text-muted-foreground">No trips found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Origin</TableHead><TableHead>Destination</TableHead><TableHead>Status</TableHead><TableHead>Departure</TableHead><TableHead>Arrival</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.origin}</TableCell>
                      <TableCell>{r.destination}</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">{r.departure_date ? new Date(r.departure_date).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-sm">{r.arrival_date ? new Date(r.arrival_date).toLocaleString() : "—"}</TableCell>
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
