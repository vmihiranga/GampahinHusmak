import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface BadgeManagementTabProps {
  badgeTemplates: any[];
  onCreateTemplate: () => void;
  onEditTemplate: (template: any) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function BadgeManagementTab({
  badgeTemplates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
}: BadgeManagementTabProps) {
  const badgeTypeColors: Record<string, string> = {
    trees_planted: "bg-green-100 text-green-700",
    events_attended: "bg-blue-100 text-blue-700",
    updates_submitted: "bg-purple-100 text-purple-700",
    special: "bg-amber-100 text-amber-700",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Badge Templates Management</CardTitle>
          <CardDescription>
            Create and manage badge templates for user achievements
          </CardDescription>
        </div>
        <Button 
          onClick={onCreateTemplate}
          className="rounded-xl gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Badge Template
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Trigger Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badgeTemplates.map((template: any) => (
                <TableRow key={template._id}>
                  <TableCell className="text-2xl">{template.icon}</TableCell>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge className={badgeTypeColors[template.badgeType]}>
                      {template.badgeType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.triggerCount || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(template.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 hover:bg-primary/5 border-primary/10"
                        onClick={() => onEditTemplate(template)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-destructive hover:bg-destructive/5 border-destructive/10"
                        onClick={() => onDeleteTemplate(template._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {badgeTemplates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No badge templates found. Create your first badge template!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
