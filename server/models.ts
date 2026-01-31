import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user' | 'volunteer' | 'superadmin';
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'volunteer', 'superadmin'], default: 'user' },
  phoneNumber: { type: String },
  address: { type: String },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Tree Schema
export interface ITree extends Document {
  treeId: string;
  plantedBy: mongoose.Types.ObjectId;
  species: string;
  commonName: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    district: string;
  };
  plantedDate: Date;
  currentHeight?: number;
  currentHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'dead';
  images: string[];
  notes?: string;
  qrCode?: string;
  status: 'active' | 'removed' | 'dead';
  createdAt: Date;
  updatedAt: Date;
}

const TreeSchema = new Schema<ITree>({
  treeId: { type: String, required: true, unique: true },
  plantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String, required: true },
  commonName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
    district: { type: String, default: 'Gampaha' },
  },
  plantedDate: { type: Date, required: true, default: Date.now },
  currentHeight: { type: Number },
  currentHealth: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'dead'], 
    default: 'good' 
  },
  images: [{ type: String }],
  notes: { type: String },
  qrCode: { type: String },
  status: { type: String, enum: ['active', 'removed', 'dead'], default: 'active' },
}, { timestamps: true });

TreeSchema.index({ location: '2dsphere' });

// Tree Update/Progress Schema
export interface ITreeUpdate extends Document {
  treeId: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  updateDate: Date;
  height?: number;
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'dead';
  images: string[];
  notes?: string;
  issues?: string[];
  createdAt: Date;
}

const TreeUpdateSchema = new Schema<ITreeUpdate>({
  treeId: { type: Schema.Types.ObjectId, ref: 'Tree', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updateDate: { type: Date, required: true, default: Date.now },
  height: { type: Number },
  health: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'dead'], 
    required: true 
  },
  images: [{ type: String }],
  notes: { type: String },
  issues: [{ type: String }],
}, { timestamps: true });

// Event Schema
export interface IEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  organizer: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  maxParticipants?: number;
  targetTrees?: number;
  actualTrees?: number;
  images: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventDate: { type: Date, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: { type: [Number] },
  },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number },
  targetTrees: { type: Number },
  actualTrees: { type: Number, default: 0 },
  images: [{ type: String }],
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
}, { timestamps: true });

// Gallery Schema
export interface IGallery extends Document {
  title: string;
  description?: string;
  images: string[];
  uploadedBy: mongoose.Types.ObjectId;
  relatedTree?: mongoose.Types.ObjectId;
  relatedEvent?: mongoose.Types.ObjectId;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String, required: true }],
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  relatedTree: { type: Schema.Types.ObjectId, ref: 'Tree' },
  relatedEvent: { type: Schema.Types.ObjectId, ref: 'Event' },
  tags: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Contact/Inquiry Schema
export interface IContact extends Document {
  userId?: mongoose.Types.ObjectId;
  relatedTreeId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  image?: string;
  status: 'new' | 'read' | 'replied' | 'seen' | 'closed';
  reply?: string; // Kept for legacy compatibility
  repliedBy?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  responses: {
    message: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  }[];
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  relatedTreeId: { type: Schema.Types.ObjectId, ref: 'Tree' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['new', 'read', 'replied', 'seen', 'closed'], default: 'new' },
  reply: { type: String },
  repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  repliedAt: { type: Date },
  responses: [{
    message: { type: String, required: true },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    respondedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Achievement/Badge Schema
export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeName: string;
  badgeType: 'trees_planted' | 'events_attended' | 'updates_submitted' | 'special';
  description: string;
  icon: string;
  earnedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeName: { type: String, required: true },
  badgeType: { 
    type: String, 
    enum: ['trees_planted', 'events_attended', 'updates_submitted', 'special'], 
    required: true 
  },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

// Export Models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Tree = mongoose.models.Tree || mongoose.model<ITree>('Tree', TreeSchema);
export const TreeUpdate = mongoose.models.TreeUpdate || mongoose.model<ITreeUpdate>('TreeUpdate', TreeUpdateSchema);
export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export const Gallery = mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
export const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
