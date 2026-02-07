import { Link, useLocation } from "wouter";
import { Leaf, User, LayoutDashboard, LogIn, LogOut, Menu, X, Globe, Languages, ChevronRight, Home, Image as ImageIcon, MessageSquare, Trophy, Settings, Activity, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { authAPI, contactAPI } from "@/lib/api";
import { AuthResponse, ContactsResponse } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language, setLanguage, t, getPathWithLang } = useLanguage();

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
      setIsMobileMenuOpen(false);
      navigate(getPathWithLang("/"));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isHome = location === "/" || ["/en", "/si", "/ta", "/en/", "/si/", "/ta/"].includes(location);

  const NavLink = ({ 
    href, 
    children, 
    icon: Icon, 
    badge,
    mobile = false 
  }: { 
    href: string; 
    children: React.ReactNode; 
    icon?: any; 
    badge?: number;
    mobile?: boolean;
  }) => {
    const isActive = location === href;

    if (mobile) {
      return (
        <Link href={href}>
          <a 
            className={cn(
              "flex items-center justify-between px-4 py-4 text-base font-semibold transition-all rounded-2xl group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-foreground hover:bg-primary/5 active:scale-[0.98]"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
              )}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <span className="flex items-center gap-2">
                {children}
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
                    {badge}
                  </span>
                )}
              </span>
            </div>
            <ChevronRight className={cn("w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1", isActive && "opacity-100")} />
          </a>
        </Link>
      );
    }

    return (
      <Link href={href}>
        <a 
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
            isActive 
              ? (isHome ? "bg-white/20 text-white" : "bg-primary/10 text-primary")
              : (isHome ? "text-white/80 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5")
          )}
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

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className={cn(
        "absolute top-0 z-50 w-full transition-all duration-300",
        !isHome ? "relative bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
      )}>
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <Link href={getPathWithLang("/")}>
            <a className="flex items-center gap-3 group">
              <div className="bg-transparent group-hover:scale-110 transition-all">
                <img 
                  src="/favicon.png" 
                  alt="Gampahin Husmak" 
                  className="h-12 md:h-18 w-auto object-contain" 
                />
              </div>
            </a>
          </Link>

          {/* Sponsor Logos in Middle */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8 animate-in fade-in duration-700">
            <img 
              src="/2logo.png" 
              alt="Sponsors" 
              className="h-16 md:h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" 
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href={getPathWithLang("/")}>{t.nav.home}</NavLink>
            <NavLink href={getPathWithLang("/gallery")}>{t.nav.gallery}</NavLink>
            <NavLink href={getPathWithLang("/contact")}>{t.nav.contact}</NavLink>
            <NavLink href={getPathWithLang("/leaderboard")}>{t.nav.leaderboard}</NavLink>
            
            {/* Show Dashboard only when logged in */}
            {user && <NavLink href={getPathWithLang("/dashboard")} badge={unreadCount}>{t.nav.dashboard}</NavLink>}
            
            {/* Show Admin only for admin/superadmin */}
            {isAdmin && <NavLink href={getPathWithLang("/admin")}>{t.nav.admin}</NavLink>}
            
            <div className={cn("h-4 w-px mx-2", isHome ? "bg-white/20" : "bg-border")} />
            {/* Language Toggle Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-0.5 px-2 py-1 h-8 border border-transparent hover:border-primary/20 transition-all rounded-full",
                isHome ? "text-white hover:bg-white/10" : "text-foreground hover:bg-primary/5"
              )}
              onClick={() => {
                if (language === 'en') setLanguage('si');
                else if (language === 'si') setLanguage('ta');
                else setLanguage('en');
              }}
              title={language === 'en' ? "සිංහලට මාරු වන්න" : language === 'si' ? "தமிழ் மொழிக்கு மாற்றவும்" : "Switch to English"}
            >
              <div className="flex items-center gap-0.5">
                <span className={cn(
                  "text-[8px] font-bold transition-all px-1 py-0.5 rounded",
                  language === 'en' ? "bg-primary text-white" : "opacity-40"
                )}>EN</span>
                <span className={cn(
                  "text-[8px] font-bold transition-all px-1 py-0.5 rounded",
                  language === 'si' ? "bg-primary text-white" : "opacity-40"
                )}>සිං</span>
                <span className={cn(
                  "text-[8px] font-bold transition-all px-1 py-0.5 rounded",
                  language === 'ta' ? "bg-primary text-white" : "opacity-40"
                )}>தமிழ்</span>
              </div>
            </Button>

            <div className={cn("h-4 w-px mx-2", isHome ? "bg-white/20" : "bg-border")} />

            {/* Show Login button when not authenticated */}
            {!user && !isLoading && (
              <Link href={getPathWithLang("/auth")}>
                <Button 
                  variant="default" 
                  size="sm" 
                  className={cn(
                    "gap-2 rounded-full px-5 h-10 font-bold",
                    isHome ? "bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20" : "shadow-lg shadow-primary/20"
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
                      "gap-2 h-10 pl-1 pr-3 rounded-full",
                      isHome ? "text-white hover:bg-white/10" : "hover:bg-primary/5 border border-primary/10"
                    )}
                  >
                    <Avatar className="w-8 h-8 border-2 border-primary/20">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline font-bold text-xs">{user.fullName || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-primary/10 backdrop-blur-xl">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black text-foreground">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                      <div className="pt-2">
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{user.role}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/10 mx-2" />
                  <div className="p-1 space-y-1">
                    <DropdownMenuItem asChild className="rounded-xl cursor-not-allowed opacity-50 pointer-events-none">
                      <div className="flex items-center w-full px-3 py-2">
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Profile Settings</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href={getPathWithLang("/dashboard")}>
                        <a className="flex items-center w-full px-3 py-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{t.nav.dashboard}</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href={getPathWithLang("/admin")}>
                          <a className="flex items-center w-full px-3 py-2 cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">{t.nav.admin_panel}</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-primary/10 mx-2" />
                  <div className="p-1">
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span className="text-sm font-bold">{t.nav.logout}</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Mobile Menu Wrapper */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "w-11 h-11 rounded-2xl",
                    isHome ? "text-white hover:bg-white/10" : "text-foreground hover:bg-primary/5 border border-primary/10"
                  )}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-none bg-background/95 backdrop-blur-xl flex flex-col h-full shadow-2xl">
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 px-6">
                  <SheetHeader className="text-left mb-8">
                    <SheetTitle className="flex items-center justify-center">
                      <div className="bg-transparent">
                        <img src="/favicon.png" alt="Gampahin Husmak" className="h-16 w-auto object-contain" />
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-2 pb-8">
                    <NavLink mobile href={getPathWithLang("/")} icon={Home}>{t.nav.home}</NavLink>
                    <NavLink mobile href={getPathWithLang("/gallery")} icon={ImageIcon}>{t.nav.gallery}</NavLink>
                    <NavLink mobile href={getPathWithLang("/contact")} icon={MessageSquare}>{t.nav.contact}</NavLink>
                    <NavLink mobile href={getPathWithLang("/leaderboard")} icon={Trophy}>{t.nav.leaderboard}</NavLink>
                    
                    {user && (
                      <>
                        <div className="h-px w-full bg-border/50 my-4" />
                        <NavLink mobile href={getPathWithLang("/dashboard")} icon={LayoutDashboard} badge={unreadCount}>{t.nav.dashboard}</NavLink>
                        {isAdmin && <NavLink mobile href={getPathWithLang("/admin")} icon={User}>{t.nav.admin}</NavLink>}
                      </>
                    )}
                  </div>

                  <div className="h-px w-full bg-border/50 my-4" />

                  {/* Language Selection in Mobile */}
                  <div className="pb-8">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3 px-2">
                      {language === 'en' ? 'Select Language' : language === 'si' ? 'භාෂාව තෝරන්න' : 'மொழி தேர்வு'}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between gap-4 h-14 px-5 rounded-2xl transition-all border-primary/10 bg-primary/5 hover:bg-primary/10"
                      onClick={() => {
                        if (language === 'en') setLanguage('si');
                        else if (language === 'si') setLanguage('ta');
                        else setLanguage('en');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Languages className="w-5 h-5 text-primary" />
                        <span className="font-bold text-sm">
                          {language === 'en' ? "English" : language === 'si' ? "සිංහල" : "தமிழ்"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-background p-1 rounded-xl shadow-inner">
                        <span className={cn("text-[9px] font-bold px-2 py-1.5 rounded-lg transition-colors", language === 'en' ? "bg-primary text-white" : "text-muted-foreground")}>EN</span>
                        <span className={cn("text-[9px] font-bold px-2 py-1.5 rounded-lg transition-colors", language === 'si' ? "bg-primary text-white" : "text-muted-foreground")}>SI</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-1.5 rounded-lg transition-colors", language === 'ta' ? "bg-primary text-white" : "text-muted-foreground")}>TA</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Mobile Bottom Section: User / Login */}
                <div className="p-6 bg-muted/30 border-t border-border/50 mt-auto">
                  {!user && !isLoading ? (
                    <Link href={getPathWithLang("/auth")}>
                      <Button className="w-full h-14 rounded-2xl gap-3 font-black text-base shadow-xl shadow-primary/20" onClick={() => setIsMobileMenuOpen(false)}>
                        <LogIn className="w-5 h-5" />
                        {language === 'en' ? 'Login Now' : language === 'si' ? 'දැන් ඇතුළු වන්න' : 'இப்போதே உள்நுழைய'}
                      </Button>
                    </Link>
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white border border-primary/5 shadow-sm">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-primary/10">
                            <AvatarImage src={user.profileImage} alt={user.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground truncate">{user.fullName || user.username}</p>
                            <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
                            <div className="flex mt-1">
                               <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{user.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-destructive/10"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.nav.logout}
                      </Button>
                    </div>
                  ) : null}
                  
                  <div className="mt-6 flex justify-center gap-4 opacity-30 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>v1.2.0</span>
                    <span>•</span>
                    <span>© 2026 GH</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-0">
        {children}
      </main>

      <footer className="bg-black text-white py-16 border-t border-white/5">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <img src="/favicon.png" alt="Gampahin Husmak" className="h-12 w-auto object-contain" />
              <img src="/New Project (3).png" alt="Sponsors" className="h-14 w-auto object-contain" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed font-medium">
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-[0.2em] mb-6 text-primary">{t.footer.quick_links}</h3>
            <ul className="space-y-4 text-sm text-white/50 font-medium">
              <li><Link href={getPathWithLang("/gallery")} className="hover:text-primary transition-colors flex items-center gap-2 capitalize"> <ImageIcon className="w-3.5 h-3.5" /> {t.nav.gallery}</Link></li>
              <li><Link href={getPathWithLang("/contact")} className="hover:text-primary transition-colors flex items-center gap-2 capitalize"> <MessageSquare className="w-3.5 h-3.5" /> {t.nav.contact}</Link></li>
              {user && (
                <li><Link href={getPathWithLang("/dashboard")} className="hover:text-primary transition-colors flex items-center gap-2 capitalize"> <LayoutDashboard className="w-3.5 h-3.5" /> {t.nav.dashboard}</Link></li>
              )}
              {isAdmin && (
                <li><Link href={getPathWithLang("/admin")} className="hover:text-primary transition-colors flex items-center gap-2 capitalize"> <User className="w-3.5 h-3.5" /> {t.nav.admin}</Link></li>
              )}
            </ul>
          </div>
 
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-[0.2em] mb-6 text-primary">{t.footer.contact}</h3>
            <ul className="space-y-4 text-sm text-white/50 font-medium">
              <li className="flex items-start gap-3">
                 <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><MapPin className="w-3 h-3 text-primary" /></div>
                 <span>{t.footer.address}</span>
              </li>
              <li className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Globe className="w-3 h-3 text-primary" /></div>
                 <span>info@gampahinhusmak.lk</span>
              </li>
              <li className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Activity className="w-3 h-3 text-primary" /></div>
                 <span>+94 33 222 2222</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default select-none"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sponsored by Lions Club Of Gampaha Metro</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-2 hover:text-white/60 transition-colors cursor-default select-none"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Powered By Leo Club Of Gampaha Metro Juniors</span>
            </div>
            <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">
              © 2026 Gampahin Husmak. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>

  );
}
