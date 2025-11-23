import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Client,
  type InsertClient,
  type Job,
  type InsertJob,
  type InventoryItem,
  type InsertInventoryItem,
  type MeterReading,
  type InsertMeterReading,
  type InsertInventoryUsage,
  users,
  clients,
  jobs,
  inventoryItems,
  meterReadings,
  inventoryUsage,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Jobs
  getJobs(): Promise<Array<Job & { clientName: string }>>;
  getJobsByTechnician(technicianId: number): Promise<Array<Job & { clientName: string }>>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  useInventoryItem(usage: InsertInventoryUsage): Promise<void>;

  // Meter Readings
  getMeterReadingsByJob(jobId: number): Promise<MeterReading[]>;
  createMeterReading(reading: InsertMeterReading): Promise<MeterReading>;

  // Analytics
  getJobStatsByTechnician(technicianId: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  // Jobs
  async getJobs(): Promise<Array<Job & { clientName: string }>> {
    const result = await db
      .select({
        id: jobs.id,
        clientId: jobs.clientId,
        technicianId: jobs.technicianId,
        type: jobs.type,
        status: jobs.status,
        scheduledDate: jobs.scheduledDate,
        completedDate: jobs.completedDate,
        address: jobs.address,
        latitude: jobs.latitude,
        longitude: jobs.longitude,
        notes: jobs.notes,
        cableUsed: jobs.cableUsed,
        materialsUsed: jobs.materialsUsed,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        clientName: clients.name,
      })
      .from(jobs)
      .leftJoin(clients, eq(jobs.clientId, clients.id))
      .orderBy(desc(jobs.scheduledDate));
    
    return result.map((r: any) => ({
      ...r,
      clientName: r.clientName || 'Unknown Client'
    }));
  }

  async getJobsByTechnician(technicianId: number): Promise<Array<Job & { clientName: string }>> {
    const result = await db
      .select({
        id: jobs.id,
        clientId: jobs.clientId,
        technicianId: jobs.technicianId,
        type: jobs.type,
        status: jobs.status,
        scheduledDate: jobs.scheduledDate,
        completedDate: jobs.completedDate,
        address: jobs.address,
        latitude: jobs.latitude,
        longitude: jobs.longitude,
        notes: jobs.notes,
        cableUsed: jobs.cableUsed,
        materialsUsed: jobs.materialsUsed,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        clientName: clients.name,
      })
      .from(jobs)
      .leftJoin(clients, eq(jobs.clientId, clients.id))
      .where(eq(jobs.technicianId, technicianId))
      .orderBy(desc(jobs.scheduledDate));
    
    return result.map((r: any) => ({
      ...r,
      clientName: r.clientName || 'Unknown Client'
    }));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return result[0];
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return db.select().from(inventoryItems).orderBy(inventoryItems.name);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const result = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
    return result[0];
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const result = await db.insert(inventoryItems).values(item).returning();
    return result[0];
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    // Auto-update status based on quantity
    const updates: any = { ...item };
    if (item.quantity !== undefined) {
      const currentItem = await this.getInventoryItem(id);
      if (currentItem) {
        if (item.quantity === 0) {
          updates.status = 'Out of Stock';
        } else if (item.quantity < currentItem.minStockLevel) {
          updates.status = 'Low Stock';
        } else {
          updates.status = 'In Stock';
        }
      }
    }

    const result = await db.update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return result[0];
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
    return result.length > 0;
  }

  async useInventoryItem(usage: InsertInventoryUsage): Promise<void> {
    await db.transaction(async (tx: any) => {
      // Log the usage
      await tx.insert(inventoryUsage).values(usage);
      
      // Update inventory quantity
      const item = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, usage.itemId)).limit(1);
      if (item[0]) {
        const newQuantity = item[0].quantity - usage.quantityUsed;
        await tx.update(inventoryItems)
          .set({ quantity: newQuantity })
          .where(eq(inventoryItems.id, usage.itemId));
      }
    });
  }

  // Meter Readings
  async getMeterReadingsByJob(jobId: number): Promise<MeterReading[]> {
    return db.select().from(meterReadings)
      .where(eq(meterReadings.jobId, jobId))
      .orderBy(desc(meterReadings.timestamp));
  }

  async createMeterReading(reading: InsertMeterReading): Promise<MeterReading> {
    const result = await db.insert(meterReadings).values(reading).returning();
    return result[0];
  }

  // Analytics
  async getJobStatsByTechnician(technicianId: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }> {
    const result = await db
      .select({
        status: jobs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(jobs)
      .where(eq(jobs.technicianId, technicianId))
      .groupBy(jobs.status);

    const stats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    for (const row of result) {
      const count = Number(row.count);
      stats.total += count;
      if (row.status === 'Pending') stats.pending = count;
      if (row.status === 'In Progress') stats.inProgress = count;
      if (row.status === 'Completed') stats.completed = count;
    }

    return stats;
  }
}

export const storage = new DatabaseStorage();
