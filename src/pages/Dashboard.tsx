import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Car } from "lucide-react";

export default function Dashboard() {
  const { companyId } = useAuth();
  const [counts, setCounts] = useState({ customers: 0, drivers: 0, vehicles: 0 });

  useEffect(() => {
    if (!companyId) return;
    Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("drivers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    ]).then(([c, d, v]) => {
      setCounts({
        customers: c.count ?? 0,
        drivers: d.count ?? 0,
        vehicles: v.count ?? 0,
      });
    });
  }, [companyId]);

  const stats = [
    { label: "Customers", value: counts.customers, icon: Users },
    { label: "Drivers", value: counts.drivers, icon: UserCheck },
    { label: "Vehicles", value: counts.vehicles, icon: Car },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your transport operations</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
