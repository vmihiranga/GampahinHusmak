import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { USERS, TREES, REQUESTS } from "@/lib/mockData";
import { Check, X, UserCheck, AlertTriangle, TreePine, Map as MapIcon, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Admin() {
  const statusColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-700",
    needs_attention: "bg-orange-100 text-orange-700",
    issue_reported: "bg-red-100 text-red-700",
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Manage users, approvals, and system overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tree Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Planted</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">+45 this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trees" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="trees">Registry</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="approvals">Users</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="trees">
            <Card>
              <CardHeader>
                <CardTitle>Tree Registry</CardTitle>
                <CardDescription>Master list of all planted trees in the district.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tree Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Planted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TREES.map((tree) => (
                      <TableRow key={tree.id}>
                        <TableCell className="font-medium">{tree.type}</TableCell>
                        <TableCell>{tree.location}</TableCell>
                        <TableCell>{format(new Date(tree.plantedAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[tree.status]}>
                            {tree.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>District Monitoring Map</CardTitle>
                <CardDescription>Visual health tracking of all plantation sites.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[600px] w-full bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sri_Lanka_Gampaha_district_locator_map.svg/1024px-Sri_Lanka_Gampaha_district_locator_map.svg.png')] bg-center bg-no-repeat bg-contain grayscale" />
                  
                  {/* Mock Map Markers */}
                  {TREES.map((tree, i) => (
                    <div 
                      key={tree.id}
                      className="absolute group cursor-pointer"
                      style={{ 
                        top: `${30 + (i * 15)}%`, 
                        left: `${40 + (i * 10)}%` 
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-150 animate-bounce",
                        tree.status === 'healthy' ? "bg-green-500" : tree.status === 'needs_attention' ? "bg-orange-500" : "bg-red-500"
                      )} />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-background p-3 rounded-lg shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <p className="text-sm font-bold">{tree.type}</p>
                        <p className="text-xs text-muted-foreground">{tree.location}</p>
                        <Badge variant="outline" className="mt-2 text-[10px] capitalize">Status: {tree.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))}

                  <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-border space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Map Legend</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500" /> Healthy
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-orange-500" /> Needs Attention
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500" /> Issue Reported
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending User Registrations</CardTitle>
                <CardDescription>Review and approve new user accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {USERS.filter(u => u.status === 'pending').map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Reported Tree Issues</CardTitle>
                <CardDescription>Monitor health reports from volunteers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {REQUESTS.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg bg-card space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="destructive" className="mb-2">Damaged</Badge>
                          <h4 className="font-semibold">Tree ID #{req.treeId} at Gampaha Botanical Gardens</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">{req.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Respond</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

