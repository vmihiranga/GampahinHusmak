import Layout from "@/components/layout";
import { TreeCard } from "@/components/tree-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, AlertCircle, MapPin as MapPinIcon, LocateFixed, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treesAPI, authAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  // Fetch user profile
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authAPI.me(),
  });
  const user = userData?.user;

  // Fetch user's trees
  const { data: treesData, isLoading: isTreesLoading } = useQuery({
    queryKey: ['user-trees'],
    queryFn: () => treesAPI.getAll(),
    enabled: !!user?.isVerified, // Only fetch trees if verified
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

  const handleGetLocation = () => {
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
          // Simplified reverse geocoding via OpenStreetMap (Free, no API key needed for basic usage)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.display_name || `Lat: ${latitude}, Lon: ${longitude}`;
          
          const locationInput = document.getElementById('location') as HTMLInputElement;
          if (locationInput) locationInput.value = address;
          
          toast({
            title: "Location detected",
            description: "Coordinates and address have been updated.",
          });
        } catch (error) {
          console.error("Geocoding error:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        });
        setIsLocating(false);
      }
    );
  };

  const handleAddTree = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const imageFile = (document.getElementById('image') as HTMLInputElement).files?.[0];

    if (!coordinates) {
      toast({
        title: "Location required",
        description: "Please detect your GPS location before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let imageUrl = "";

    try {
      // 1. Upload to ImgBB
      if (imageFile) {
        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
          method: "POST",
          body: imgFormData,
        });
        
        const resData = await response.json();
        if (resData.success) {
          imageUrl = resData.data.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // 2. Create Tree in MongoDB
      const treeData = {
        commonName: formData.get('tree-type'),
        species: formData.get('tree-type'), // Fallback
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
      toast({
        title: "Upload Failed",
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

    setIsUploading(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
          method: "POST",
          body: imgFormData,
        });
        
        const resData = await response.json();
        if (resData.success) imageUrl = resData.data.url;
      }

      const updateData = {
        height: Number(formData.get('height')),
        health: formData.get('health'),
        notes: formData.get('notes'),
        images: imageUrl ? [imageUrl] : [],
        updateDate: new Date(),
      };

      updateTreeMutation.mutate({ 
        id: selectedTree._id || selectedTree.id, 
        data: updateData 
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestDialogOpen(false);
    toast({
      title: "Request Submitted",
      description: "Your request has been sent to the district administrators.",
    });
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
          <h1 className="text-3xl font-heading font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Thank you for registering! Your account is currently under review by our administrators. 
            You will be notified once your account has been approved.
          </p>
          <Button variant="outline" asChild>
            <a href="/">Return Home</a>
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
            <h1 className="text-3xl font-heading font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your planted trees and track their progress.</p>
          </div>
          
          <div className="flex gap-3">
            {/* Request Dialog */}
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Submit Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit a Tree Request</DialogTitle>
                  <DialogDescription>
                    Report issues or request assistance for your trees.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendRequest} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tree-select">Select Tree</Label>
                    <Select required name="tree-select">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tree" />
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
                    <Label htmlFor="request-type">Request Type</Label>
                    <Select required name="request-type">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damage">Damage Report</SelectItem>
                        <SelectItem value="removal">Removal Request</SelectItem>
                        <SelectItem value="needed">Assistance Needed</SelectItem>
                        <SelectItem value="unhealthy">Unhealthy Tree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req-notes">Details</Label>
                    <Textarea id="req-notes" name="req-notes" placeholder="Describe the situation..." required />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Send Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Tree Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Add New Tree
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Record a New Tree</DialogTitle>
                  <DialogDescription>
                    Enter the details of the tree you just planted.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTree} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tree-type">Tree Type</Label>
                      <Input id="tree-type" name="tree-type" placeholder="e.g. Kumbuk" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date Planted</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Address)</Label>
                    <div className="flex gap-2">
                      <Input id="location" name="location" placeholder="e.g. 123 Main St, Gampaha" required className="flex-1" />
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
                        {coordinates ? "GPS COORDINATES CAPTURED" : "GPS LOCATION REQUIRED"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {coordinates ? `Lon: ${coordinates[0].toFixed(4)}, Lat: ${coordinates[1].toFixed(4)}` : "Click the target icon above to fetch your current coordinates."}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Any specific details about the planting..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Photo</Label>
                    <Input id="image" name="image" type="file" accept="image/*" />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isUploading || createTreeMutation.isPending}>
                      {(isUploading || createTreeMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : "Submit for Approval"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Update Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
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
                      <Label htmlFor="health">Tree Health</Label>
                      <Select required name="health">
                        <SelectTrigger>
                          <SelectValue placeholder="Choose health" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="dead">Dead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Update Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Any changes or observations..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update-image">Update Photo</Label>
                    <Input id="update-image" name="image" type="file" accept="image/*" />
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

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search your trees..." />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Tree Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No trees planted yet. Start by adding your first tree!</p>
            </div>
          ) : (
            trees.map((tree: any) => (
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
      </div>
    </Layout>
  );
}

