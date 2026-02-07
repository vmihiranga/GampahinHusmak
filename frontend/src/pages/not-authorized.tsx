import { Link } from "wouter";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

export default function NotAuthorized() {
  const { language, getPathWithLang } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <div className="h-2 bg-red-500" />
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 rounded-full">
              <ShieldAlert className="h-16 w-16 text-red-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-black text-gray-900">
              {language === 'si' ? "ඔබට අවසර නැත" : "Access Denied"}
            </h1>
            <p className="text-red-600 font-bold text-lg leading-relaxed">
              {language === 'si' 
                ? "මෙම පිටුවට ඇතුළු වීමට ඔබට අවසර නැත." 
                : "YOU DO NOT HAVE PERMISSION TO ACCESS THIS PAGE"}
            </p>
            <p className="text-muted-foreground text-sm">
              {language === 'si' 
                ? "කරුණාකර නිවැරදි ගිණුමකින් ඇතුළු වන්න." 
                : "Please make sure you are logged in with administrative privileges."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full rounded-2xl h-12 font-bold gap-2" asChild>
              <Link href={getPathWithLang("/")}>
                <Home className="w-4 h-4" />
                {language === 'si' ? "මුල් පිටුවට" : "Back to Home"}
              </Link>
            </Button>
            <Button variant="outline" className="w-full rounded-2xl h-12 font-bold" asChild>
              <Link href={getPathWithLang("/auth")}>
                {language === 'si' ? "ඇතුළු වන්න" : "Login"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
