import { Link, useLocation } from "wouter";
import { Leaf, User, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => {
    const isActive = location === href;
    const isHome = location === "/";
    return (
      <Link href={href}>
        <a 
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
            isActive 
              ? (isHome ? "bg-white/20 text-white" : "bg-primary/10 text-primary")
              : (isHome ? "text-white/80 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5")
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </a>
      </Link>
    );
  };

  const isHome = location === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className={cn(
        "absolute top-0 z-50 w-full bg-transparent transition-all duration-300",
        !isHome && "relative bg-background border-b"
      )}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-heading font-bold text-xl tracking-tight",
                isHome ? "text-white" : "text-foreground"
              )}>
                Gampahin <span className={isHome ? "text-green-400" : "text-primary"}>Husmak</span>
              </span>
            </a>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/gallery">Gallery</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/admin">Admin</NavLink>
            <div className={cn("h-4 w-px mx-2", isHome ? "bg-white/20" : "bg-border")} />
            <Link href="/auth">
              <Button 
                variant="default" 
                size="sm" 
                className={cn(
                  "gap-2",
                  isHome ? "bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20" : ""
                )}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn("md:hidden p-2", isHome ? "text-white" : "text-foreground")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className={cn(
            "md:hidden border-t p-4 flex flex-col gap-2 shadow-lg",
            isHome ? "bg-black/60 backdrop-blur-lg border-white/10" : "bg-background border-border"
          )}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/gallery">Gallery</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/admin">Admin</NavLink>
            <Link href="/auth">
              <Button className={cn(
                "w-full mt-4 gap-2",
                isHome ? "bg-green-600 hover:bg-green-500 text-white border-none" : ""
              )}>
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-heading font-bold text-lg">Gampahin Husmak</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A community initiative to restore green cover in Gampaha District through sustainable tree plantation and monitoring.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gallery" className="hover:text-primary">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-primary">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>District Secretariat, Gampaha</li>
              <li>info@gampahinhusmak.lk</li>
              <li>+94 33 222 2222</li>
              <li className="pt-2 text-xs opacity-70">Developed by <span className="font-semibold">Developer Team</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Newsletter</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="flex-1 bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © 2026 Gampahin Husmak. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
