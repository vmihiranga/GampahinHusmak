import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USERS, TREES, REQUESTS } from "@/lib/mockData";
import { Check, X, UserCheck, AlertTriangle, TreePine } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
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

        <Tabs defaultValue="approvals" className="w-full">
          <TabsList>
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="issues">Reported Issues</TabsTrigger>
            <TabsTrigger value="trees">Tree Registry</TabsTrigger>
          </TabsList>

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
                  {/* Fallback mock since mock data might be limited */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">Nimal Siripala</p>
                        <p className="text-sm text-muted-foreground">nimal.s@example.com</p>
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

          <TabsContent value="trees">
            <Card>
              <CardHeader>
                <CardTitle>Tree Registry</CardTitle>
                <CardDescription>View all trees in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tree list table would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
