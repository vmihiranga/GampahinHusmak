import { Link, useLocation } from "wouter";
import { Leaf, User, LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { authAPI, contactAPI } from "@/lib/api";
import { AuthResponse, ContactsResponse } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { Globe, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage, t } = useLanguage();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response: AuthResponse = await authAPI.me();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: contactsData } = useQuery<ContactsResponse>({
    queryKey: ['my-contacts'],
    queryFn: () => contactAPI.getMyContacts(),
    enabled: !!user,
    refetchInterval: 30000, 
  });

  const unreadCount = contactsData?.contacts?.filter((c: any) => c.status === 'replied').length || 0;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const NavLink = ({ href, children, icon: Icon, badge }: { href: string; children: React.ReactNode; icon?: any; badge?: number }) => {
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
          <span className="flex items-center gap-1.5">
            {children}
            {badge !== undefined && badge > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in duration-300">
                {badge}
              </span>
            )}
          </span>
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
            <NavLink href="/">{t.nav.home}</NavLink>
            <NavLink href="/gallery">{t.nav.gallery}</NavLink>
            <NavLink href="/contact">{t.nav.contact}</NavLink>
            <NavLink href="/leaderboard">{t.nav.leaderboard}</NavLink>
            
            {/* Show Dashboard only when logged in */}
            {user && <NavLink href="/dashboard" badge={unreadCount}>{t.nav.dashboard}</NavLink>}
            
            {/* Show Admin only for admin/superadmin */}
            {isAdmin && <NavLink href="/admin">{t.nav.admin}</NavLink>}
            
            <div className={cn("h-4 w-px mx-2", isHome ? "bg-white/20" : "bg-border")} />
            {/* Language Toggle Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 px-3 border border-transparent hover:border-primary/20 transition-all",
                isHome ? "text-white hover:bg-white/10" : "text-foreground hover:bg-primary/5"
              )}
              onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
              title={language === 'en' ? "සිංහලට මාරු වන්න" : "Switch to English"}
            >
              <Languages className="w-4 h-4 text-primary" />
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className={cn(
                  "text-[10px] font-bold transition-all px-1.5 py-0.5 rounded",
                  language === 'en' ? "bg-primary text-white" : "opacity-40"
                )}>EN</span>
                <span className={cn(
                  "text-[10px] font-bold transition-all px-1.5 py-0.5 rounded",
                  language === 'si' ? "bg-primary text-white" : "opacity-40"
                )}>සිං</span>
              </div>
            </Button>

            <div className={cn("h-4 w-px mx-2", isHome ? "bg-white/20" : "bg-border")} />

            {/* Show Login button when not authenticated */}
            {!user && !isLoading && (
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
                  {language === 'en' ? 'Login' : 'ඇතුළු වන්න'}
                </Button>
              </Link>
            )}
            
            {/* Show User Menu when authenticated */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2",
                      isHome ? "text-white hover:bg-white/10" : ""
                    )}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="text-xs">
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user.fullName || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-primary capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t.nav.dashboard}
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <a className="flex items-center w-full cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          {t.nav.admin_panel}
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
            <NavLink href="/">{t.nav.home}</NavLink>
            <NavLink href="/gallery">{t.nav.gallery}</NavLink>
            <NavLink href="/contact">{t.nav.contact}</NavLink>
            <NavLink href="/leaderboard">{t.nav.leaderboard}</NavLink>
            
            {/* Show Dashboard only when logged in */}
            {user && <NavLink href="/dashboard" badge={unreadCount}>{t.nav.dashboard}</NavLink>}
            
            {/* Show Admin only for admin/superadmin */}
            {isAdmin && <NavLink href="/admin">{t.nav.admin}</NavLink>}
            
            <div className={cn("h-px w-full my-2", isHome ? "bg-white/10" : "bg-border")} />
            
            {/* Language Selection in Mobile */}
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "w-full justify-between gap-4 h-12 px-6 rounded-2xl transition-all",
                isHome ? "bg-white/10 border-white/20 text-white" : "bg-primary/5 border-primary/20"
              )}
              onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
            >
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-primary" />
                <span className="font-bold">{language === 'en' ? "සිංහලට මාරු වන්න" : "Switch to English"}</span>
              </div>
              <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", language === 'en' ? "bg-primary text-white" : "opacity-40")}>EN</span>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", language === 'si' ? "bg-primary text-white" : "opacity-40")}>SI</span>
              </div>
            </Button>

            <div className={cn("h-px w-full my-2", isHome ? "bg-white/10" : "bg-border")} />

            {/* Show Login button when not authenticated */}
            {!user && !isLoading && (
              <Link href="/auth">
                <Button className={cn(
                  "w-full mt-2 gap-2",
                  isHome ? "bg-green-600 hover:bg-green-500 text-white border-none" : ""
                )}>
                  <LogIn className="w-4 h-4" />
                  {t.nav.login}
                </Button>
              </Link>
            )}
            
            {/* Show User Info and Logout when authenticated */}
            {user && (
              <div className="mt-4 space-y-2">
                <div className={cn(
                  "p-3 rounded-lg border",
                  isHome ? "bg-white/10 border-white/20" : "bg-muted"
                )}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isHome ? "text-white" : "text-foreground"
                      )}>
                        {user.fullName || user.username}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        isHome ? "text-white/60" : "text-muted-foreground"
                      )}>
                        {user.email}
                      </p>
                      <p className="text-xs text-primary capitalize mt-0.5">{user.role}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t.nav.logout}
                </Button>
              </div>
            )}
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
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4">{t.footer.quick_links}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gallery" className="hover:text-primary">{t.nav.gallery}</Link></li>
              <li><Link href="/contact" className="hover:text-primary">{t.nav.contact}</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">{t.nav.dashboard}</Link></li>
              <li><Link href="/admin" className="hover:text-primary">{t.nav.admin}</Link></li>
            </ul>
          </div>
 
          <div>
            <h3 className="font-heading font-semibold mb-4">{t.footer.contact}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t.footer.address}</li>
              <li>info@gampahinhusmak.lk</li>
              <li>+94 33 222 2222</li>
              <li className="pt-2 text-xs opacity-70">{t.footer.developed_by} <span className="font-semibold">{t.footer.team}</span></li>
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
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center space-y-2">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">
            <span>Sponsored by Lions Club Of Gampaha Metro</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Powered By Leo Club Of Gampaha Metro Juniors</span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            © 2026 Gampahin Husmak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
