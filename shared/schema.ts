import { z } from "zod";

// User Schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Tree Schemas
export const createTreeSchema = z.object({
  species: z.string().min(2),
  commonName: z.string().min(2),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string(),
    district: z.string().default("Gampaha"),
  }),
  plantedDate: z.string().or(z.date()).optional(),
  currentHeight: z.number().optional(),
  currentHealth: z.enum(["excellent", "good", "fair", "poor", "dead"]).default("good"),
  images: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const updateTreeSchema = z.object({
  height: z.number().optional(),
  health: z.enum(["excellent", "good", "fair", "poor", "dead"]),
  images: z.array(z.string()).default([]),
  notes: z.string().optional(),
  issues: z.array(z.string()).optional(),
});

// Event Schemas
export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string().or(z.date()),
  location: z.object({
    address: z.string(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }),
  maxParticipants: z.number().optional(),
  targetTrees: z.number().optional(),
  images: z.array(z.string()).default([]),
});

// Gallery Schema
export const createGallerySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  images: z.array(z.string()).min(1),
  relatedTree: z.string().optional(),
  relatedEvent: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Contact Schema
export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTreeInput = z.infer<typeof createTreeSchema>;
export type UpdateTreeInput = z.infer<typeof updateTreeSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
