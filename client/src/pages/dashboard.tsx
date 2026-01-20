import Layout from "@/components/layout";
import { TreeCard } from "@/components/tree-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TREES } from "@/lib/mockData";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTree = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
    toast({
      title: "Tree Added Successfully",
      description: "Your tree has been recorded and is pending verification.",
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
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. 123 Main St, Gampaha" required />
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
          
          {/* Empty state placeholder if needed */}
          {/* <div className="col-span-full text-center py-12 text-muted-foreground">
            No trees found. Start planting today!
          </div> */}
        </div>
      </div>
    </Layout>
  );
}
