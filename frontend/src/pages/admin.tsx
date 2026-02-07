import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Database,
  Server,
  Activity,
  RefreshCw,
  MapPin,
  ExternalLink,
  Calendar,
  Info,
  Loader2,
  Bell,
  Trash2,
  Edit,
  UserPlus,
  ShieldAlert,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { treesAPI, statsAPI, contactAPI, adminAPI, authAPI } from "@/lib/api";
import { 
  TreesResponse, 
  StatsResponse, 
  ContactsResponse, 
  UsersResponse, 
  DbStatsResponse,
  Contact,
  AuthResponse
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import TreeMap from "@/components/TreeMap";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { t, language, getPathWithLang } = useLanguage();
  const [treePage, setTreePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const limit = 20;

  // Fetch current user
  const { data: authData } = useQuery<AuthResponse>({
    queryKey: ["auth-check"],
    queryFn: () => authAPI.me(),
  });
  const currentUser = authData?.user;
  const isSuperAdmin = currentUser?.role === "superadmin";

  // Fetch trees data
  const { data: treesData } = useQuery<TreesResponse>({
    queryKey: ["admin-trees", treePage],
    queryFn: () => treesAPI.getAll({ page: treePage, limit: 30 }),
  });

  // Fetch admin summary (stats, recent items)
  const { data: adminSummary } = useQuery<any>({
    queryKey: ["admin-summary"],
    queryFn: () => adminAPI.getSummary(),
  });

  const stats = adminSummary?.stats;

  // Fetch contacts/issues
  const { data: contactsData } = useQuery<ContactsResponse>({
    queryKey: ["admin-contacts", contactPage],
    queryFn: () => contactAPI.getAll({ page: contactPage, limit: 10 }),
  });

  // Fetch users
  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ["admin-users", userPage],
    queryFn: () => adminAPI.getUsers({ page: userPage, limit: 30 }),
  });

  // Fetch DB stats
  const { data: dbStats, refetch: refetchDb, isFetching: isFetchingDb } = useQuery<DbStatsResponse>({
    queryKey: ["admin-db-stats"],
    queryFn: () => adminAPI.getDbStats(),
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Superadmin States
  const [deleteUser, setDeleteUser] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [deleteTree, setDeleteTree] = useState<string | null>(null);
  const [editTree, setEditTree] = useState<any | null>(null);

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

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteUser(null);
      toast({ title: "User Deleted", description: "All user data has been removed." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditUser(null);
      toast({ title: "Profile Updated", description: "User information saved." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => adminAPI.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role Updated", description: "Permissions have been changed." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const deleteTreeMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteTree(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trees"] });
      setDeleteTree(null);
      toast({ title: "Tree Deleted", description: "All registry data removed." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const updateTreeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => treesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trees"] });
      setEditTree(null);
      toast({ title: "Tree Updated", description: "Registry data saved." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
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

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ["admin-summary"] });
    await queryClient.refetchQueries({ queryKey: ["admin-trees"] });
    await queryClient.refetchQueries({ queryKey: ["admin-users"] });
    await queryClient.refetchQueries({ queryKey: ["admin-contacts"] });
    await queryClient.refetchQueries({ queryKey: ["admin-db-stats"] });
    
    toast({
      title: "Dashboard Refreshed",
      description: "Data has been updated to the latest version.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">{t.admin.title}</h1>
            <p className="text-muted-foreground">
              {t.admin.subtitle}
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="w-fit gap-2 rounded-xl bg-primary/5 border-primary/10 hover:bg-primary/10 transition-all font-bold"
          >
            <RefreshCw className={cn("w-4 h-4", adminSummary === undefined && "animate-spin")} />
            {t.admin.refresh}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.admin.stats.total_trees}</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrees || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t.admin.stats.active_plantations}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.admin.stats.contact_messages}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingContacts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.admin.stats.requires_attention}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.admin.stats.total_users}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t.admin.stats.registered_volunteers}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trees" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto h-auto p-1 bg-muted/50 rounded-2xl">
            <TabsTrigger value="trees" className="rounded-xl flex items-center gap-2 py-2">
              <TreePine className="w-4 h-4" />
              {t.admin.tabs.registry}
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-xl flex items-center gap-2 py-2">
              <MapPin className="w-4 h-4" />
              {t.admin.tabs.map_view}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-xl flex items-center gap-2 py-2">
              <UserCheck className="w-4 h-4" />
              {t.admin.tabs.users}
            </TabsTrigger>
            <TabsTrigger value="issues" className="rounded-xl flex items-center gap-2 py-2">
              <AlertTriangle className="w-4 h-4" />
              {t.admin.tabs.issues}
            </TabsTrigger>
            <TabsTrigger value="db" className="rounded-xl flex items-center gap-2 py-2">
              <Database className="w-4 h-4" />
              {t.admin.tabs.db_mgmt}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trees">
            <Card>
              <CardHeader>
                <CardTitle>{t.admin.tabs.registry}</CardTitle>
                <CardDescription>
                  {t.admin.tabs.descriptions.registry}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.admin.registry.table.tree_type}</TableHead>
                        <TableHead>{t.admin.registry.table.location}</TableHead>
                        <TableHead>{t.admin.registry.table.planted_date}</TableHead>
                        <TableHead>{t.admin.registry.table.status}</TableHead>
                        <TableHead className="text-right">{t.admin.registry.table.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trees.map((tree: any) => (
                        <TableRow key={tree._id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {tree.commonName}
                          </TableCell>
                          <TableCell
                            className="max-w-[300px] truncate"
                            title={tree.location.address}
                          >
                            {tree.location.address}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(tree.plantedDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[tree.currentHealth]}>
                              {tree.currentHealth}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {isSuperAdmin && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/5 border-primary/10"
                                    onClick={() => setEditTree(tree)}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 border-destructive/10"
                                    onClick={() => setDeleteTree(tree._id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
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
                                      {t.admin.registry.buttons.send_reminder}
                                    </Button>
                                );
                              })()}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(getPathWithLang(`/trees/${tree._id}?from=admin`))}
                              >
                                {t.admin.registry.buttons.view_details}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {treesData?.pagination && treesData.pagination.totalPages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (treePage > 1) setTreePage(treePage - 1); }}
                            className={treePage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(treesData.pagination.totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              href="#" 
                              isActive={treePage === i + 1}
                              onClick={(e) => { e.preventDefault(); setTreePage(i + 1); }}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (treePage < treesData.pagination!.totalPages) setTreePage(treePage + 1); }}
                            className={treePage >= treesData.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{t.admin.tabs.map_view}</CardTitle>
                <CardDescription>
                  {t.admin.tabs.descriptions.map}
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
                <CardTitle>{t.admin.tabs.users}</CardTitle>
                <CardDescription>
                  {t.admin.tabs.descriptions.users}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.admin.users.table.user}</TableHead>
                        <TableHead>{t.admin.users.table.role}</TableHead>
                        <TableHead>{t.admin.users.table.status}</TableHead>
                        <TableHead>{t.admin.users.table.joined_date}</TableHead>
                        <TableHead className="text-right">{t.admin.users.table.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users?.map((user: any) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="font-medium whitespace-nowrap text-sm">
                              {user.fullName || user.username}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSuperAdmin ? (
                              <Select 
                                defaultValue={user.role} 
                                onValueChange={(role) => updateRoleMutation.mutate({ id: user._id, role })}
                              >
                                <SelectTrigger className="h-7 w-28 text-[10px] font-bold py-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="volunteer">{t.admin.users.roles.volunteer}</SelectItem>
                                  <SelectItem value="admin">{t.admin.users.roles.admin}</SelectItem>
                                  <SelectItem value="superadmin">{t.admin.users.roles.superadmin}</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize whitespace-nowrap font-bold text-[10px]">
                                {user.role === "volunteer" ? t.admin.users.roles.volunteer : user.role === "admin" ? t.admin.users.roles.admin : t.admin.users.roles.superadmin}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.isVerified
                                  ? "bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap"
                              }
                            >
                              {user.isVerified ? t.admin.users.status.verified : t.admin.users.status.pending}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            {isSuperAdmin && (
                               <>
                                 <Button
                                   size="icon"
                                   variant="outline"
                                   className="h-8 w-8 hover:bg-primary/5 border-primary/10"
                                   onClick={() => setEditUser(user)}
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                                 <Button
                                   size="icon"
                                   variant="outline"
                                   className="h-8 w-8 text-destructive hover:bg-destructive/5 border-destructive/10"
                                   onClick={() => setDeleteUser(user._id)}
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </>
                            )}
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
                              className="rounded-lg text-xs h-8"
                            >
                              {user.isVerified ? t.admin.users.buttons.revoke : t.admin.users.buttons.approve}
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
                            {t.admin.users.no_items}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {usersData?.pagination && usersData.pagination.totalPages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (userPage > 1) setUserPage(userPage - 1); }}
                            className={userPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(usersData.pagination.totalPages)].map((_, i) => {
                          if (usersData.pagination!.totalPages > 7) {
                            if (i + 1 === 1 || i + 1 === usersData.pagination!.totalPages || (i + 1 >= userPage - 1 && i + 1 <= userPage + 1)) {
                              return (
                                <PaginationItem key={i}>
                                  <PaginationLink 
                                    href="#" 
                                    isActive={userPage === i + 1}
                                    onClick={(e) => { e.preventDefault(); setUserPage(i + 1); }}
                                    className="cursor-pointer"
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            if (i + 1 === 2 || i + 1 === usersData.pagination!.totalPages - 1) {
                              return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                            }
                            return null;
                          }
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink 
                                href="#" 
                                isActive={userPage === i + 1}
                                onClick={(e) => { e.preventDefault(); setUserPage(i + 1); }}
                                className="cursor-pointer"
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (userPage < usersData.pagination!.totalPages) setUserPage(userPage + 1); }}
                            className={userPage >= usersData.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>{t.admin.tabs.issues}</CardTitle>
                <CardDescription>
                  {t.admin.tabs.descriptions.issues}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t.admin.issues.no_items}</p>
                    </div>
                  ) : (
                    contacts.slice(0, 10).map((contact: any) => (
                      <div
                        key={contact._id}
                        className="p-4 border rounded-lg bg-card space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge 
                                variant={
                                  contact.status === "new" ? "default" : "secondary"
                                }
                              >
                                {t.admin.issues.status[contact.status as keyof typeof t.admin.issues.status] || contact.status}
                              </Badge>
                              {(contact as any).isStale && (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] h-5">
                                  {t.admin.issues.stale_alert}
                                </Badge>
                              )}
                            </div>
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
                              if (contact.status === "new" && !((contact as any).isStale)) {
                                updateContactStatusMutation.mutate({
                                  id: contact._id,
                                  status: "read",
                                });
                              }
                            }}
                          >
                            View Details
                          </Button>
                          {(contact as any).isStale ? (
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white gap-1"
                              onClick={() => {
                                sendReminderMutation.mutate(contact.relatedTreeId._id);
                              }}
                              disabled={sendReminderMutation.isPending}
                            >
                              {sendReminderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                              Send Reminder
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setReplyText(contact.reply || "");
                              }}
                            >
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {contactsData?.pagination && contactsData.pagination.totalPages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (contactPage > 1) setContactPage(contactPage - 1); }}
                            className={contactPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(contactsData.pagination.totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              href="#" 
                              isActive={contactPage === i + 1}
                              onClick={(e) => { e.preventDefault(); setContactPage(i + 1); }}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); if (contactPage < contactsData.pagination!.totalPages) setContactPage(contactPage + 1); }}
                            className={contactPage >= contactsData.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="db" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold">{t.admin.db.title}</h2>
                <p className="text-muted-foreground text-sm">{t.admin.db.subtitle}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchDb()} 
                disabled={isFetchingDb}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={cn("w-4 h-4", isFetchingDb && "animate-spin")} />
                {t.admin.refresh}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    {t.admin.db.storage_health}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {dbStats?.database.ok ? "Optimal" : "Check Status"}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Used Capacity</span>
                      <span>512 MB Limit</span>
                    </div>
                    {(() => {
                      const usedMB = (dbStats?.database.storageSize || 0) / (1024 * 1024);
                      const percent = Math.min((usedMB / 512) * 100, 100);
                      return (
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-muted-foreground">
                      {( (dbStats?.database.storageSize || 0) / (1024 * 1024) ).toFixed(2)} MB of 512.00 MB used
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    {t.admin.db.engine_info}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">MDB v{dbStats?.server.version || "---"}</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Data Size</span>
                      <span className="font-bold">{Math.round((dbStats?.database.dataSize || 0) / 1024)} KB</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Index Size</span>
                      <span className="font-bold">{Math.round((dbStats?.database.indexSize || 0) / 1024)} KB</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Collections</span>
                      <span className="font-bold">{dbStats?.collections.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600" />
                    {t.admin.db.network_load}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dbStats?.server.connections || 0} Conns</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-bold">{dbStats ? Math.floor(dbStats.server.uptime / 3600) : 0} Hours</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-green-600 font-black">ACTIVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>{t.admin.db.architecture}</CardTitle>
                <CardDescription>Real-time storage allocation across data models.</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Collection</TableHead>
                        <TableHead className="text-right">Documents</TableHead>
                        <TableHead className="text-right">Size (KB)</TableHead>
                        <TableHead className="text-right pr-6">Avg Object</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dbStats?.collections.map((coll) => (
                        <TableRow key={coll.name}>
                          <TableCell className="font-mono font-bold text-primary pl-6">{coll.name}</TableCell>
                          <TableCell className="text-right font-medium">{coll.count.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">{Math.round(coll.size / 1024).toLocaleString()} KB</TableCell>
                          <TableCell className="text-right text-muted-foreground pr-6">{Math.round(coll.avgObjSize).toLocaleString()} B</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                   </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t.admin.db.health_check}
                </CardTitle>
                <CardDescription>Potential issues or errors detected in the last 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center bg-muted/20 rounded-2xl">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">{t.admin.db.no_errors}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t.admin.db.operating_normal}</p>
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
            <AlertDialogTitle>{t.admin.dialogs.confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmUser?.isVerified 
                ? t.admin.dialogs.confirm.revoke_desc.replace("{name}", confirmUser?.name || "")
                : t.admin.dialogs.confirm.approve_desc.replace("{name}", confirmUser?.name || "")
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
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
              {t.admin.dialogs.confirm.confirm_btn}
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
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">{t.admin.dialogs.respond.history}</Label>
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
              <Label htmlFor="reply">{t.admin.dialogs.respond.reply_label}</Label>
              <Textarea
                id="reply"
                placeholder={t.admin.dialogs.respond.reply_placeholder}
                className="min-h-[150px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContact(null)}>
              {t.common.close}
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
              {respondMutation.isPending ? t.admin.dialogs.respond.saving : t.admin.dialogs.respond.save_btn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!messageUser} onOpenChange={(open) => !open && setMessageUser(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold">{t.admin.dialogs.message.title.replace("{name}", messageUser?.name || "")}</DialogTitle>
              <DialogDescription className="text-white/80">
                {t.admin.dialogs.message.desc}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t.admin.dialogs.message.subject}</Label>
              <Input 
                id="subject" 
                value={msgSubject} 
                onChange={(e) => setMsgSubject(e.target.value)} 
                placeholder={t.admin.dialogs.message.subject_placeholder} 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t.admin.dialogs.message.message}</Label>
              <Textarea 
                id="message" 
                value={msgBody} 
                onChange={(e) => setMsgBody(e.target.value)} 
                placeholder={t.admin.dialogs.message.message_placeholder} 
                className="rounded-xl min-h-[120px]"
              />
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => setMessageUser(null)} className="rounded-xl">{t.common.cancel}</Button>
              <Button 
                onClick={() => sendMessageMutation.mutate({ userId: messageUser!.id, data: { subject: msgSubject, message: msgBody } })}
                disabled={sendMessageMutation.isPending || !msgBody}
                className="rounded-xl font-bold"
              >
                {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t.admin.dialogs.message.send_btn}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Superadmin Alerts & Dialogs */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              {t.admin.dialogs.delete_user.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.dialogs.delete_user.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUser && deleteUserMutation.mutate(deleteUser)}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? t.common.loading : t.admin.dialogs.delete_user.confirm_btn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.dialogs.edit_user.title}</DialogTitle>
            <DialogDescription>{t.admin.dialogs.edit_user.desc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.full_name}</Label>
                <Input 
                  value={editUser?.fullName || ""} 
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.phone}</Label>
                <Input 
                  value={editUser?.phoneNumber || ""} 
                  onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.username}</Label>
                <Input 
                  value={editUser?.username || ""} 
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.email}</Label>
                <Input 
                  value={editUser?.email || ""} 
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.role}</Label>
                <Select 
                  value={editUser?.role} 
                  onValueChange={(val) => setEditUser({ ...editUser, role: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.admin.dialogs.edit_user.is_verified}</Label>
                <Select 
                  value={editUser?.isVerified?.toString()} 
                  onValueChange={(val) => setEditUser({ ...editUser, isVerified: val === 'true' })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.admin.dialogs.edit_user.address}</Label>
              <Textarea 
                value={editUser?.address || ""} 
                onChange={(e) => setEditUser({ ...editUser, address: e.target.value })} 
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>{t.common.cancel}</Button>
            <Button 
              onClick={() => updateUserMutation.mutate({ id: editUser._id, data: editUser })}
              disabled={updateUserMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTree} onOpenChange={(open) => !open && setDeleteTree(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t.admin.dialogs.delete_tree.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.dialogs.delete_tree.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTree && deleteTreeMutation.mutate(deleteTree)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t.admin.dialogs.delete_tree.confirm_btn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editTree} onOpenChange={(open) => !open && setEditTree(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.dialogs.edit_tree.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.admin.dialogs.edit_tree.common_name}</Label>
              <Input 
                value={editTree?.commonName || ""} 
                onChange={(e) => setEditTree({ ...editTree, commonName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.dialogs.edit_tree.scientific_name}</Label>
              <Input 
                value={editTree?.scientificName || ""} 
                onChange={(e) => setEditTree({ ...editTree, scientificName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.dialogs.edit_tree.health}</Label>
              <Select 
                defaultValue={editTree?.currentHealth} 
                onValueChange={(val) => setEditTree({ ...editTree, currentHealth: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">{t.admin.registry.health.excellent}</SelectItem>
                  <SelectItem value="good">{t.admin.registry.health.good}</SelectItem>
                  <SelectItem value="fair">{t.admin.registry.health.fair}</SelectItem>
                  <SelectItem value="poor">{t.admin.registry.health.poor}</SelectItem>
                  <SelectItem value="dead">{t.admin.registry.health.dead}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTree(null)}>{t.common.cancel}</Button>
            <Button 
              onClick={() => updateTreeMutation.mutate({ id: editTree._id, data: editTree })}
              disabled={updateTreeMutation.isPending}
            >
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
