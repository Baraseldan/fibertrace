import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Technician"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clients Table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  package: text("package").notNull().default("Bronze"),
  status: text("status").notNull().default("Active"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Jobs Table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  technicianId: integer("technician_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Pending"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  cableUsed: text("cable_used"),
  materialsUsed: text("materials_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Job Photos Table
export const jobPhotos = pgTable("job_photos", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  photoType: text("photo_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertJobPhotoSchema = createInsertSchema(jobPhotos).omit({ 
  id: true, 
  uploadedAt: true 
});
export type InsertJobPhoto = z.infer<typeof insertJobPhotoSchema>;
export type JobPhoto = typeof jobPhotos.$inferSelect;

// Meter Readings Table
export const meterReadings = pgTable("meter_readings", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  deviceName: text("device_name"),
  readingType: text("reading_type").notNull(),
  lossDbm: decimal("loss_dbm", { precision: 6, scale: 2 }),
  distanceMeters: decimal("distance_meters", { precision: 10, scale: 2 }),
  eventMarkers: text("event_markers"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMeterReadingSchema = createInsertSchema(meterReadings).omit({ 
  id: true, 
  timestamp: true 
});
export type InsertMeterReading = z.infer<typeof insertMeterReadingSchema>;
export type MeterReading = typeof meterReadings.$inferSelect;

// Inventory Items Table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  status: text("status").notNull().default("In Stock"),
  lastRestocked: timestamp("last_restocked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Inventory Usage Log Table
export const inventoryUsage = pgTable("inventory_usage", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  quantityUsed: integer("quantity_used").notNull(),
  usedBy: integer("used_by").references(() => users.id).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

export const insertInventoryUsageSchema = createInsertSchema(inventoryUsage).omit({ 
  id: true, 
  usedAt: true 
});
export type InsertInventoryUsage = z.infer<typeof insertInventoryUsageSchema>;
export type InventoryUsage = typeof inventoryUsage.$inferSelect;
