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

export default function Auth() {
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
      await authAPI.login(data);
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      // Reload to update auth state
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
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
        title: "Registration successful!",
        description: "Welcome to Gampahin Husmak!",
      });
      // Reload to update auth state
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
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

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to manage your trees and contributions.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">Sign In</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join the initiative and start planting today.</CardDescription>
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
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">Optional profile picture</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" placeholder="Saman" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" placeholder="Perera" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" placeholder="samanp" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-reg">Email</Label>
                      <Input id="email-reg" name="email" type="email" placeholder="saman@example.com" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" name="phoneNumber" placeholder="0712345678" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nic">NIC Number <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                        <Input id="nic" name="nic" placeholder="National ID" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine">Address Line <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                      <Input id="addressLine" name="addressLine" placeholder="123, Main Street" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                        <Input id="city" name="city" placeholder="Gampaha" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Province <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                        <Input id="province" name="province" placeholder="Western Province" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-reg">Password</Label>
                      <Input id="password-reg" name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">Create Account</Button>
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
