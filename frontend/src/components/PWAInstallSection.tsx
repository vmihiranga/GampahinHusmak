import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function PWAInstallSection() {
  const { isInstallable, isInstalled, installPWA, isIOS } = usePWA();
  const { language } = useLanguage();

  if (isInstalled) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-background p-10 rounded-[3rem] border border-primary/20 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">
              {language === 'en' ? 'App Already Installed!' : 'යෙදුම දැනටමත් ස්ථාපනය කර ඇත!'}
            </h2>
            <p className="text-muted-foreground font-medium">
              {language === 'en' 
                ? 'Thank you for installing Gampahin Husmak on your device. You can now access it directly from your home screen.' 
                : 'ගම්පහින් හුස්මක් ඔබේ උපාංගයට ස්ථාපනය කිරීම ගැන ස්තූතියි. දැන් ඔබට එය ඔබගේ මුල් තිරයෙන් සෘජුවම භාවිතා කළ හැක.'}
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
                {language === 'en' ? 'Take Gampahin Husmak Anywhere' : 'ගම්පහින් හුස්මක් ඕනෑම තැනක ගෙන යන්න'}
              </h2>
              
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-10">
                {language === 'en' 
                  ? 'Install our progressive web app for a faster, smoother experience. Works offline and takes up almost zero space.' 
                  : 'ඉක්මන් සහ සුමට අත්දැකීමක් සඳහා අපගේ යෙදුම ස්ථාපනය කරගන්න. මෙය offline ද ක්‍රියාකරන අතර ඉතා අඩු ඉඩ ප්‍රමාණයක් පමණක් වැය වේ.'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isIOS ? (
                   <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl w-full">
                     <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-primary" />
                       {language === 'en' ? 'How to install on iPhone:' : 'iPhone එකට ස්ථාපනය කරන ආකාරය:'}
                     </p>
                     <ol className="text-sm space-y-3 text-muted-foreground font-medium list-decimal list-inside">
                       <li>{language === 'en' ? 'Open this site in Safari browser' : 'Safari browser එකෙන් මෙම අඩවිය විවෘත කරන්න'}</li>
                       <li>{language === 'en' ? 'Tap the "Share" button at the bottom' : 'පහල ඇති "Share" $(\share)$ බොත්තම ඔබන්න'}</li>
                       <li>{language === 'en' ? 'Scroll down and tap "Add to Home Screen"' : 'පහලට ගොස් "Add to Home Screen" තෝරන්න'}</li>
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
                    {language === 'en' ? 'Install App Now' : 'දැන්ම ස්ථාපනය කරන්න'}
                  </Button>
                )}
                
                {!isInstallable && !isInstalled && !isIOS && (
                  <p className="w-full text-xs text-muted-foreground mt-4 font-bold flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {language === 'en' 
                      ? 'Note: If the install button is disabled, use "Add to Home Screen" in your browser menu.' 
                      : 'සටහන: Install බොත්තම ක්‍රියා විරහිත නම්, browser menu එකෙන් "Add to Home Screen" තෝරන්න.'}
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
