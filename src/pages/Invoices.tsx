import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Invoices() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" /> Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Invoices table not yet available. Create the <code className="rounded bg-muted px-1 text-xs">invoices</code> table to enable this module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
