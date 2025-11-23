import { db } from "./db";
import { users, clients, jobs, inventoryItems } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password", 10);
    const [user] = await db.insert(users).values({
      email: "alex.tech@fibertrace.com",
      password: hashedPassword,
      name: "Alex Tech",
      role: "Senior Technician",
      phone: "+1-555-8842",
    }).returning();

    console.log("✅ Created user:", user.email);

    // Create clients
    const clientsData = await db.insert(clients).values([
      {
        name: "TechCorp Industries",
        email: "contact@techcorp.com",
        phone: "+1-555-0101",
        address: "123 Innovation Blvd, Tech City",
        package: "Enterprise",
        status: "Active",
        latitude: "40.71280000",
        longitude: "-74.00600000",
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1-555-0102",
        address: "45 Maple Ave, Suburbia",
        package: "Silver",
        status: "Overdue",
        latitude: "40.71500000",
        longitude: "-74.01000000",
      },
      {
        name: "City Library",
        email: "info@citylibrary.org",
        phone: "+1-555-0103",
        address: "88 Public Sq, Downtown",
        package: "Gold",
        status: "Active",
        latitude: "40.72000000",
        longitude: "-74.00500000",
      },
    ]).returning();

    console.log(`✅ Created ${clientsData.length} clients`);

    // Create jobs
    const jobsData = await db.insert(jobs).values([
      {
        clientId: clientsData[0].id,
        technicianId: user.id,
        type: "Install",
        status: "In Progress",
        scheduledDate: new Date(),
        address: "123 Innovation Blvd, Tech City",
        latitude: "40.71280000",
        longitude: "-74.00600000",
        notes: "Fiber drop required from pole 42.",
      },
      {
        clientId: clientsData[1].id,
        technicianId: user.id,
        type: "Repair",
        status: "Pending",
        scheduledDate: new Date(),
        address: "45 Maple Ave, Suburbia",
        latitude: "40.71500000",
        longitude: "-74.01000000",
        notes: "Customer reports high loss.",
      },
      {
        clientId: clientsData[2].id,
        technicianId: user.id,
        type: "Splice",
        status: "Completed",
        scheduledDate: new Date(Date.now() - 86400000),
        completedDate: new Date(),
        address: "88 Public Sq, Downtown",
        latitude: "40.72000000",
        longitude: "-74.00500000",
        notes: "Fusion splice completed successfully.",
      },
    ]).returning();

    console.log(`✅ Created ${jobsData.length} jobs`);

    // Create inventory items
    const inventoryData = await db.insert(inventoryItems).values([
      {
        name: "Drop Cable (2-Core)",
        category: "Cable",
        quantity: 450,
        unit: "m",
        minStockLevel: 100,
        status: "In Stock",
      },
      {
        name: "SC/APC Connectors",
        category: "Connectors",
        quantity: 12,
        unit: "pcs",
        minStockLevel: 20,
        status: "Low Stock",
      },
      {
        name: "ONU - Huawei HG8245",
        category: "Equipment",
        quantity: 5,
        unit: "units",
        minStockLevel: 3,
        status: "In Stock",
      },
      {
        name: "Fusion Splicer",
        category: "Tools",
        quantity: 1,
        unit: "unit",
        minStockLevel: 1,
        status: "In Stock",
      },
      {
        name: "LC/UPC Connectors",
        category: "Connectors",
        quantity: 85,
        unit: "pcs",
        minStockLevel: 30,
        status: "In Stock",
      },
      {
        name: "Fiber Cleaver",
        category: "Tools",
        quantity: 2,
        unit: "units",
        minStockLevel: 1,
        status: "In Stock",
      },
    ]).returning();

    console.log(`✅ Created ${inventoryData.length} inventory items`);

    console.log("🎉 Database seeded successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: alex.tech@fibertrace.com");
    console.log("   Password: password");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("✅ Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
