import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import { LeaderboardResponse } from "@/lib/types";
import { Trophy, Medal, Award, TreePine, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Leaderboard() {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', page],
    queryFn: () => statsAPI.getLeaderboard(page, limit),
  });

  const topPlanters = data?.topPlanters || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-2">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">{t.leaderboard.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.leaderboard.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : topPlanters.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">{t.leaderboard.no_items}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {topPlanters.map((item, index) => {
                // Calculate display rank with tie handling
                let rank = index + 1;
                if (index > 0 && item.count === topPlanters[index - 1].count) {
                  // Find the first index with this count to determine the rank
                  let tieIndex = index;
                  while (tieIndex > 0 && topPlanters[tieIndex].count === topPlanters[tieIndex - 1].count) {
                    tieIndex--;
                  }
                  rank = tieIndex + 1;
                }
                
                const displayRank = ((page - 1) * limit) + rank;

                return (
                  <Card key={item._id} className={`overflow-hidden transition-all duration-300 hover:shadow-md ${index < 3 ? 'border-primary/20 bg-primary/5' : ''}`}>
                    <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                      <div className="flex-shrink-0 w-8 sm:w-12 text-center font-heading font-bold text-2xl">
                        {displayRank === 1 ? <Medal className="w-8 h-8 text-yellow-500 mx-auto" /> :
                         displayRank === 2 ? <Medal className="w-8 h-8 text-slate-400 mx-auto" /> :
                         displayRank === 3 ? <Medal className="w-8 h-8 text-amber-600 mx-auto" /> :
                         displayRank}
                      </div>

                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-background shadow-sm">
                        <AvatarImage src={item.user.profileImage} referrerPolicy="no-referrer" />
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
                            {language === 'en' ? 'Volunteer' : language === 'si' ? 'ස්වේච්ඡා සාමාජික' : 'தன்னார்வலர்'}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end text-primary">
                          <TreePine className="w-5 h-5" />
                          <span className="text-2xl font-bold">{item.count}</span>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{t.leaderboard.trees_planted}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); if (page > 1) { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {[...Array(data.pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (data.pagination!.totalPages > 7) {
                      if (pageNum === 1 || pageNum === data.pagination!.totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              href="#" 
                              isActive={page === pageNum}
                              onClick={(e) => { e.preventDefault(); setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (pageNum === 2 || pageNum === data.pagination!.totalPages - 1) {
                        return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                      }
                      return null;
                    }
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          isActive={page === pageNum}
                          onClick={(e) => { e.preventDefault(); setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); if (page < data.pagination!.totalPages) { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}}
                      className={page >= data.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Global Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12">
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold">{t.leaderboard.effort_title}</h4>
              <p className="text-sm text-muted-foreground">{t.leaderboard.effort_desc}</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-bold">{t.leaderboard.impact_title}</h4>
              <p className="text-sm text-muted-foreground">{t.leaderboard.impact_desc}</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-muted/50 border">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-bold">{t.leaderboard.growing_title}</h4>
              <p className="text-sm text-muted-foreground">{t.leaderboard.growing_desc}</p>
            </div>
        </div>
      </div>
    </Layout>
  );
}
