import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { treesAPI } from "@/lib/api";
import { TreeDetailsResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Activity,
  Ruler,
  Info,
  X,
  TreePine,
  Camera as CameraIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TreeDetails({ params }: { params: { id: string } }) {
  const { t, language, getPathWithLang } = useLanguage();
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [location] = useLocation();
  const isAdminView = location.includes("/admin"); // Not strictly used for routing but can check source
  const searchParams = new URLSearchParams(window.location.search);
  const fromAdmin = searchParams.get("from") === "admin";

  const { data, isLoading, error } = useQuery<TreeDetailsResponse>({
    queryKey: ["tree", params.id],
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
          <h1 className="text-2xl font-bold">{t.tree_details.not_found}</h1>
          <p className="text-muted-foreground">
            {t.tree_details.not_found_desc}
          </p>
          <Button asChild>
            <Link href={getPathWithLang("/dashboard")}>{t.tree_details.back_dashboard}</Link>
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

  const currentStatus = tree.currentHealth || tree.status || "active";

  // Aggregate all images for the slider
  const treeImages = tree.images || [];
  const updateImages = updates?.flatMap((u: any) => u.images || []) || [];
  
  let allImages = [...treeImages, ...updateImages].filter(img => img && img !== "");

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewImageIndex !== null) {
      setPreviewImageIndex((previewImageIndex + 1) % allImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewImageIndex !== null) {
      setPreviewImageIndex((previewImageIndex - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <>
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-3 text-muted-foreground hover:text-primary"
            >
              <Link href={getPathWithLang(fromAdmin ? "/admin" : "/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {fromAdmin ? t.tree_details.back_admin : t.tree_details.back_dashboard}
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-heading font-bold">
                    {tree.commonName}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={statusColors[currentStatus]}
                  >
                    {currentStatus.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground italic">
                  {tree.species}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image */}
              <div
                className="rounded-2xl overflow-hidden aspect-video bg-muted relative shadow-md cursor-pointer group flex items-center justify-center"
                onClick={() => allImages.length > 0 && setPreviewImageIndex(0)}
              >
                {allImages.length > 0 ? (
                  <>
                    <img
                      src={allImages[0]}
                      alt={tree.commonName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white flex items-center gap-2">
                        <CameraIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{t.tree_details.view_gallery} ({allImages.length})</span>
                      </div>
                    </div>
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                        1 / {allImages.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                    <TreePine className="w-20 h-20" />
                    <p className="text-sm font-bold uppercase tracking-widest leading-none">{language === 'si' ? 'රූප සටහන් කිසිවක් නොමැත' : 'No photos recorded'}</p>
                  </div>
                )}
              </div>

              {/* Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t.tree_details.planted_date}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {format(new Date(tree.plantedDate), "MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(tree.plantedDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      {t.tree_details.days_ago}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t.tree_details.location}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium line-clamp-2">
                      {tree.location.address}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {tree.location.coordinates && (
                        <p className="text-xs text-muted-foreground">
                          {tree.location.coordinates[1].toFixed(6)},{" "}
                          {tree.location.coordinates[0].toFixed(6)}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${tree.location.coordinates[1]},${tree.location.coordinates[0]}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3" />
                        Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {tree.currentHeight && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        {t.tree_details.height}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {tree.currentHeight} cm
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {t.tree_details.tree_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-sm">{tree.treeId}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t.tree_details.planted_by}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {tree.plantedBy?.fullName ||
                        tree.plantedBy?.username ||
                        t.tree_details.district_member}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tree.plantedBy?.email}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {tree.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.tree_details.planting_notes}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {tree.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Growth Gallery Section */}
              {allImages.length > 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-heading font-bold">{t.tree_details.growth_gallery}</h2>
                    <Badge variant="outline" className="text-xs">{allImages.length} {t.tree_details.photos_count}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border shadow-sm hover:shadow-md transition-all"
                        onClick={() => setPreviewImageIndex(idx)}
                      >
                        <img 
                          src={img} 
                          alt={`Growth step ${idx}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <CameraIcon className="w-6 h-6 text-white" />
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {t.tree_details.planted_tag}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Updates */}
            <div className="space-y-6">
              <Card className="h-full border-primary/10 shadow-lg">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Activity className="w-5 h-5" />
                    <CardTitle>{t.tree_details.growth_timeline}</CardTitle>
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
                              {format(
                                new Date(update.updateDate),
                                "MMM d, yyyy",
                              )}
                            </span>
                            <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {t.tree_details.height}: {update.height}cm
                                </span>
                                <Badge
                                  variant="outline"
                                  className={statusColors[update.health] || ""}
                                >
                                  {update.health}
                                </Badge>
                              </div>
                              {update.notes && (
                                <p className="text-sm text-muted-foreground">
                                  {update.notes}
                                </p>
                              )}
                              {update.images && update.images.length > 0 && (
                                <div
                                  className="mt-2 rounded-lg overflow-hidden h-24 w-full cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    const imgIdx = allImages.indexOf(update.images[0]);
                                    setPreviewImageIndex(imgIdx !== -1 ? imgIdx : 0);
                                  }}
                                >
                                  <img
                                    src={update.images[0]}
                                    alt="Update"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        {t.tree_details.no_updates}
                      </div>
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
                        <div className="text-sm font-medium">{t.tree_details.tree_planted}</div>
                        <p className="text-xs text-muted-foreground">
                          {t.tree_details.initial_record}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>

      {/* Image Preview Dialog / Slider */}
      <Dialog open={previewImageIndex !== null} onOpenChange={(open) => !open && setPreviewImageIndex(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-none h-[85vh]">
          <button
            onClick={() => setPreviewImageIndex(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <ScrollArea className="w-full h-full">
            <div className="relative w-full h-[85vh] flex items-center justify-center group/slider p-4">
              {previewImageIndex !== null && (
                <>
                  <img
                    src={allImages[previewImageIndex]}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />

                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 opacity-0 group-hover/slider:opacity-100 transition-opacity"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                      
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10">
                        {t.tree_details.photo_counter} {previewImageIndex + 1} {t.tree_details.of} {allImages.length}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
