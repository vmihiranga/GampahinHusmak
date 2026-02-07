import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Activity, Tag, ChevronLeft, ChevronRight, TreePine, Heart } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { galleryAPI } from "@/lib/api";
import { GalleryResponse } from "@/lib/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Gallery() {
  const { t, language } = useLanguage();
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const limit = 30;
  
  // Fetch gallery items from API
  const { data: galleryData, isLoading } = useQuery<GalleryResponse>({
    queryKey: ['gallery', page],
    queryFn: () => galleryAPI.getAll({ page, limit }),
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: (id: string) => galleryAPI.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ 'gallery' ] });
    },
    onError: (error: any) => {
      toast({
        title: t.gallery.like_toast_title,
        description: t.gallery.like_toast_desc,
        variant: "destructive"
      });
    }
  });

  const items = galleryData?.items || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">{t.gallery.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.gallery.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">{t.gallery.loading}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">{t.gallery.no_items}</p>
            </div>
          ) : (
            items.map((item: any) => {
              const currentIndex = activeIndices[item._id] || 0;

              return (
                <Dialog key={item._id}>
                  <DialogTrigger asChild>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-none bg-card/50 backdrop-blur-sm shadow-lg">
                      <div className="relative h-80 overflow-hidden">
                        <img 
                          src={item.images[0]} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 transition-all duration-500">
                          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-white font-heading font-bold text-xl leading-snug drop-shadow-lg">{item.title}</p>
                            <div className="flex items-center justify-between mt-2">
                               <p className="text-white/80 text-xs flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {format(new Date(item.createdAt), "MMM d, yyyy")}
                              </p>
                              {item.relatedTree && (
                                <Badge className="bg-primary/20 hover:bg-primary/30 text-white border-white/20 text-[10px] backdrop-blur-md">
                                  <TreePine className="w-3 h-3 mr-1" />
                                  {t.gallery.tree_record}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto md:overflow-hidden p-0 border-none bg-background/95 backdrop-blur-md">
                    <div className="grid grid-cols-1 md:grid-cols-5 h-auto md:h-[500px]">
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
                              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full z-10"
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
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full z-10"
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
                       <div className="md:col-span-2 flex flex-col h-[500px] md:h-auto bg-card">
                        <ScrollArea className="flex-1">
                          <div className="p-8 space-y-6">
                            <DialogHeader>
                          <div className="flex items-center gap-2 text-primary mb-2">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">{t.nav.gallery}</span>
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
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{t.gallery.uploaded}</p>
                              <p className="font-semibold">{format(new Date(item.createdAt), "MMMM d, yyyy")}</p>
                            </div>
                          </div>

                          {item.uploadedBy && (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Activity className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{t.gallery.uploaded_by}</p>
                                <p className="font-semibold">
                                  {typeof item.uploadedBy === 'object' 
                                    ? (item.uploadedBy.fullName || item.uploadedBy.username) 
                                    : (language === 'en' ? 'District Member' : 'දිස්ත්‍රික් සාමාජිකයෙක්')}
                                </p>
                              </div>
                            </div>
                          )}



                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 max-h-24 overflow-y-auto custom-scrollbar">
                              {item.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                  {t.gallery.image_counter} {currentIndex + 1} {t.gallery.of} {item.images.length}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  likeMutation.mutate(item._id);
                                }}
                                disabled={likeMutation.isPending}
                              >
                                <Heart className={cn("w-4 h-4", item.likes?.length > 0 && "fill-primary")} />
                                <span className="text-xs font-bold">{item.likes?.length || 0}</span>
                              </Button>
                            </div>
                          </div>
                            </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {galleryData?.pagination && galleryData.pagination.totalPages > 1 && (
          <div className="pt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if (page > 1) { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(galleryData.pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (galleryData.pagination!.totalPages > 7) {
                    if (pageNum === 1 || pageNum === galleryData.pagination!.totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            isActive={page === pageNum}
                            onClick={(e) => { e.preventDefault(); setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (pageNum === 2 || pageNum === galleryData.pagination!.totalPages - 1) {
                      return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                    }
                    return null;
                  }
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={page === pageNum}
                        onClick={(e) => { e.preventDefault(); setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if (page < galleryData.pagination!.totalPages) { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}}
                    className={page >= galleryData.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
}

