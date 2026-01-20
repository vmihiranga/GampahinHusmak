import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Globe, Code, Heart, ShieldCheck } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about the initiative? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this about?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" />
                </div>
                <Button className="w-full h-12 text-lg">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContactInfoCard icon={Phone} title="Call Us" detail="+94 33 222 2222" />
              <ContactInfoCard icon={Mail} title="Email" detail="info@gampahinhusmak.lk" />
              <ContactInfoCard icon={MapPin} title="Location" detail="District Secretariat, Gampaha" />
              <ContactInfoCard icon={Globe} title="Website" detail="www.gampahinhusmak.lk" />
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-4">Our Commitment</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are dedicated to responding to all inquiries within 24 hours. Your feedback helps us build a greener future for Gampaha.
              </p>
            </div>
          </div>
        </div>

        {/* Support & Partners Section */}
        <div className="pt-16 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Supporting People */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Heart className="w-8 h-8" />
                <h3 className="font-heading font-bold text-2xl uppercase tracking-wider">Supporting People</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground text-lg">
                <li>Local Community Volunteers</li>
                <li>District Agricultural Officers</li>
                <li>Environmental Activists</li>
                <li>University Researchers</li>
              </ul>
            </div>

            {/* Sponsors */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="w-8 h-8" />
                <h3 className="font-heading font-bold text-2xl uppercase tracking-wider">Our Sponsors</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground text-lg">
                <li className="font-bold text-foreground text-xl">Lions Club Of Gampaha Metro Juniors</li>
                <li>State Ministry of Environment</li>
                <li>Private Sector Partners</li>
                <li>Local Business Councils</li>
              </ul>
            </div>

            {/* Development Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Code className="w-8 h-8" />
                <h3 className="font-heading font-bold text-2xl uppercase tracking-wider">Web App Info</h3>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Gampahin Husmak is a Progressive Web Application (PWA) built for high-performance and environmental impact tracking.
                </p>
                <div className="p-6 bg-muted rounded-2xl border-2 border-primary/20 shadow-inner">
                  <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Developed by</p>
                  <p className="text-2xl font-black text-primary tracking-tight">DEVELOPER TEAM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ContactInfoCard({ icon: Icon, title, detail }: { icon: any, title: string, detail: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-sm font-semibold text-foreground">{detail}</p>
      </div>
    </div>
  );
}
