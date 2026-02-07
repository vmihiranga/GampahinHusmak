import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Award, Plus } from "lucide-react";
import { format } from "date-fns";

interface UserBadgesDialogProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  userBadges: any[];
  onRemoveBadge: (badgeId: string) => void;
  onAwardBadge: () => void;
}

export default function UserBadgesDialog({
  open,
  onClose,
  userName,
  userId,
  userBadges,
  onRemoveBadge,
  onAwardBadge,
}: UserBadgesDialogProps) {
  const badgeTypeColors: Record<string, string> = {
    trees_planted: "bg-green-100 text-green-700",
    events_attended: "bg-blue-100 text-blue-700",
    updates_submitted: "bg-purple-100 text-purple-700",
    special: "bg-amber-100 text-amber-700",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            {userName}'s Badges
          </DialogTitle>
          <DialogDescription>
            View and manage badges earned by this user
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {userBadges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium">No badges yet</p>
              <p className="text-sm mt-1">Award a badge to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBadges.map((badge: any) => (
                <div
                  key={badge._id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{badge.badgeName}</h4>
                      <Badge className={badgeTypeColors[badge.badgeType]}>
                        {badge.badgeType.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {badge.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned: {format(new Date(badge.earnedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {badge.awardedBy && (
                      <p className="text-xs text-primary">
                        Manually awarded by admin
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0 h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => onRemoveBadge(badge._id)}
                    title="Remove badge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onAwardBadge}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Award New Badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
