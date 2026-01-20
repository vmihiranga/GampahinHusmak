export const USERS = [
  { id: 1, name: "Saman Perera", email: "saman@example.com", role: "user", status: "approved" },
  { id: 2, name: "Admin User", email: "admin@example.com", role: "admin", status: "active" },
  { id: 3, name: "Super Admin", email: "super@example.com", role: "super_admin", status: "active" },
  { id: 4, name: "Kamal Gunarathne", email: "kamal@example.com", role: "user", status: "pending" },
];

export const TREES = [
  {
    id: 1,
    userId: 1,
    type: "Mee (Madhuca longifolia)",
    plantedAt: "2025-01-15",
    location: "Gampaha Botanical Gardens",
    coordinates: { lat: 7.0917, lng: 79.9999 },
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000",
    status: "healthy",
    updates: 2,
    gallery: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: 2,
    userId: 1,
    type: "Kumbuk (Terminalia arjuna)",
    plantedAt: "2025-02-01",
    location: "Wathupitiwala Hospital Grounds",
    coordinates: { lat: 7.1500, lng: 80.1000 },
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1000",
    status: "needs_attention",
    updates: 0,
    gallery: [
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000"
    ]
  }
];

export const REQUESTS = [
  {
    id: 1,
    userId: 1,
    treeId: 2,
    type: "damaged",
    description: "A branch was broken during the recent storm.",
    status: "pending",
    date: "2025-02-10",
  }
];

export const STATS = {
  totalTrees: 1250,
  activeUsers: 450,
  locations: 18,
  co2Offset: "12.5 tons"
};
