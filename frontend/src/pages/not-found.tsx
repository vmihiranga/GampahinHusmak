import { Link } from "wouter";
import { Search, Home, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function NotFound() {
  const { language, getPathWithLang } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdfdfd] p-6 text-center">
      <div className="relative mb-8">
        <div className="text-[150px] md:text-[200px] font-black text-primary/10 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center pt-8">
          <Search className="w-20 h-20 md:w-28 md:h-28 text-primary animate-bounce-slow" />
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900">
          {language === 'si' ? "පිටුව හමු නොවීය" : "Page Not Found"}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {language === 'si' 
            ? "ඔබ සොයන පිටුව ඉවත් කර හෝ එහි නම වෙනස් කර තිබිය හැක. නැවත පරීක්ෂා කර බලන්න." 
            : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button className="rounded-2xl h-12 px-8 font-bold gap-2 group shadow-lg shadow-primary/20" asChild>
            <Link href={getPathWithLang("/")}>
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {language === 'si' ? "මුල් පිටුවට" : "Back to Home"}
            </Link>
          </Button>
          <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold gap-2 border-2" onClick={() => window.history.back()}>
            <ChevronLeft className="w-4 h-4" />
            {language === 'si' ? "ආපසු" : "Go Back"}
          </Button>
        </div>
      </div>
      
      <div className="mt-16 text-primary/40 font-bold uppercase tracking-[0.2em] text-xs">
        System Error 404
      </div>
    </div>
  );
}
