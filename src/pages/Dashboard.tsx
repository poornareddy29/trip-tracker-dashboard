import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Car, MapPin, FileText, Receipt, Package, Store, UserCog, Route, CreditCard, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { companyId } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!companyId) return;
    const tables = [
      { key: "customers", table: "customers" },
      { key: "drivers", table: "drivers" },
      { key: "vehicles", table: "vehicles" },
      { key: "employees", table: "employee" },
      { key: "trips", table: "trips" },
      { key: "routes", table: "routes" },
      { key: "invoices", table: "invoices" },
      { key: "expenses", table: "trip_expenses" },
      { key: "suppliers", table: "suppliers" },
      { key: "vendors", table: "vendors" },
      { key: "payments", table: "payment_table" },
      { key: "rates", table: "rate_master" },
    ];
    Promise.all(
      tables.map(({ key, table }) =>
        supabase.from(table).select("id", { count: "exact", head: true }).eq("company_id", companyId)
          .then(({ count }) => ({ key, count: count ?? 0 }))
      )
    ).then((results) => {
      const c: Record<string, number> = {};
      results.forEach((r) => (c[r.key] = r.count));
      setCounts(c);
    });
  }, [companyId]);

  const stats = [
    { label: "Customers", value: counts.customers ?? 0, icon: Users },
    { label: "Drivers", value: counts.drivers ?? 0, icon: UserCheck },
    { label: "Vehicles", value: counts.vehicles ?? 0, icon: Car },
    { label: "Employees", value: counts.employees ?? 0, icon: UserCog },
    { label: "Trips", value: counts.trips ?? 0, icon: MapPin },
    { label: "Routes", value: counts.routes ?? 0, icon: Route },
    { label: "Invoices", value: counts.invoices ?? 0, icon: FileText },
    { label: "Expenses", value: counts.expenses ?? 0, icon: Receipt },
    { label: "Payments", value: counts.payments ?? 0, icon: CreditCard },
    { label: "Rates", value: counts.rates ?? 0, icon: DollarSign },
    { label: "Suppliers", value: counts.suppliers ?? 0, icon: Package },
    { label: "Vendors", value: counts.vendors ?? 0, icon: Store },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your transport operations</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
