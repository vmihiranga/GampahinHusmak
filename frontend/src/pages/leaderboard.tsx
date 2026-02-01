import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import { LeaderboardResponse } from "@/lib/types";
import { Trophy, Medal, Award, TreePine, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const { data, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard'],
    queryFn: () => statsAPI.getLeaderboard(),
  });

  const topPlanters = data?.topPlanters || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-2">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Community Leaderboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating our top environmental champions who are leading the way in regreening Gampaha.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : topPlanters.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">The leaderboard is currently empty. Start planting to see your name here!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {topPlanters.map((item, index) => (
                <Card key={item._id} className={`overflow-hidden transition-all duration-300 hover:shadow-md ${index < 3 ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0 w-8 sm:w-12 text-center font-heading font-bold text-2xl">
                      {index === 0 ? <Medal className="w-8 h-8 text-yellow-500 mx-auto" /> :
                       index === 1 ? <Medal className="w-8 h-8 text-slate-400 mx-auto" /> :
                       index === 2 ? <Medal className="w-8 h-8 text-amber-600 mx-auto" /> :
                       index + 1}
                    </div>

                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-background shadow-sm">
                      <AvatarImage src={item.user.profileImage} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {(item.user.fullName || item.user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate">
                        {item.user.fullName || item.user.username}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          Volunteer
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end text-primary">
                        <TreePine className="w-5 h-5" />
                        <span className="text-2xl font-bold">{item.count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Trees Planted</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Global Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12">
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold">Total Effort</h4>
              <p className="text-sm text-muted-foreground">Collective contribution from all volunteers</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-bold">District Impact</h4>
              <p className="text-sm text-muted-foreground">Covers all 13 divisions of Gampaha</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-bold">Growing Community</h4>
              <p className="text-sm text-muted-foreground">New members joining every day</p>
            </div>
        </div>
      </div>
    </Layout>
  );
}

import { Users } from "lucide-react";
