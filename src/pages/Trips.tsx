import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function Trips() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" /> Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Trips table not yet available. Create the <code className="rounded bg-muted px-1 text-xs">trips</code> table to enable this module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
