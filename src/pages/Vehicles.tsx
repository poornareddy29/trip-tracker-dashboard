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

interface Vehicle {
  id: string; plate_number: string; model: string; capacity: number;
  is_available: boolean; company_id: string; created_at: string;
}

export default function Vehicles() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ plate_number: "", model: "", capacity: "1" });
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    if (!companyId) { setVehicles([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("vehicles").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setVehicles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("vehicles").insert({
      plate_number: form.plate_number, model: form.model,
      capacity: parseInt(form.capacity, 10) || 1, is_available: true, company_id: companyId,
    });
    setSubmitting(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Vehicle added" }); setForm({ plate_number: "", model: "", capacity: "1" }); setDialogOpen(false); fetchVehicles(); }
  };

  const toggleAvailable = async (v: Vehicle) => {
    const { error } = await supabase.from("vehicles").update({ is_available: !v.is_available }).eq("id", v.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchVehicles();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vehicles</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchVehicles}><RefreshCw className="h-4 w-4" /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Vehicle</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Vehicle</DialogTitle><DialogDescription>Linked to your company automatically.</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2"><Label>Plate Number</Label><Input required value={form.plate_number} onChange={(e) => setForm(f => ({ ...f, plate_number: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Model</Label><Input required value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Capacity</Label><Input type="number" min="1" required value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
                  <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted-foreground">Loading…</p> : vehicles.length === 0 ? <p className="py-8 text-center text-muted-foreground">No vehicles found.</p> : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Plate</TableHead><TableHead>Model</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.plate_number}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell>{v.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={v.is_available} onCheckedChange={() => toggleAvailable(v)} />
                          <Badge variant={v.is_available ? "default" : "secondary"}>{v.is_available ? "Available" : "Unavailable"}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</TableCell>
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
