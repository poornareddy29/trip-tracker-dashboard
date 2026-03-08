import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function Expenses() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" /> Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Expenses table not yet available. Create the <code className="rounded bg-muted px-1 text-xs">expenses</code> table to enable this module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
