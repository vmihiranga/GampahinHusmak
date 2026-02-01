import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Globe, Code, Heart, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Contact() {
  const { t } = useLanguage();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold">{t.contact.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>{t.contact.form_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.contact.name}</Label>
                    <Input id="name" placeholder={t.contact.placeholder_name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.contact.email}</Label>
                    <Input id="email" type="email" placeholder={t.contact.placeholder_email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t.contact.subject}</Label>
                  <Input id="subject" placeholder={t.contact.placeholder_subject} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t.contact.message}</Label>
                  <Textarea id="message" placeholder={t.contact.placeholder_message} className="min-h-[150px]" />
                </div>
                <Button className="w-full h-12 text-lg">{t.contact.send_button}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContactInfoCard icon={Phone} title={t.contact.call_us} detail="+94 33 222 2222" />
              <ContactInfoCard icon={Mail} title={t.contact.email} detail="info@gampahinhusmak.lk" />
              <ContactInfoCard icon={MapPin} title={t.contact.location} detail={t.footer.address} />
              <ContactInfoCard icon={Globe} title={t.contact.website} detail="www.gampahinhusmak.lk" />
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-4">{t.contact.commitment_title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t.contact.commitment_desc}
              </p>
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
