import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function PWAInstallSection() {
  const { isInstallable, isInstalled, installPWA, isIOS } = usePWA();
  const { t } = useLanguage();

  if (isInstalled) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-background p-10 rounded-[3rem] border border-primary/20 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">
              {t.pwa.installed}
            </h2>
            <p className="text-muted-foreground font-medium">
              {t.pwa.installed_desc}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-background border border-primary/10 rounded-[3rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            {/* Image / Icon Side */}
            <div className="w-full md:w-2/5 bg-primary/5 p-12 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src="/favicon.png" alt="App Icon" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg animate-bounce">
                  <Smartphone className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            {/* Content Side */}
            <div className="w-full md:w-3/5 p-12 md:p-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Mobile Friendly
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-6">
                {t.pwa.title}
              </h2>
              
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-10">
                {t.pwa.subtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isIOS ? (
                   <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl w-full">
                     <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-primary" />
                       {t.pwa.ios_guide_title}
                     </p>
                     <ol className="text-sm space-y-3 text-muted-foreground font-medium list-decimal list-inside">
                       <li>{t.pwa.ios_guide_1}</li>
                       <li>{t.pwa.ios_guide_2}</li>
                       <li>{t.pwa.ios_guide_3}</li>
                     </ol>
                   </div>
                ) : (
                   <Button 
                    onClick={installPWA}
                    disabled={!isInstallable}
                    size="lg"
                    className="rounded-full h-16 px-10 text-lg font-black gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Download className="w-6 h-6" />
                    {t.pwa.install_btn}
                  </Button>
                )}
                
                {!isInstallable && !isInstalled && !isIOS && (
                  <p className="w-full text-xs text-muted-foreground mt-4 font-bold flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {t.pwa.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
