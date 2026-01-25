import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, TreePine, Users, Map, Sprout } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import heroImage from "@assets/generated_images/community_tree_planting_hero_image.png";
import forestImage from "@assets/generated_images/lush_green_forest_landscape.png";

export default function Home() {
  // Fetch real stats from API
  const { data: stats } = useQuery({
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
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="container relative z-10 px-4 text-center text-white space-y-8 max-w-4xl mx-auto pt-24 pb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Launch Initiative for Independence Day
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Planting Hope for <br />
            <span className="text-green-400">Gampaha's Future</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Join the movement to restore our district's green cover. Record, monitor, and nurture every tree you plant for a sustainable tomorrow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white border-none min-w-[160px] h-12 text-base shadow-lg hover:shadow-green-500/25 transition-all">
                Join Now
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-w-[160px] h-12 text-base backdrop-blur-sm">
                Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-36 relative z-20">
            <StatCard icon={TreePine} value={stats?.totalTrees || 0} label="Trees Planted" />
            <StatCard icon={Users} value={stats?.totalUsers || 0} label="Active Volunteers" />
            <StatCard icon={Map} value={stats?.upcomingEvents || 0} label="Upcoming Events" />
            <StatCard icon={Sprout} value={stats?.co2Offset || '0 kg/year'} label="CO₂ Offset" />
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <span className="w-8 h-[2px] bg-primary" />
                Our Mission
              </div>
              <h2 className="text-4xl font-heading font-bold text-foreground">
                Growing a Greener <br /> Gampaha Together
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Gampahin Husmak is more than just a tree planting campaign; it's a commitment to long-term environmental stewardship. We use technology to ensure every sapling planted is monitored, nurtured, and protected.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Track tree growth with monthly updates",
                  "Report issues and get expert advice",
                  "Visualize district-wide impact on maps",
                  "Earn badges for your contribution"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6" />
              <img 
                src={forestImage} 
                alt="Green Gampaha" 
                className="relative rounded-2xl shadow-xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">Ready to make an impact?</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Start your journey today. Register an account, plant a tree, and watch your contribution grow.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all">
              Start Planting Today
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:translate-y-[-5px] transition-transform duration-300">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-3xl font-bold font-heading text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
      </CardContent>
    </Card>
  );
}
