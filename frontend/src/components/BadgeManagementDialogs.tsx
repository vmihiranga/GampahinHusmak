// Badge Management Dialogs for Admin Panel

/* Add these dialogs before the closing </Layout> tag in admin.tsx */

{/* Badge Template Create/Edit Dialog */}
<Dialog open={badgeTemplateDialog || !!editBadgeTemplate} onOpenChange={(open) => {
  if (!open) {
    setBadgeTemplateDialog(false);
    setEditBadgeTemplate(null);
    setBadgeFormData({ name: "", badgeType: "special", description: "", icon: "🏆", triggerCount: undefined });
  }
}}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>{editBadgeTemplate ? "Edit Badge Template" : "Create Badge Template"}</DialogTitle>
      <DialogDescription>
        {editBadgeTemplate ? "Modify the badge template details" : "Create a new badge template that can be awarded to users"}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Badge Name</Label>
        <Input 
          value={editBadgeTemplate?.name || badgeFormData.name}
          onChange={(e) => editBadgeTemplate 
            ? setEditBadgeTemplate({ ...editBadgeTemplate, name: e.target.value })
            : setBadgeFormData({ ...badgeFormData, name: e.target.value })
          }
          placeholder="e.g., Tree Champion"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Badge Type</Label>
        <Select 
          value={editBadgeTemplate?.badgeType || badgeFormData.badgeType}
          onValueChange={(val: any) => editBadgeTemplate
            ? setEditBadgeTemplate({ ...editBadgeTemplate, badgeType: val })
            : setBadgeFormData({ ...badgeFormData, badgeType: val })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trees_planted">Trees Planted</SelectItem>
            <SelectItem value="events_attended">Events Attended</SelectItem>
            <SelectItem value="updates_submitted">Updates Submitted</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          value={editBadgeTemplate?.description || badgeFormData.description}
          onChange={(e) => editBadgeTemplate
            ? setEditBadgeTemplate({ ...editBadgeTemplate, description: e.target.value })
            : setBadgeFormData({ ...badgeFormData, description: e.target.value })
          }
          placeholder="Achievement description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Icon (Emoji)</Label>
        <Input 
          value={editBadgeTemplate?.icon || badgeFormData.icon}
          onChange={(e) => editBadgeTemplate
            ? setEditBadgeTemplate({ ...editBadgeTemplate, icon: e.target.value })
            : setBadgeFormData({ ...badgeFormData, icon: e.target.value })
          }
          placeholder="🏆"
          maxLength={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Trigger Count (Optional - for auto-awarding)</Label>
        <Input 
          type="number"
          value={editBadgeTemplate?.triggerCount || badgeFormData.triggerCount || ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : undefined;
            editBadgeTemplate
              ? setEditBadgeTemplate({ ...editBadgeTemplate, triggerCount: val })
              : setBadgeFormData({ ...badgeFormData, triggerCount: val });
          }}
          placeholder="e.g., 10 (for 10 trees)"
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => {
        setBadgeTemplateDialog(false);
        setEditBadgeTemplate(null);
      }}>
        Cancel
      </Button>
      <Button 
        onClick={() => {
          if (editBadgeTemplate) {
            updateBadgeTemplateMutation.mutate({ id: editBadgeTemplate._id, data: editBadgeTemplate });
          } else {
            createBadgeTemplateMutation.mutate(badgeFormData);
          }
        }}
        disabled={createBadgeTemplateMutation.isPending || updateBadgeTemplateMutation.isPending}
      >
        {editBadgeTemplate ? "Update" : "Create"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Award Badge Dialog */}
<Dialog open={!!awardBadgeDialog} onOpenChange={(open) => !open && setAwardBadgeDialog(null)}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Award Badge to {awardBadgeDialog?.userName}</DialogTitle>
      <DialogDescription>
        Select a badge template to award to this user
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Select Badge</Label>
        <Select onValueChange={(badgeTemplateId) => {
          if (awardBadgeDialog) {
            awardBadgeMutation.mutate({ userId: awardBadgeDialog.userId, badgeTemplateId });
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a badge..." />
          </SelectTrigger>
          <SelectContent>
            {badgeTemplates.map((template: any) => (
              <SelectItem key={template._id} value={template._id}>
                {template.icon} {template.name} - {template.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setAwardBadgeDialog(null)}>
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Delete Badge Template Confirmation */}
<AlertDialog open={!!deleteBadgeTemplate} onOpenChange={(open) => !open && setDeleteBadgeTemplate(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Badge Template</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this badge template? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => deleteBadgeTemplate && deleteBadgeTemplateMutation.mutate(deleteBadgeTemplate)}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
