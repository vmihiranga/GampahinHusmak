// API Response Types

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin' | 'superadmin';
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
}

export interface Tree {
  _id: string;
  treeId: string;
  species: string;
  commonName: string;
  plantedDate: string;
  location: {
    address: string;
    coordinates: [number, number];
    district: string;
  };
  status: string;
  currentHealth: string;
  currentHeight?: number;
  images?: string[];
  notes?: string;
  plantedBy?: any; // Can be ID or populated User object
  likes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TreeUpdate {
  _id: string;
  updateDate: string;
  height: number;
  health: string;
  notes?: string;
  images?: string[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  maxParticipants?: number;
  participants: string[];
  images?: string[];
  status: string;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'seen' | 'closed';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  image?: string;
  relatedTreeId?: {
    _id: string;
    treeId: string;
    commonName: string;
    location?: {
      address: string;
      coordinates: [number, number];
    };
  };
  responses?: {
    message: string;
    respondedBy: string | any;
    respondedAt: string;
  }[];
}

export interface Stats {
  totalTrees: number;
  totalUsers: number;
  locations: number;
  co2Offset: string;
  upcomingEvents?: number;
  survivalRate?: string;
}

export interface Achievement {
  _id: string;
  userId: string;
  badgeName: string;
  badgeType: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface UserStats {
  treesPlanted: number;
  eventsAttended: number;
  updatesSubmitted: number;
  achievements: Achievement[];
  co2Offset: string;
  weatherAlert?: {
    type: string;
    message: string;
    urgency: string;
    details?: {
      temp: number;
      humidity: number;
      windSpeed: number;
      description: string;
      icon: string;
    };
  };
}

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  tags?: string[];
  likes?: string[];
  uploadedBy?: User;
  createdAt: string;
}

// API Response Wrappers
export interface AuthResponse {
  user: User;
  message?: string;
}

export interface TreesResponse {
  trees: Tree[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface TreeDetailsResponse {
  tree: Tree;
  updates: TreeUpdate[];
}

export interface EventsResponse {
  events: Event[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface GalleryResponse {
  items: GalleryItem[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface StatsResponse extends Stats {}

export interface MessageResponse {
  message: string;
}

export interface ContactActionResponse {
  message: string;
  contact: Contact;
}

export interface LeaderboardResponse {
  topPlanters: {
    _id: string;
    count: number;
    user: {
      username: string;
      fullName?: string;
      profileImage?: string;
    };
  }[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
export interface DbStatsResponse {
  collections: {
    name: string;
    count: number;
    size: number;
    avgObjSize: number;
  }[];
  database: {
    name: string;
    ok: number;
    storageSize: number;
    dataSize: number;
    indexSize: number;
    stats?: any;
  };
  server: {
    version: string;
    uptime: number;
    connections: number;
  };
}
