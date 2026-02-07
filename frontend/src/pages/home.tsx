import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, TreePine, Users, Activity, Sprout } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import { StatsResponse } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import heroImage from "@assets/generated_images/community_tree_planting_hero_image.png";
import forestImage from "@assets/generated_images/lush_green_forest_landscape.png";
import { PWAInstallSection } from "@/components/PWAInstallSection";

export default function Home() {
  const { t, language, getPathWithLang } = useLanguage();
  // Fetch real stats from API
  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: () => statsAPI.getGeneral(),
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Tree Planting" 
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="container relative z-10 px-4 text-center text-white space-y-8 max-w-4xl mx-auto pt-40 pb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t.home.hero.badge}
          </div>
          
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 px-4">
            <img src="/logo.png" alt="Gampahin Husmak" className="h-32 sm:h-48 md:h-64 w-auto object-contain" loading="eager" decoding="async" fetchpriority="high" />
          </div>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {t.home.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href={getPathWithLang("/auth?mode=register")}>
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white border-none min-w-[160px] h-12 text-base shadow-lg hover:shadow-green-500/25 transition-all rounded-full">
                {t.home.hero.cta_start}
              </Button>
            </Link>
            <Link href={getPathWithLang("/gallery")}>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-w-[160px] h-12 text-base backdrop-blur-sm rounded-full">
                {t.home.hero.cta_explore}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-36 relative z-20">
            <StatCard icon={TreePine} value={stats?.totalTrees || 0} label={t.home.stats.trees_planted} />
            <StatCard icon={Users} value={stats?.totalUsers || 0} label={t.home.stats.active_volunteers} />
            <StatCard icon={Activity} value={stats?.survivalRate || '100%'} label={t.home.stats.survival_rate} />
            <StatCard icon={Sprout} value={stats?.co2Offset || '0 kg/year'} label={t.home.stats.co2_offset} />
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <span className="w-8 h-[2px] bg-primary" />
                {t.home.mission.tag}
              </div>
              <h2 className="text-4xl font-heading font-bold text-foreground">
                {t.home.mission.title}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t.home.mission.description}
              </p>
              <ul className="space-y-4 pt-4">
                {t.home.mission.features.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group px-4 md:px-0">
              <div className="absolute inset-x-4 md:inset-0 bg-primary/10 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6" />
              <img 
                src={forestImage} 
                alt="Green Gampaha" 
                className="relative rounded-2xl shadow-xl w-full h-[350px] md:h-[500px] object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">{t.home.cta_section.title}</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            {t.home.cta_section.subtitle}
          </p>
          <Link href={getPathWithLang("/auth?mode=register")}>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all">
              {t.home.cta_section.button}
            </Button>
          </Link>
        </div>
      </section>
      <PWAInstallSection />
    </Layout>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) {
  return (
    <Card className="group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-500 rounded-3xl">
      <CardContent className="p-4 sm:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-5 relative z-10">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary transform transition-all group-hover:scale-110 duration-500">
          <Icon className="w-5 h-5 md:w-7 md:h-7" />
        </div>
        <div className="space-y-1">
          <div className="text-2xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight">{value}</div>
          <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
