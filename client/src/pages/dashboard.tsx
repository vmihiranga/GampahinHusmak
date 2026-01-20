import Layout from "@/components/layout";
import { TreeCard } from "@/components/tree-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TREES } from "@/lib/mockData";
import { Plus, Search, Filter, AlertCircle, MapPin as MapPinIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const handleAddTree = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
    toast({
      title: "Tree Added Successfully",
      description: "Your tree has been recorded and is pending verification.",
    });
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestDialogOpen(false);
    toast({
      title: "Request Submitted",
      description: "Your request has been sent to the district administrators.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your planted trees and track their progress.</p>
          </div>
          
          <div className="flex gap-3">
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
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tree" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREES.map(tree => (
                          <SelectItem key={tree.id} value={tree.id.toString()}>
                            {tree.type} - {tree.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-type">Request Type</Label>
                    <Select required>
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
                    <Textarea id="req-notes" placeholder="Describe the situation..." required />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Send Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

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
                      <Input id="tree-type" placeholder="e.g. Kumbuk" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date Planted</Label>
                      <Input id="date" type="date" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Address)</Label>
                    <Input id="location" placeholder="e.g. 123 Main St, Gampaha" required />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary uppercase tracking-tighter">GPS Location Required</p>
                      <p className="text-xs text-muted-foreground leading-tight">We will automatically fetch your current coordinates when you submit.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Any specific details about the planting..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Photo</Label>
                    <Input id="image" type="file" accept="image/*" />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Submit for Approval</Button>
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
          {TREES.map((tree) => (
            <TreeCard key={tree.id} tree={tree} showActions={true} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

