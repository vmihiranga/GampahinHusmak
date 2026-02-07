import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TreeProps {
  tree: {
    _id?: string;
    id?: number;
    type?: string;
    commonName?: string;
    species?: string;
    plantedAt?: string;
    plantedDate?: string;
    location: string | { address: string; coordinates?: number[]; district?: string };
    image?: string;
    images?: string[];
    status?: string;
    currentHealth?: string;
    updates?: number;
  };
  showActions?: boolean;
  onAddUpdate?: () => void;
}
import { useLanguage } from "@/hooks/use-language";

export function TreeCard({ tree, showActions = false, onAddUpdate }: TreeProps) {
  const { getPathWithLang } = useLanguage();
  const statusColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-700 border-green-200",
    needs_attention: "bg-orange-100 text-orange-700 border-orange-200",
    issue_reported: "bg-red-100 text-red-700 border-red-200",
    excellent: "bg-green-100 text-green-700 border-green-200",
    good: "bg-blue-100 text-blue-700 border-blue-200",
    fair: "bg-orange-100 text-orange-700 border-orange-200",
    poor: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    healthy: "Healthy",
    needs_attention: "Needs Attention",
    issue_reported: "Issue Reported",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  };

  const treeImage = tree.images?.[0] || tree.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800";
  const treeName = tree.commonName || tree.type || tree.species || "Unknown Tree";
  const treeStatus = tree.currentHealth || tree.status || "good";
  const plantedDate = tree.plantedDate || tree.plantedAt;
  const locationText = typeof tree.location === 'string' ? tree.location : tree.location?.address || 'Unknown Location';

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={treeImage} 
          alt={treeName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={statusColors[treeStatus] || "bg-gray-100"}>
            {statusLabels[treeStatus] || treeStatus}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="font-heading font-semibold text-lg">{treeName}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Planted: {plantedDate ? format(new Date(plantedDate), "MMM d, yyyy") : "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="truncate">{locationText}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>{tree.updates} Monthly Updates</span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={getPathWithLang(`/trees/${tree._id || tree.id}`)} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Details</Button>
          </Link>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddUpdate) {
                onAddUpdate();
              } else {
                console.log("Add update for tree:", tree._id || tree.id);
              }
            }}
          >
            Add Update
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
