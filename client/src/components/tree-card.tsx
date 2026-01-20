import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface TreeProps {
  tree: {
    id: number;
    type: string;
    plantedAt: string;
    location: string;
    image: string;
    status: string;
    updates: number;
  };
  showActions?: boolean;
}

export function TreeCard({ tree, showActions = false }: TreeProps) {
  const statusColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-700 border-green-200",
    needs_attention: "bg-orange-100 text-orange-700 border-orange-200",
    issue_reported: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    healthy: "Healthy",
    needs_attention: "Needs Attention",
    issue_reported: "Issue Reported",
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={tree.image} 
          alt={tree.type} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={statusColors[tree.status] || "bg-gray-100"}>
            {statusLabels[tree.status] || tree.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="font-heading font-semibold text-lg">{tree.type}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Planted: {format(new Date(tree.plantedAt), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="truncate">{tree.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>{tree.updates} Monthly Updates</span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">Details</Button>
          <Button size="sm" className="flex-1">Add Update</Button>
        </CardFooter>
      )}
    </Card>
  );
}
