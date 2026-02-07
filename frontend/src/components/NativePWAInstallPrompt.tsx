import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export function NativePWAInstallPrompt() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Automatic prompt disabled as per user request.
    // The user can still use the manual install button in the PWAInstallSection.
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("native-pwa-prompt-dismissed", dismissedUntil.toString());
  };

  const handleInstall = () => {
    installPWA();
    setShowPrompt(false);
  };

  if (isInstalled || !isInstallable) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] rounded-3xl sm:rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with logo and app name */}
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/favicon.jpg" 
                    alt="App Icon" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h2 className="text-white text-xl font-semibold mb-1">
                Gampahathuru
              </h2>
              
              <p className="text-white/60 text-sm font-normal">
                {language === 'en' ? 'gampahathuru.lk' : 'gampahathuru.lk'}
              </p>
            </div>

            {/* Description */}
            <div className="px-6 pb-6">
              <p className="text-white/80 text-[15px] leading-relaxed">
                {language === 'en' 
                  ? 'Install our app for quick and easy access to track your planted trees and monitor environmental impact.'
                  : 'ඔබේ රෝපණය කළ ගස් නිරීක්ෂණය කිරීමට සහ පාරිසරික බලපෑම නිරීක්ෂණය කිරීමට අපගේ යෙදුම ස්ථාපනය කරන්න.'
                }
              </p>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white hover:bg-white/90 text-black font-semibold rounded-full h-12 text-base shadow-lg transition-all duration-200"
              >
                {language === 'en' ? 'Install' : 'ස්ථාපනය'}
              </Button>
            </div>

            {/* Bottom indicator */}
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
