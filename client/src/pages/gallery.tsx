import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000", title: "Community Planting Event" },
  { url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1000", title: "Sapling Nursery" },
  { url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000", title: "Forest Restoration" },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000", title: "Green Gampaha" },
  { url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1000", title: "Young Volunteers" },
  { url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1000", title: "Sustainable Future" },
];

export default function Gallery() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Visual Gallery</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Glimpses of our community's journey towards a greener Gampaha.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((img, i) => (
            <Card key={i} className="overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">{img.title}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
