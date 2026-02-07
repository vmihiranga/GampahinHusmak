import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Leaf, Upload, User } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function Auth() {
  const { t, language } = useLanguage();
  const [_, setLocation] = useLocation();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await authAPI.login(data);
      toast({
        title: language === 'en' ? "Login successful!" : language === 'si' ? "ඇතුළුවීම සාර්ථකයි!" : "உள்நுழைவு வெற்றிகரமாக முடிந்தது!",
        description: language === 'en' ? "Welcome back!" : language === 'si' ? "නැවතත් සාදරයෙන් පිළිගනිමු!" : "மீண்டும் வருக!",
      });
      
      // Redirect based on role and verification status
      if (response.user) {
        if (response.user.role === 'admin' || response.user.role === 'superadmin') {
          window.location.href = "/admin";
        } else if (!response.user.isVerified) {
          window.location.href = "/pending-approval";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? "Login failed" : language === 'si' ? "ඇතුළුවීම අසාර්ථකයි" : "உள்நுழைவு தோல்வியடைந்தது",
        description: error.message || (language === 'en' ? "Invalid credentials" : language === 'si' ? "වැරදි තොරතුරු" : "தவறான சான்றுகள்"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let profileImageUrl = "";
    
    try {
      // 1. Upload profile image if exists
      if (profileImageFile) {
        const imgFormData = new FormData();
        imgFormData.append("image", profileImageFile);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
          method: "POST",
          body: imgFormData,
        });
        
        const resData = await response.json();
        if (resData.success) {
          profileImageUrl = resData.data.url;
        }
      }

      // 2. Register user
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Combine address fields
      const addressLine = formData.get('addressLine') || '';
      const city = formData.get('city') || '';
      const province = formData.get('province') || '';
      const fullAddress = [addressLine, city, province].filter(Boolean).join(', ');
      
      const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        phoneNumber: formData.get('phoneNumber'),
        address: fullAddress || undefined,
        profileImage: profileImageUrl || undefined,
      };

      await authAPI.register(data);
      toast({
        title: language === 'en' ? "Registration successful!" : language === 'si' ? "ලියාපදිංචිය සාර්ථකයි!" : "பதிவு வெற்றிகரமாக முடிந்தது!",
        description: language === 'en' ? "Welcome to Gampahin Husmak!" : language === 'si' ? "ගම්පහින් හුස්මක් වෙත ඔබව සාදරයෙන් පිළිගනිමු!" : "கம்பஹின் ஹுஸ்மக்கிற்கு வரவேற்கிறோம்!",
      });
      // Reload to update auth state
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: language === 'en' ? "Registration failed" : language === 'si' ? "ලියාපදිංචිය අසාර්ථකයි" : "பதிவு தோல்வியடைந்தது",
        description: error.message || (language === 'en' ? "Please try again" : language === 'si' ? "කරුණාකර නැවත උත්සාහ කරන්න" : "மீண்டும் முயற்சிக்கவும்"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get('mode') === 'register' ? 'register' : 'login';

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {defaultTab === 'login' ? t.auth.login.welcome : t.auth.register.welcome}
            </h1>
            <p className="text-muted-foreground">
              {defaultTab === 'login' 
                ? t.auth.login.subtitle
                : t.auth.register.subtitle}
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">{t.auth.tabs.login}</TabsTrigger>
              <TabsTrigger value="register">{t.auth.tabs.register}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t.auth.login.title}</CardTitle>
                  <CardDescription>{t.auth.login.description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.auth.login.email}</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t.auth.login.password}</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">{t.auth.login.button}</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t.auth.register.title}</CardTitle>
                  <CardDescription>{t.auth.register.description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    {/* Profile Photo Upload */}
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="w-24 h-24 cursor-pointer" onClick={triggerFileInput}>
                        <AvatarImage src={imagePreview} alt="Profile" />
                        <AvatarFallback className="bg-primary/10">
                          {imagePreview ? (
                            <User className="w-12 h-12 text-primary" />
                          ) : (
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                      />
                      <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerFileInput}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t.auth.register.upload_photo}
                      </Button>
                      <p className="text-xs text-muted-foreground">{t.auth.register.optional_photo}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t.auth.register.first_name}</Label>
                        <Input id="firstName" name="firstName" placeholder="Saman" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t.auth.register.last_name}</Label>
                        <Input id="lastName" name="lastName" placeholder="Perera" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t.auth.register.username}</Label>
                      <Input id="username" name="username" placeholder="samanp" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-reg">{t.auth.register.email}</Label>
                      <Input id="email-reg" name="email" type="email" placeholder="saman@example.com" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">{t.auth.register.phone}</Label>
                        <Input id="phoneNumber" name="phoneNumber" placeholder="0712345678" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nic">{t.auth.register.nic}</Label>
                        <Input id="nic" name="nic" placeholder="National ID" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine">{t.auth.register.address}</Label>
                      <Input id="addressLine" name="addressLine" placeholder="123, Main Street" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t.auth.register.city}</Label>
                        <Input id="city" name="city" placeholder="Gampaha" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">{t.auth.register.province}</Label>
                        <Input id="province" name="province" placeholder="Western Province" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-reg">{t.auth.register.password}</Label>
                      <Input id="password-reg" name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">{t.auth.register.button}</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
