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
import { LogOut, Plus, Truck, Users, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  is_active: boolean;
  company_id: string;
  created_at: string;
}

export default function Drivers() {
  const { user, companyId, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", license_number: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    if (!companyId) {
      setDrivers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching drivers", description: error.message, variant: "destructive" });
    } else {
      setDrivers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast({ title: "No company linked", description: "Your profile has no company_id.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("drivers").insert({
      ...form,
      is_active: true,
      company_id: companyId,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error adding driver", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Driver added" });
      setForm({ name: "", phone: "", license_number: "" });
      setDialogOpen(false);
      fetchDrivers();
    }
  };

  const toggleActive = async (driver: Driver) => {
    const { error } = await supabase
      .from("drivers")
      .update({ is_active: !driver.is_active })
      .eq("id", driver.id);
    if (error) {
      toast({ title: "Error updating driver", description: error.message, variant: "destructive" });
    } else {
      fetchDrivers();
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
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Drivers</h1>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{drivers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{drivers.filter(d => d.is_active).length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Drivers</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchDrivers} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Driver</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>The driver will be linked to your company automatically.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="drv-name">Name</Label>
                      <Input id="drv-name" required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drv-phone">Phone</Label>
                      <Input id="drv-phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drv-license">License Number</Label>
                      <Input id="drv-license" value={form.license_number} onChange={(e) => setForm(f => ({ ...f, license_number: e.target.value }))} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitting}>{submitting ? "Adding…" : "Add Driver"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading…</p>
            ) : drivers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No drivers found.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{d.phone}</TableCell>
                        <TableCell>{d.license_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} />
                            <Badge variant={d.is_active ? "default" : "secondary"}>
                              {d.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(d.created_at).toLocaleDateString()}
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
