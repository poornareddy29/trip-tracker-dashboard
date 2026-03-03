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
import { LogOut, Plus, Truck, Car, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  capacity: number;
  is_available: boolean;
  company_id: string;
  created_at: string;
}

export default function Vehicles() {
  const { user, companyId, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ plate_number: "", model: "", capacity: "1" });
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    if (!companyId) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching vehicles", description: error.message, variant: "destructive" });
    } else {
      setVehicles(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast({ title: "No company linked", description: "Your profile has no company_id.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("vehicles").insert({
      plate_number: form.plate_number,
      model: form.model,
      capacity: parseInt(form.capacity, 10) || 1,
      is_available: true,
      company_id: companyId,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error adding vehicle", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vehicle added" });
      setForm({ plate_number: "", model: "", capacity: "1" });
      setDialogOpen(false);
      fetchVehicles();
    }
  };

  const toggleAvailable = async (vehicle: Vehicle) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ is_available: !vehicle.is_available })
      .eq("id", vehicle.id);
    if (error) {
      toast({ title: "Error updating vehicle", description: error.message, variant: "destructive" });
    } else {
      fetchVehicles();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Back to Dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Vehicles</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{vehicles.filter(v => v.is_available).length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vehicles</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchVehicles} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Vehicle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>The vehicle will be linked to your company automatically.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="veh-plate">Plate Number</Label>
                      <Input id="veh-plate" required value={form.plate_number} onChange={(e) => setForm(f => ({ ...f, plate_number: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="veh-model">Model</Label>
                      <Input id="veh-model" required value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="veh-capacity">Capacity</Label>
                      <Input id="veh-capacity" type="number" min="1" required value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add Vehicle"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading…</p>
            ) : vehicles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No vehicles found.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.plate_number}</TableCell>
                        <TableCell>{v.model}</TableCell>
                        <TableCell>{v.capacity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={v.is_available} onCheckedChange={() => toggleAvailable(v)} />
                            <Badge variant={v.is_available ? "default" : "secondary"}>
                              {v.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(v.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
