import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Show banner after a small delay if installable and not already installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        // Check local storage to see if user dismissed it recently
        const dismissed = localStorage.getItem("pwa-banner-dismissed");
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for 24 hours
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  const handleInstall = () => {
    installPWA();
    setShowBanner(false);
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px] z-[100]"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-primary/20 p-5 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-black text-foreground text-base leading-tight">
                  {language === 'en' ? 'Install Gampahin Husmak' : 'ගම්පහින් හුස්මක් ස්ථාපනය කරන්න'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium leading-snug">
                  {language === 'en' ? 'Get the best experience by installing our app on your device.' : 'අපගේ යෙදුම ඔබේ උපාංගයට ස්ථාපනය කිරීමෙන් ඉහළම අත්දැකීම ලබා ගන්න.'}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleInstall}
                    className="flex-1 rounded-xl h-10 font-bold gap-2 shadow-lg shadow-primary/20"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'en' ? 'Install Now' : 'දැන් ස්ථාපනය කරන්න'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
