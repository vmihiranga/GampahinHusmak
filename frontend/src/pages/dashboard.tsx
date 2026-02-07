import Layout from "@/components/layout";
import { TreeCard } from "@/components/tree-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, AlertCircle, MapPin as MapPinIcon, LocateFixed, Loader2, Clock, MessageSquare, CheckCircle2, History, TreePine, Camera, Trophy, Sprout, CloudRain, Droplets, Wind, Thermometer } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treesAPI, authAPI, contactAPI, statsAPI } from "@/lib/api";
import { AuthResponse, TreesResponse, ContactsResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [requestTreeId, setRequestTreeId] = useState("");
  const [requestType, setRequestType] = useState("");
  const [selectedViewContact, setSelectedViewContact] = useState<any>(null);
  const [updateHealth, setUpdateHealth] = useState<string>("good");
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // Fetch user profile
  const { data: userData, isLoading: isUserLoading } = useQuery<AuthResponse>({
    queryKey: ['user-profile'],
    queryFn: () => authAPI.me(),
  });
  const user = userData?.user;

  // Fetch user's trees
  const { data: treesData, isLoading: isTreesLoading } = useQuery<TreesResponse>({
    queryKey: ['user-trees'],
    queryFn: () => treesAPI.getAll(),
    enabled: !!user?.isVerified,
    refetchInterval: 5000, // Near real-time updates every 5s
  });

  // Fetch user's requests/contacts
  const { data: contactsData } = useQuery<ContactsResponse>({
    queryKey: ['my-contacts'],
    queryFn: () => contactAPI.getMyContacts(),
    enabled: !!user,
    refetchInterval: 5000, // Check for new messages every 5s
  });
  const myContacts = contactsData?.contacts || [];

  // Fetch user stats/achievements
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?._id],
    queryFn: () => statsAPI.getUser(user!._id),
    enabled: !!user?._id,
    refetchInterval: 5000, // Update CO2 and Weather alerts every 5s
  });

  const createTreeMutation = useMutation({
    mutationFn: (data: any) => treesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trees'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Tree Added Successfully",
        description: "Your tree has been recorded and is pending verification.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tree",
        variant: "destructive",
      });
    }
  });

  const updateTreeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => treesAPI.addUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trees'] });
      setIsUpdateDialogOpen(false);
      setSelectedTree(null);
      toast({
        title: "Progress Updated",
        description: "Your tree update has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to record update",
        variant: "destructive",
      });
    }
  });

  const trees = treesData?.trees || [];

  // Filter trees based on search query and status filter
  const filteredTrees = trees.filter((tree: any) => {
    const matchesSearch = searchQuery === "" || 
      tree.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      tree.currentHealth === filterStatus || 
      tree.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Automatically trigger location detection when Add Tree dialog opens
  useEffect(() => {
    if (isAddDialogOpen && !coordinates) {
      handleGetLocation();
    }
  }, [isAddDialogOpen]);

  const handleGetLocation = (retryCount = 0) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.display_name || `Lat: ${latitude}, Lon: ${longitude}`;
          
          const locationInput = document.getElementById('location') as HTMLInputElement;
          if (locationInput) locationInput.value = address;
          
          toast({
            title: "Location detected",
            description: "Coordinates and address have been updated successfully.",
          });
        } catch (error) {
          console.error("Geocoding error:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(`Location error (Attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount < 4) {
          toast({
            title: "Location issue",
            description: `Retrying to get GPS coordinates... (Attempt ${retryCount + 1}/5)`,
          });
          
          setTimeout(() => {
            handleGetLocation(retryCount + 1);
          }, 5000);
          return;
        }

        let msg = error.message;
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out after multiple attempts.";
        }
        
        toast({
          title: "Location failed",
          description: msg,
          variant: "destructive",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAddTree = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const imageFile = (document.getElementById('image') as HTMLInputElement).files?.[0];

    if (!imageFile) {
      toast({
        title: "Photo required",
        description: "Please capture or upload a photo of the tree.",
        variant: "destructive",
      });
      return;
    }

    const address = formData.get('location') as string;

    if (!coordinates && (!address || address.trim() === "")) {
      toast({
        title: "Location missing",
        description: "Please provide either GPS coordinates or an address.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        console.log("📤 Starting image upload to ImgBB...");
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        if (!apiKey) {
          throw new Error("ImgBB API Key is missing. Please check your .env file.");
        }

        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgFormData,
        });
        
        const resData = await response.json();
        console.log("📥 ImgBB Response:", resData);

        if (resData.success) {
          imageUrl = resData.data.url;
          console.log("✅ Image uploaded:", imageUrl);
        } else {
          const errorMsg = resData.error?.message || "Unknown upload error";
          throw new Error(`Image upload failed: ${errorMsg}`);
        }
      }

      const treeData = {
        commonName: formData.get('tree-type'),
        species: formData.get('sci-name') || formData.get('tree-type'),
        plantedDate: formData.get('date'),
        location: {
          address: formData.get('location'),
          coordinates: coordinates,
          district: "Gampaha",
        },
        notes: formData.get('notes'),
        images: imageUrl ? [imageUrl] : [],
        status: "active",
      };

      createTreeMutation.mutate(treeData);
    } catch (error: any) {
      console.error("❌ Add Tree Error:", error);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTree) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const imageFile = (document.getElementById('update-image') as HTMLInputElement).files?.[0];

    if (!imageFile) {
      toast({
        title: "Photo required",
        description: "Please capture or upload a current photo of the tree.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        console.log("📤 Starting update image upload to ImgBB...");
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        if (!apiKey) {
          throw new Error("ImgBB API Key is missing.");
        }

        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgFormData,
        });
        
        const resData = await response.json();
        console.log("📥 ImgBB Update Response:", resData);

        if (resData.success) {
          imageUrl = resData.data.url;
        } else {
          throw new Error(`Image upload failed: ${resData.error?.message || "Unknown error"}`);
        }
      }

      const updateData = {
        height: Number(formData.get('height')),
        health: updateHealth,
        notes: formData.get('notes'),
        images: imageUrl ? [imageUrl] : [],
        updateDate: new Date(),
      };

      console.log("🚀 Submitting Tree Update:", updateData);

      updateTreeMutation.mutate({ 
        id: selectedTree._id || selectedTree.id, 
        data: updateData 
      });
    } catch (error: any) {
      console.error("❌ Update Tree Error:", error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const imageFile = (document.getElementById('req-image') as HTMLInputElement).files?.[0];

    setIsUploading(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        console.log("📤 Uploading request image...");
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: imgFormData,
        });
        const resData = await response.json();
        if (resData.success) {
          imageUrl = resData.data.url;
          console.log("✅ Request image uploaded:", imageUrl);
        } else {
          throw new Error(`Image upload failed: ${resData.error?.message || "Unknown error"}`);
        }
      }

      const requestData = {
        relatedTreeId: requestTreeId,
        subject: requestType,
        message: formData.get('req-notes'),
        image: imageUrl,
        name: user?.fullName || user?.username,
        email: user?.email,
      };

      await contactAPI.submit(requestData);
      
      queryClient.invalidateQueries({ queryKey: ['my-contacts'] });
      setIsRequestDialogOpen(false);
      setRequestTreeId("");
      setRequestType("");
      toast({
        title: "Request Submitted",
        description: "Your request has been sent to the district administrators.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isUserLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (user && !user.isVerified) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-yellow-500/10 rounded-full text-yellow-500">
              <Clock className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold">{t.auth.pending.title}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t.auth.pending.desc}
          </p>
          <Button variant="outline" asChild>
            <a href="/">{t.auth.pending.return}</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">{t.dashboard.title}</h1>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>
          
          <div className="flex gap-3">
            {/* Request Dialog */}
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  {t.dashboard.btn_submit_request}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[95vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>{t.dashboard.dialogs.request.title}</DialogTitle>
                  <DialogDescription>
                    {t.dashboard.dialogs.request.desc}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendRequest} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tree-select">{t.dashboard.dialogs.request.tree_label}</Label>
                    <Select required value={requestTreeId} onValueChange={setRequestTreeId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.dashboard.dialogs.request.tree_placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {trees.map((tree: any) => (
                          <SelectItem key={tree._id} value={tree._id}>
                            {tree.commonName} - {tree.location.address ? (tree.location.address.length > 40 ? tree.location.address.substring(0, 40) + "..." : tree.location.address) : "Unknown Location"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-type">{t.dashboard.dialogs.request.type_label}</Label>
                    <Select required value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.dashboard.dialogs.request.type_placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damage">{t.dashboard.dialogs.request.types.damage}</SelectItem>
                        <SelectItem value="removal">{t.dashboard.dialogs.request.types.removal}</SelectItem>
                        <SelectItem value="needed">{t.dashboard.dialogs.request.types.needed}</SelectItem>
                        <SelectItem value="unhealthy">{t.dashboard.dialogs.request.types.unhealthy}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-notes">{t.dashboard.dialogs.request.details_label}</Label>
                    <Textarea id="req-notes" name="req-notes" placeholder={t.dashboard.dialogs.request.details_placeholder} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-image" className="flex items-center justify-between">
                      {t.dashboard.dialogs.request.photo_label}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => document.getElementById('req-image')?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {t.dashboard.dialogs.request.capture}
                      </Button>
                    </Label>
                    <Input 
                      id="req-image" 
                      name="req-image" 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsRequestDialogOpen(false)}>{t.dashboard.dialogs.request.cancel}</Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.dashboard.dialogs.request.submitting}</> : t.dashboard.dialogs.request.submit}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Tree Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-2xl h-12 px-6">
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">{t.dashboard.btn_add_tree}</span>
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[95vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>{t.dashboard.dialogs.add_tree.title}</DialogTitle>
                  <DialogDescription>
                    {t.dashboard.dialogs.add_tree.desc}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTree} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tree-type">{t.dashboard.dialogs.add_tree.tree_type}</Label>
                      <Input id="tree-type" name="tree-type" placeholder={t.dashboard.dialogs.add_tree.tree_type_placeholder} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sci-name">{t.dashboard.dialogs.add_tree.scientific_name}</Label>
                      <Input id="sci-name" name="sci-name" className="italic" placeholder={t.dashboard.dialogs.add_tree.scientific_name_placeholder} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">{t.dashboard.dialogs.add_tree.date_planted}</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">{t.dashboard.dialogs.add_tree.location}</Label>
                    <div className="flex gap-2">
                      <Input id="location" name="location" placeholder={t.dashboard.dialogs.add_tree.location_placeholder} required={!coordinates} className="flex-1" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        title="Get Current Location"
                      >
                        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", coordinates ? "bg-green-100 text-green-600" : "bg-primary/20 text-primary")}>
                      <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-bold uppercase tracking-tighter", coordinates ? "text-green-600" : "text-primary")}>
                        {coordinates ? t.dashboard.dialogs.add_tree.gps_captured : t.dashboard.dialogs.add_tree.gps_required}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {coordinates ? `Lon: ${coordinates[0].toFixed(4)}, Lat: ${coordinates[1].toFixed(4)}` : t.dashboard.dialogs.add_tree.gps_desc}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t.dashboard.dialogs.add_tree.notes}</Label>
                    <Textarea id="notes" name="notes" placeholder={t.dashboard.dialogs.add_tree.notes_placeholder} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="flex items-center justify-between">
                      {t.dashboard.dialogs.add_tree.photo_label} <span className="text-destructive font-bold text-[10px] uppercase tracking-wider">{language === 'en' ? '(Required)' : 'අත්‍යවශ්‍යයි'}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => document.getElementById('image')?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {t.dashboard.dialogs.add_tree.capture || "Capture"}
                      </Button>
                    </Label>
                    <Input id="image" name="image" type="file" accept="image/*" capture="environment" className="cursor-pointer" required />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>{t.dashboard.dialogs.add_tree.cancel}</Button>
                    <Button type="submit" disabled={isUploading || createTreeMutation.isPending}>
                      {(isUploading || createTreeMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.dashboard.dialogs.add_tree.submitting}
                        </>
                      ) : t.dashboard.dialogs.add_tree.submit}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[95vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>Update Tree Progress</DialogTitle>
                  <DialogDescription>
                    Record the current status of {selectedTree?.commonName}.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateTree} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Current Height (cm)</Label>
                      <Input id="height" name="height" type="number" placeholder="e.g. 120" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="health">{t.dashboard.dialogs.update.health}</Label>
                      <Select required value={updateHealth} onValueChange={setUpdateHealth}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.dashboard.dialogs.update.health_placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">{t.dashboard.filter.excellent}</SelectItem>
                          <SelectItem value="good">{t.dashboard.filter.good}</SelectItem>
                          <SelectItem value="fair">{t.dashboard.filter.fair}</SelectItem>
                          <SelectItem value="poor">{t.dashboard.filter.poor}</SelectItem>
                          <SelectItem value="dead">{t.dashboard.filter.dead}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Update Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Any changes or observations..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update-image" className="flex items-center justify-between">
                      Update Photo <span className="text-destructive font-bold text-[10px] uppercase tracking-wider">{language === 'en' ? '(Required)' : 'අත්‍යවශ්‍යයි'}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => document.getElementById('update-image')?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                    </Label>
                    <Input id="update-image" name="image" type="file" accept="image/*" capture="environment" className="cursor-pointer" required />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isUploading || updateTreeMutation.isPending}>
                      {isUploading || updateTreeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : "Save Update"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Weather Alerts */}
        {userStats?.weatherAlert && (
          <div className={cn(
            "p-5 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm",
            userStats.weatherAlert.urgency === 'high' ? "bg-orange-500/10 border border-orange-500/20 text-orange-900" : "bg-blue-500/10 border border-blue-500/20 text-blue-900"
          )}>
            <div className="flex items-center gap-4 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                userStats.weatherAlert.urgency === 'high' ? "bg-orange-500 text-white shadow-orange-500/30" : "bg-blue-500 text-white shadow-blue-500/30"
              )}>
                {userStats.weatherAlert.type === 'watering' ? <Droplets className="w-6 h-6" /> : 
                 userStats.weatherAlert.type === 'storm' ? <CloudRain className="w-6 h-6 animate-pulse" /> :
                 <CloudRain className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm md:text-base font-bold leading-tight">{userStats.weatherAlert.message}</p>
                  {userStats.weatherAlert.urgency === 'high' && (
                    <Badge variant="outline" className="bg-orange-500/20 border-orange-500/30 text-orange-700 text-[9px] font-black h-4 px-1 flex sm:hidden">URGENT</Badge>
                  )}
                </div>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> Environmental Advice • Gampaha
                </p>
              </div>
            </div>

            {/* Weather Details Grid */}
            {userStats.weatherAlert.details && (
              <div className="flex items-center gap-4 md:gap-8 bg-white/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-50 leading-none">Temp</p>
                    <p className="text-sm font-black">{userStats.weatherAlert.details.temp}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-black/5 pl-4 md:pl-8">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-50 leading-none">Humidity</p>
                    <p className="text-sm font-black">{userStats.weatherAlert.details.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-black/5 pl-4 md:pl-8">
                  <Wind className="w-4 h-4 text-teal-500" />
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-50 leading-none">Wind</p>
                    <p className="text-sm font-black">{userStats.weatherAlert.details.windSpeed}m/s</p>
                  </div>
                </div>
                {userStats.weatherAlert.urgency === 'high' && (
                  <Badge variant="outline" className="bg-orange-500 border-orange-500 text-white text-[10px] font-black hidden sm:flex px-2 py-1 ml-2">URGENT ACTION</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="trees" className="w-full">
          <TabsList className="mb-6 w-full justify-start md:justify-center overflow-x-auto overflow-y-hidden h-auto p-1 bg-muted/50 rounded-xl no-scrollbar">
            <TabsTrigger value="trees" className="gap-2 rounded-lg py-2.5 px-4 underline-offset-4">
              <TreePine className="w-4 h-4" />
              {t.dashboard.tabs.trees}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 rounded-lg py-2.5 px-4 underline-offset-4">
              <MessageSquare className="w-4 h-4" />
              {t.dashboard.tabs.requests}
              {myContacts.filter(c => c.status === 'replied').length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] font-bold">
                  {myContacts.filter(c => c.status === 'replied').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2 rounded-lg py-2.5 px-4 underline-offset-4">
              <Trophy className="w-4 h-4" />
              {t.dashboard.tabs.achievements}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trees" className="space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  placeholder={t.dashboard.search_placeholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.dashboard.filter.all}</SelectItem>
                  <SelectItem value="excellent">{t.dashboard.filter.excellent}</SelectItem>
                  <SelectItem value="good">{t.dashboard.filter.good}</SelectItem>
                  <SelectItem value="fair">{t.dashboard.filter.fair}</SelectItem>
                  <SelectItem value="poor">{t.dashboard.filter.poor}</SelectItem>
                  <SelectItem value="active">{t.dashboard.filter.active}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tree Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trees.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">{t.dashboard.no_trees}</p>
                </div>
              ) : filteredTrees.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">{t.dashboard.no_search_results}</p>
                </div>
              ) : (
                filteredTrees.map((tree: any) => (
                  <TreeCard 
                    key={tree._id} 
                    tree={tree} 
                    showActions={true} 
                    onAddUpdate={() => {
                      setSelectedTree(tree);
                      setIsUpdateDialogOpen(true);
                    }} 
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {myContacts.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-12 h-12 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground font-medium">{t.dashboard.no_requests}</p>
                    <p className="text-sm text-muted-foreground">{t.dashboard.no_requests_help}</p>
                  </div>
                </Card>
              ) : (
                myContacts.map((contact: any) => (
                  <Card key={contact._id} className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg">{contact.subject}</h3>
                            <Badge className={cn(
                              "capitalize",
                              contact.status === 'replied' ? "bg-green-100 text-green-700" :
                              contact.status === 'read' ? "bg-blue-100 text-blue-700" :
                              "bg-orange-100 text-orange-700"
                            )}>
                              {contact.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <History className="w-3 h-3" />
                            {format(new Date(contact.createdAt), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                        <p className="text-sm leading-relaxed">{contact.message}</p>
                        {contact.image && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden border">
                            <img src={contact.image} alt="Attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>

                      {contact.status === 'replied' && (
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2 text-xs h-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                            onClick={() => {
                              setSelectedViewContact(contact);
                              if (contact.status === 'replied') {
                                contactAPI.markAsSeen(contact._id).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['my-contacts'] });
                                });
                              }
                            }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            View Response
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              <Card className="p-6 text-center space-y-2 bg-primary/5 border-primary/10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <TreePine className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{userStats?.treesPlanted || 0}</div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Trees Planted</p>
              </Card>
              <Card className="p-6 text-center space-y-2 bg-primary/5 border-primary/10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{userStats?.updatesSubmitted || 0}</div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Growth Updates</p>
              </Card>
              <Card className="p-6 text-center space-y-2 bg-primary/5 border-primary/10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{userStats?.eventsAttended || 0}</div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Events Joined</p>
              </Card>
              
              {/* CO2 Offset Card */}
              <Card className="p-6 text-center space-y-2 bg-green-500/5 border-green-500/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-green-700">{userStats?.co2Offset || "0.00"}</div>
                <p className="text-[10px] text-green-600/80 uppercase font-black tracking-widest">CO₂ kg Offset</p>
              </Card>

              <Card className="p-6 text-center space-y-2 bg-primary/5 border-primary/10">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold">{userStats?.achievements?.length || 0}</div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Badges Earned</p>
              </Card>
            </div>

            <h2 className="text-2xl font-heading font-bold mt-12">Earned Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!userStats?.achievements || userStats.achievements.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl">
                  <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't earned any badges yet. Start planting to unlock them!</p>
                </div>
              ) : (
                userStats.achievements.map((badge: any) => (
                  <Card key={badge._id} className="overflow-hidden border-primary/10 bg-gradient-to-br from-white to-primary/5">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-primary/10 flex items-center justify-center text-3xl">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{badge.badgeName}</h3>
                        <p className="text-sm text-muted-foreground leading-tight">{badge.description}</p>
                        <p className="text-[10px] text-primary/60 font-medium mt-2 uppercase">Earned {format(new Date(badge.earnedAt), "MMM d, yyyy")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Response Dialog */}
      <Dialog open={!!selectedViewContact} onOpenChange={(open) => !open && setSelectedViewContact(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto custom-scrollbar p-6 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              Sent on {selectedViewContact && format(new Date(selectedViewContact.createdAt), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedViewContact && (
            <div className="space-y-6 py-4">
              {/* Original Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Your Message
                </div>
                <div className="p-4 bg-white rounded-2xl text-sm border shadow-sm">
                  <p className="font-bold mb-1 text-primary/80">{selectedViewContact.subject}</p>
                  <p>{selectedViewContact.message}</p>
                  {selectedViewContact.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border max-w-xs">
                      <img src={selectedViewContact.image} alt="Attached" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {/* Related Tree Info */}
              {selectedViewContact.relatedTreeId && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                  <TreePine className="w-4 h-4 text-primary" />
                  <div className="text-xs">
                    <p className="font-bold text-primary">Related Tree</p>
                    <p className="text-muted-foreground">{selectedViewContact.relatedTreeId.commonName} ({selectedViewContact.relatedTreeId.treeId})</p>
                  </div>
                </div>
              )}

              {/* Conversation History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Administrator Responses
                </div>
                
                <div className="space-y-4">
                  {selectedViewContact.responses && selectedViewContact.responses.length > 0 ? (
                    selectedViewContact.responses.map((resp: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1">
                <div className="p-4 bg-green-600 text-white rounded-2xl rounded-tl-none text-sm border border-green-700/20 shadow-md">
                  {resp.message}
                </div>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {format(new Date(resp.respondedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    ))
                  ) : (
                    selectedViewContact.reply ? (
                      <div className="flex flex-col gap-1">
                      <div className="p-4 bg-green-600 text-white rounded-2xl rounded-tl-none text-sm border border-green-700/20 shadow-md">
                        {selectedViewContact.reply}
                      </div>
                        {selectedViewContact.repliedAt && (
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {format(new Date(selectedViewContact.repliedAt), "MMM d, h:mm a")}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic pl-2">No responses yet. Our team will get back to you soon.</p>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedViewContact(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

