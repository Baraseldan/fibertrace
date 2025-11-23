import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { insertUserSchema, insertClientSchema, insertJobSchema, insertInventoryItemSchema, insertMeterReadingSchema, insertInventoryUsageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(data.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      if (req.session) {
        req.session.userId = user.id;
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Client Routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.updateClient(parseInt(req.params.id), req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteClient(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Job Routes
  app.get("/api/jobs", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getJobsByTechnician(req.session!.userId!);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      const data = insertJobSchema.parse({
        ...req.body,
        technicianId: req.session!.userId,
      });
      const job = await storage.createJob(data);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const job = await storage.updateJob(parseInt(req.params.id), req.body);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteJob(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json({ message: "Job deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Inventory Routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getInventoryItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory", requireAuth, async (req, res) => {
    try {
      const data = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(parseInt(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteInventoryItem(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory/use", requireAuth, async (req, res) => {
    try {
      const data = insertInventoryUsageSchema.parse({
        ...req.body,
        usedBy: req.session!.userId,
      });
      await storage.useInventoryItem(data);
      res.json({ message: "Inventory updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Meter Readings Routes
  app.get("/api/meter-readings/:jobId", requireAuth, async (req, res) => {
    try {
      const readings = await storage.getMeterReadingsByJob(parseInt(req.params.jobId));
      res.json(readings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/meter-readings", requireAuth, async (req, res) => {
    try {
      const data = insertMeterReadingSchema.parse(req.body);
      const reading = await storage.createMeterReading(data);
      res.status(201).json(reading);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics/Stats Routes
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getJobStatsByTechnician(req.session!.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
