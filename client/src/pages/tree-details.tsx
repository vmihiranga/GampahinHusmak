
import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { treesAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Activity, Ruler, Info } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function TreeDetails({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tree', params.id],
    queryFn: () => treesAPI.getOne(params.id),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Tree Not Found</h1>
          <p className="text-muted-foreground">The tree you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { tree, updates } = data;

  const statusColors: Record<string, string> = {
    healthy: "text-green-600 bg-green-100",
    excellent: "text-green-600 bg-green-100",
    good: "text-blue-600 bg-blue-100",
    fair: "text-orange-600 bg-orange-100",
    poor: "text-red-600 bg-red-100",
    dead: "text-gray-600 bg-gray-100",
    removed: "text-gray-600 bg-gray-100",
    active: "text-green-600 bg-green-100",
  };

  const currentStatus = tree.currentHealth || tree.status || 'active';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-primary">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold">{tree.commonName}</h1>
                <Badge variant="secondary" className={statusColors[currentStatus]}>
                  {(currentStatus).toUpperCase()}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground italic">{tree.species}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden aspect-video bg-muted relative shadow-md">
              <img 
                src={tree.images?.[0] || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200"} 
                alt={tree.commonName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Planted Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{format(new Date(tree.plantedDate), "MMMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((new Date().getTime() - new Date(tree.plantedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium line-clamp-2">{tree.location.address}</p>
                  {tree.location.coordinates && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tree.location.coordinates[1].toFixed(6)}, {tree.location.coordinates[0].toFixed(6)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {tree.currentHeight && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Height
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{tree.currentHeight} cm</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Tree ID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm">{tree.treeId}</p>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {tree.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{tree.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar / Updates */}
          <div className="space-y-6">
            <Card className="h-full border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5" />
                  <CardTitle>Growth Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-8">
                  {updates && updates.length > 0 ? (
                    updates.map((update: any, index: number) => (
                      <div key={update._id || index} className="relative">
                        <div className="absolute -left-[31px] bg-background p-1">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {format(new Date(update.updateDate), "MMM d, yyyy")}
                          </span>
                          <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">height: {update.height}cm</span>
                              <Badge variant="outline" className={statusColors[update.health] || ""}>
                                {update.health}
                              </Badge>
                            </div>
                            {update.notes && (
                              <p className="text-sm text-muted-foreground">{update.notes}</p>
                            )}
                            {update.images && update.images.length > 0 && (
                              <div className="mt-2 rounded-lg overflow-hidden h-24 w-full">
                                <img src={update.images[0]} alt="Update" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No updates recorded yet.</div>
                  )}
                  
                  {/* Initial Planting */}
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-background p-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-1">
                       <span className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-1">
                        {format(new Date(tree.plantedDate), "MMM d, yyyy")}
                      </span>
                      <div className="text-sm font-medium">Tree Planted</div>
                      <p className="text-xs text-muted-foreground">Initial planting record</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
