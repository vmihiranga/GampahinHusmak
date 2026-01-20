import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TREES } from "@/lib/mockData";
import { Calendar, MapPin, Activity, Tag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Gallery() {
  const statusColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-700 border-green-200",
    needs_attention: "bg-orange-100 text-orange-700 border-orange-200",
    issue_reported: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Community Tree Gallery</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the planted trees across Gampaha District and track their latest growth updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TREES.map((tree) => (
            <Dialog key={tree.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-none bg-card/50 backdrop-blur-sm">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={tree.image} 
                      alt={tree.type} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-white font-heading font-bold text-xl">{tree.type}</p>
                      <p className="text-white/80 text-sm flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Latest Update: {format(new Date(tree.plantedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className={statusColors[tree.status]}>
                        {tree.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl overflow-hidden p-0 border-none bg-background/95 backdrop-blur-md">
                <div className="grid md:grid-cols-2">
                  <div className="h-[300px] md:h-full">
                    <img 
                      src={tree.image} 
                      alt={tree.type} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 space-y-6">
                    <DialogHeader>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Tree Profile</span>
                      </div>
                      <DialogTitle className="text-3xl font-heading font-bold leading-tight">{tree.type}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Planted Date</p>
                          <p className="font-semibold">{format(new Date(tree.plantedAt), "MMMM d, yyyy")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Location</p>
                          <p className="font-semibold">{tree.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Growth Status</p>
                          <Badge className={statusColors[tree.status]}>
                            {tree.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Latest Update Info</p>
                        <p className="text-sm italic text-foreground">"The tree is growing well, showing healthy new leaf formation and strong stem growth."</p>
                        <p className="text-[10px] text-muted-foreground mt-2">Verified on {format(new Date(), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </Layout>
  );
}
