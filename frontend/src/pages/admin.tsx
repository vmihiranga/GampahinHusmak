import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  UserCheck,
  TreePine,
  MoreHorizontal,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treesAPI, statsAPI, contactAPI, adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import TreeMap from "@/components/TreeMap";
import {
  MapPin,
  ExternalLink,
  Calendar,
  Info,
  Clock,
  History,
  Loader2,
  Bell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Admin() {
  // Fetch trees data
  const { data: treesData } = useQuery<TreesResponse>({
    queryKey: ["admin-trees"],
    queryFn: () => treesAPI.getAll(),
  });

  // Fetch stats
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: () => statsAPI.getGeneral(),
  });

  // Fetch contacts/issues
  const { data: contactsData } = useQuery<ContactsResponse>({
    queryKey: ["admin-contacts"],
    queryFn: () => contactAPI.getAll(),
  });

  // Fetch users
  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ["admin-users"],
    queryFn: () => adminAPI.getUsers(),
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [confirmUser, setConfirmUser] = useState<{
    id: string;
    name: string;
    isVerified: boolean;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [, setLocation] = useLocation();
  const [messageUser, setMessageUser] = useState<{ id: string; name: string } | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");

  const verifyMutation = useMutation({
    mutationFn: ({
      userId,
      isVerified,
    }: {
      userId: string;
      isVerified: boolean;
    }) => adminAPI.verifyUser(userId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmUser(null);
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
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { subject: string; message: string } }) => 
      adminAPI.sendMessage(userId, data),
    onSuccess: () => {
      setMessageUser(null);
      setMsgSubject("");
      setMsgBody("");
      toast({
        title: "Message Sent",
        description: "Your system message has been delivered to the user.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      adminAPI.respondToContact(id, reply),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      setSelectedContact(data.contact);
      setReplyText("");
      toast({
        title: "Response Recorded",
        description: "Your reply has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save response",
        variant: "destructive",
      });
    },
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminAPI.updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: (id: string) => adminAPI.sendTreeReminder(id),
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "The user has been notified to update their tree.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
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
          <p className="text-muted-foreground">
            Manage users, approvals, and system overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trees</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active plantations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contact Messages
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contacts.filter((c: any) => c.status === "new").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered volunteers
              </p>
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
                <CardDescription>
                  Master list of all planted trees in the district.
                </CardDescription>
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
                        <TableCell className="font-medium">
                          {tree.commonName}
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate"
                          title={tree.location.address}
                        >
                          {tree.location.address}
                        </TableCell>
                        <TableCell>
                          {format(new Date(tree.plantedDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[tree.currentHealth]}>
                            {tree.currentHealth}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {(() => {
                            const oneMonthAgo = new Date();
                            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                            const lastUpdate = new Date(tree.updatedAt || tree.plantedDate);
                            return lastUpdate < oneMonthAgo && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 gap-1.5"
                                onClick={() => sendReminderMutation.mutate(tree._id)}
                                disabled={sendReminderMutation.isPending}
                              >
                                {sendReminderMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Bell className="w-3 h-3" />
                                )}
                                Send Reminder
                              </Button>
                            );
                          })()}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/trees/${tree._id}?from=admin`)}
                          >
                            View Details
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
                <CardDescription>
                  Visual health tracking of all plantation sites across Gampaha.
                </CardDescription>
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
                <CardDescription>
                  Manage registered users and their permissions.
                </CardDescription>
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
                          <div className="font-medium">
                            {user.fullName || user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-yellow-600 bg-yellow-50 hover:bg-yellow-50"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/5 border-primary/10"
                            onClick={() => setMessageUser({ id: user._id, name: user.fullName || user.username })}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              user.isVerified ? "destructive" : "default"
                            }
                            onClick={() =>
                              setConfirmUser({
                                id: user._id,
                                name: user.fullName || user.username,
                                isVerified: user.isVerified,
                              })
                            }
                            disabled={verifyMutation.isPending}
                          >
                            {user.isVerified ? "Revoke" : "Approve"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!usersData?.users || usersData?.users.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
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
                <CardDescription>
                  Review messages and inquiries from users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    contacts.slice(0, 10).map((contact: any) => (
                      <div
                        key={contact._id}
                        className="p-4 border rounded-lg bg-card space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              variant={
                                contact.status === "new"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="mb-2"
                            >
                              {contact.status}
                            </Badge>
                            <h4 className="font-semibold">{contact.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              {contact.name} - {contact.email}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(contact.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          {contact.image && (
                            <div className="w-20 h-20 rounded border overflow-hidden shrink-0">
                              <img
                                src={contact.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {contact.message}
                            </p>
                            {contact.relatedTreeId && (
                              <p className="text-xs font-medium text-primary flex items-center gap-1">
                                <TreePine className="w-3 h-3" />
                                Related to:{" "}
                                {contact.relatedTreeId.commonName ||
                                  contact.relatedTreeId.treeId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContact(contact);
                              if (contact.status === "new") {
                                updateContactStatusMutation.mutate({
                                  id: contact._id,
                                  status: "read",
                                });
                              }
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setReplyText(contact.reply || "");
                            }}
                          >
                            Respond
                          </Button>
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
      <AlertDialog
        open={!!confirmUser}
        onOpenChange={(open) => !open && setConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {confirmUser?.isVerified ? "revoke" : "approve"} access
              for <b>{confirmUser?.name}</b>.
              {confirmUser?.isVerified
                ? " The user will no longer be able to access verified features."
                : " The user will gain access to volunteer features."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmUser &&
                verifyMutation.mutate({
                  userId: confirmUser.id,
                  isVerified: !confirmUser.isVerified,
                })
              }
              className={cn(
                confirmUser?.isVerified
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Response Dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedContact?.name} ({selectedContact?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {selectedContact?.message}
              </div>
              {selectedContact?.image && (
                <div className="rounded-lg border overflow-hidden">
                  <img
                    src={selectedContact.image}
                    alt="Attached"
                    className="w-full h-auto max-h-[300px] object-contain bg-black/5"
                  />
                </div>
              )}
              {selectedContact?.relatedTreeId && (
                <div className="space-y-2">
                  <div className="text-xs p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-primary" />
                      <span>
                        Related Tree: <b>{selectedContact.relatedTreeId.commonName}</b> (
                        {selectedContact.relatedTreeId.treeId})
                      </span>
                    </div>
                    {selectedContact.relatedTreeId.location && (
                      <div className="flex flex-col gap-2 pl-6 border-l-2 border-primary/10">
                        <p className="text-muted-foreground">{selectedContact.relatedTreeId.location.address}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-fit h-7 px-2 text-[10px] gap-1"
                          onClick={() => {
                            const [lng, lat] = selectedContact.relatedTreeId.location.coordinates;
                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                          }}
                        >
                          <MapPin className="w-3 h-3" />
                          View on Map
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Responses History */}
              {selectedContact?.responses && selectedContact.responses.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Conversation History</Label>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedContact.responses.map((resp: any, i: number) => (
                      <div key={i} className="flex flex-col items-end gap-1">
                        <div className="p-3 bg-primary text-primary-foreground rounded-2xl rounded-tr-none text-sm shadow-sm max-w-[90%]">
                          {resp.message}
                        </div>
                        <span className="text-[9px] text-muted-foreground mr-1">
                          {format(new Date(resp.respondedAt), "MMM d, h:mm a")}
                        </span >
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply">Response</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                className="min-h-[150px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContact(null)}>
              Close
            </Button>
            <Button
              onClick={() =>
                respondMutation.mutate({
                  id: selectedContact._id,
                  reply: replyText,
                })
              }
              disabled={respondMutation.isPending || !replyText.trim()}
            >
              {respondMutation.isPending ? "Saving..." : "Save Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!messageUser} onOpenChange={(open) => !open && setMessageUser(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold">Message {messageUser?.name}</DialogTitle>
              <DialogDescription className="text-white/80">
                Send a system notification to this user. They will see it in their dashboard.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={msgSubject} 
                onChange={(e) => setMsgSubject(e.target.value)} 
                placeholder="e.g. Profile Verification" 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                value={msgBody} 
                onChange={(e) => setMsgBody(e.target.value)} 
                placeholder="Write your message here..." 
                className="rounded-xl min-h-[120px]"
              />
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => setMessageUser(null)} className="rounded-xl">Cancel</Button>
              <Button 
                onClick={() => sendMessageMutation.mutate({ userId: messageUser!.id, data: { subject: msgSubject, message: msgBody } })}
                disabled={sendMessageMutation.isPending || !msgBody}
                className="rounded-xl font-bold"
              >
                {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
