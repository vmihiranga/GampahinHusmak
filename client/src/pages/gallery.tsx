import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Activity, Tag, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { galleryAPI } from "@/lib/api";

export default function Gallery() {
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  
  // Fetch gallery items from API
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryAPI.getAll(),
  });

  const items = galleryData?.items || [];

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
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No gallery items yet. Start planting trees!</p>
            </div>
          ) : (
            items.map((item: any) => {
              const currentIndex = activeIndices[item._id] || 0;

            return (
              <Dialog key={item._id}>
                <DialogTrigger asChild>
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-none bg-card/50 backdrop-blur-sm">
                    <div className="relative h-72 overflow-hidden">
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <p className="text-white font-heading font-bold text-xl">{item.title}</p>
                        <p className="text-white/80 text-sm flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-white/90 text-foreground">
                          <Heart className="w-3 h-3 mr-1" />
                          {item.likes?.length || 0}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl overflow-hidden p-0 border-none bg-background/95 backdrop-blur-md">
                  <div className="grid md:grid-cols-5 h-[600px] md:h-[500px]">
                    <div className="md:col-span-3 relative bg-black group/slider">
                      <img 
                        src={item.images[currentIndex]} 
                        alt={item.title} 
                        className="w-full h-full object-contain transition-all duration-500"
                      />
                      
                      {item.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveIndices(prev => ({
                                ...prev,
                                [item._id]: ((prev[item._id] || 0) - 1 + item.images.length) % item.images.length
                              }));
                            }}
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveIndices(prev => ({
                                ...prev,
                                [item._id]: ((prev[item._id] || 0) + 1) % item.images.length
                              }));
                            }}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {item.images.map((_: any, idx: number) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all",
                                  idx === currentIndex ? "bg-white w-4" : "bg-white/40"
                                )}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="md:col-span-2 p-8 space-y-6 overflow-y-auto bg-card">
                      <DialogHeader>
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <Tag className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Gallery</span>
                        </div>
                        <DialogTitle className="text-2xl font-heading font-bold leading-tight">{item.title}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 pt-4 border-t border-border">
                        {item.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Uploaded</p>
                            <p className="font-semibold">{format(new Date(item.createdAt), "MMMM d, yyyy")}</p>
                          </div>
                        </div>

                        {item.uploadedBy && (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Activity className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Uploaded By</p>
                              <p className="font-semibold">{item.uploadedBy.fullName || item.uploadedBy.username}</p>
                            </div>
                          </div>
                        )}

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.tags.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6">
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                          <p className="text-xs font-bold text-primary uppercase mb-2 tracking-widest">Image {currentIndex + 1} of {item.images.length}</p>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            {item.likes?.length || 0} likes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })
        )}
        </div>
      </div>
    </Layout>
  );
}

