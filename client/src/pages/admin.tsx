import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, UserCheck, AlertTriangle, TreePine, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { treesAPI, statsAPI, contactAPI, adminAPI } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import TreeMap from "@/components/TreeMap";

export default function Admin() {
  // Fetch trees data
  const { data: treesData } = useQuery({
    queryKey: ['admin-trees'],
    queryFn: () => treesAPI.getAll(),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => statsAPI.getGeneral(),
  });

  // Fetch contacts/issues
  const { data: contactsData } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => contactAPI.getAll(),
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers(),
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: ({ userId, isVerified }: { userId: string, isVerified: boolean }) => 
      adminAPI.verifyUser(userId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User verification status updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });


  const trees = treesData?.trees || [];
  const contacts = contactsData?.contacts || [];

  const statusColors: Record<string, string> = {
    excellent: "bg-green-100 text-green-700",
    good: "bg-lime-100 text-lime-700",
    fair: "bg-yellow-100 text-yellow-700",
    poor: "bg-orange-100 text-orange-700",
    dead: "bg-red-100 text-red-700",
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
              <CardTitle className="text-sm font-medium">Total Trees</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrees || 0}</div>
              <p className="text-xs text-muted-foreground">Active plantations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter((c: any) => c.status === 'new').length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered volunteers</p>
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
                    {trees.map((tree: any) => (
                      <TableRow key={tree._id}>
                        <TableCell className="font-medium">{tree.commonName}</TableCell>
                        <TableCell>{tree.location.address}</TableCell>
                        <TableCell>{format(new Date(tree.plantedDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[tree.currentHealth]}>
                            {tree.currentHealth}
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
                <CardDescription>Visual health tracking of all plantation sites across Gampaha.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <TreeMap 
                  trees={trees} 
                  center={{ lat: 7.0917, lng: 80.0167 }}
                  zoom={11}
                  height="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.users?.map((user: any) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="font-medium">{user.fullName || user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-yellow-600 bg-yellow-50 hover:bg-yellow-50">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant={user.isVerified ? "destructive" : "default"}
                            onClick={() => verifyMutation.mutate({ userId: user._id, isVerified: !user.isVerified })}
                            disabled={verifyMutation.isPending}
                          >
                            {user.isVerified ? "Revoke" : "Approve"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!usersData?.users || usersData?.users.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>Review messages and inquiries from users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    contacts.slice(0, 10).map((contact: any) => (
                      <div key={contact._id} className="p-4 border rounded-lg bg-card space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant={contact.status === 'new' ? 'destructive' : 'outline'} className="mb-2">
                              {contact.status}
                            </Badge>
                            <h4 className="font-semibold">{contact.subject}</h4>
                            <p className="text-sm text-muted-foreground">{contact.name} - {contact.email}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(contact.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.message}</p>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Respond</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

