import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const toneSchema = z.enum(["professional", "casual", "urgent", "luxury"]);

export const adCopySchema = z.object({
  headline: z.string(),
  description: z.string(),
  callToAction: z.string(),
  variations: z.array(z.string()),
  visualPrompts: z.array(z.string()),
  hashtags: z.array(z.string()),
});

export const generateAdRequestSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  tone: toneSchema,
});

export const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  productName: z.string().optional(),
});

export const videoGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export const videoScriptRequestSchema = z.object({
  productName: z.string(),
  headline: z.string(),
  description: z.string(),
  callToAction: z.string(),
});

export const newspaperAdRequestSchema = z.object({
  productName: z.string(),
  headline: z.string(),
  description: z.string(),
});

export const socialPostsRequestSchema = z.object({
  productName: z.string(),
  headline: z.string(),
  description: z.string(),
});

export const eventPosterRequestSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  venue: z.string().min(1, "Venue is required"),
  description: z.string().min(1, "Description is required"),
  theme: z.enum(["CORPORATE", "FESTIVAL", "CONCERT", "CONFERENCE"]),
  primaryColor: z.string().min(1, "Primary color is required"),
});

export const adCampaignSchema = z.object({
  productName: z.string(),
  tone: toneSchema,
  adCopy: adCopySchema,
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  generatedAt: z.string(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  tone: text("tone").notNull(),
  adCopy: jsonb("ad_copy").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export type Tone = z.infer<typeof toneSchema>;
export type AdCopy = z.infer<typeof adCopySchema>;
export type GenerateAdRequest = z.infer<typeof generateAdRequestSchema>;
export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;
export type VideoGenerationRequest = z.infer<typeof videoGenerationRequestSchema>;
export type AdCampaign = z.infer<typeof adCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type EventPosterRequest = z.infer<typeof eventPosterRequestSchema>;
