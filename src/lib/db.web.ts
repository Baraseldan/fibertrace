import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Route {
  id: number;
  name: string;
  route_type: string;
  status: string;
  length_meters: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Node {
  id: number;
  name: string;
  node_type: string;
  latitude: number;
  longitude: number;
  power_rating: number;
  status: string;
  route_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  assigned_to: number | null;
  route_id: number | null;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Closure {
  id: number;
  name: string;
  location: string;
  fiber_count: number;
  status: string;
  route_id: number | null;
  created_at: string;
  updated_at: string;
}

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Database {
  users: User[];
  routes: Route[];
  nodes: Node[];
  jobs: Job[];
  closures: Closure[];
  inventory: InventoryItem[];
}

const DB_KEY = 'fibertrace_db';

let db: Database = {
  users: [],
  routes: [],
  nodes: [],
  jobs: [],
  closures: [],
  inventory: [],
};

let initialized = false;
let nextId = { users: 1, routes: 1, nodes: 1, jobs: 1, closures: 1, inventory: 1 };

async function loadDatabase(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      db = parsed.db || db;
      nextId = parsed.nextId || nextId;
    }
  } catch (error) {
    console.log('No existing database found, creating new one');
  }
}

async function saveDatabase(): Promise<void> {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify({ db, nextId }));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;
  
  await loadDatabase();
  
  if (db.users.length === 0) {
    const now = new Date().toISOString();
    
    db.users = [
      {
        id: nextId.users++,
        full_name: 'Admin User',
        email: 'admin@fibertrace.app',
        phone: '555-0001',
        password_hash: bcrypt.hashSync('admin123456', 10),
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.users++,
        full_name: 'John Tech',
        email: 'john@fibertrace.app',
        phone: '555-0002',
        password_hash: bcrypt.hashSync('tech123456', 10),
        role: 'technician',
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.users++,
        full_name: 'Jane Field',
        email: 'jane@fibertrace.app',
        phone: '555-0003',
        password_hash: bcrypt.hashSync('field123456', 10),
        role: 'field_tech',
        created_at: now,
        updated_at: now,
      },
    ];
    
    db.routes = [
      {
        id: nextId.routes++,
        name: 'Main Backbone Route',
        route_type: 'Backbone',
        status: 'active',
        length_meters: 15000,
        description: 'Primary fiber route',
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.routes++,
        name: 'Distribution Loop A',
        route_type: 'Distribution',
        status: 'active',
        length_meters: 8500,
        description: 'Secondary distribution',
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.routes++,
        name: 'Access Network B',
        route_type: 'Access',
        status: 'active',
        length_meters: 3200,
        description: 'End user access route',
        created_at: now,
        updated_at: now,
      },
    ];
    
    db.nodes = [
      {
        id: nextId.nodes++,
        name: 'OLT Central',
        node_type: 'OLT',
        latitude: 37.7749,
        longitude: -122.4194,
        power_rating: 48,
        status: 'active',
        route_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.nodes++,
        name: 'Splitter Node 1',
        node_type: 'Splitter',
        latitude: 37.7750,
        longitude: -122.4195,
        power_rating: 24,
        status: 'active',
        route_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.nodes++,
        name: 'FAT Hub',
        node_type: 'FAT',
        latitude: 37.7751,
        longitude: -122.4196,
        power_rating: 12,
        status: 'active',
        route_id: 2,
        created_at: now,
        updated_at: now,
      },
    ];
    
    db.jobs = [
      {
        id: nextId.jobs++,
        title: 'Fiber Installation',
        description: 'Install new fiber segment',
        status: 'pending',
        assigned_to: 2,
        route_id: 1,
        priority: 'high',
        due_date: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: nextId.jobs++,
        title: 'Maintenance Check',
        description: 'Routine equipment inspection',
        status: 'in_progress',
        assigned_to: 3,
        route_id: 2,
        priority: 'normal',
        due_date: null,
        created_at: now,
        updated_at: now,
      },
    ];
    
    await saveDatabase();
  }
  
  initialized = true;
}

export async function registerUser(data: { full_name: string; email: string; phone?: string; password: string; role?: string }) {
  await initializeDatabase();
  
  const existingUser = db.users.find(u => u.email === data.email);
  if (existingUser) {
    throw { success: false, error: 'Email already registered' };
  }
  
  const now = new Date().toISOString();
  const user: User = {
    id: nextId.users++,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || '',
    password_hash: bcrypt.hashSync(data.password, 10),
    role: data.role || 'technician',
    created_at: now,
    updated_at: now,
  };
  
  db.users.push(user);
  await saveDatabase();
  
  return {
    success: true,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function loginUser(email: string, password: string) {
  await initializeDatabase();
  
  const user = db.users.find(u => u.email === email);
  if (!user) {
    throw { success: false, error: 'User not found' };
  }
  
  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    throw { success: false, error: 'Invalid credentials' };
  }
  
  return {
    success: true,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getRoutes() {
  await initializeDatabase();
  return { routes: [...db.routes].sort((a, b) => b.id - a.id) };
}

export async function getRoute(id: number) {
  await initializeDatabase();
  const route = db.routes.find(r => r.id === id);
  if (!route) throw new Error('Route not found');
  return route;
}

export async function createRoute(data: any) {
  await initializeDatabase();
  const now = new Date().toISOString();
  const route: Route = {
    id: nextId.routes++,
    name: data.name,
    route_type: data.route_type || '',
    status: data.status || 'active',
    length_meters: data.length_meters || 0,
    description: data.description || '',
    created_at: now,
    updated_at: now,
  };
  db.routes.push(route);
  await saveDatabase();
  return route;
}

export async function updateRoute(id: number, data: any) {
  await initializeDatabase();
  const index = db.routes.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Route not found');
  
  db.routes[index] = {
    ...db.routes[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDatabase();
  return db.routes[index];
}

export async function deleteRoute(id: number) {
  await initializeDatabase();
  db.routes = db.routes.filter(r => r.id !== id);
  await saveDatabase();
  return { success: true };
}

export async function getNodes() {
  await initializeDatabase();
  return { nodes: [...db.nodes].sort((a, b) => b.id - a.id) };
}

export async function getNode(id: number) {
  await initializeDatabase();
  const node = db.nodes.find(n => n.id === id);
  if (!node) throw new Error('Node not found');
  return node;
}

export async function createNode(data: any) {
  await initializeDatabase();
  const now = new Date().toISOString();
  const node: Node = {
    id: nextId.nodes++,
    name: data.name,
    node_type: data.node_type || '',
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    power_rating: data.power_rating || 0,
    status: data.status || 'active',
    route_id: data.route_id || null,
    created_at: now,
    updated_at: now,
  };
  db.nodes.push(node);
  await saveDatabase();
  return node;
}

export async function updateNode(id: number, data: any) {
  await initializeDatabase();
  const index = db.nodes.findIndex(n => n.id === id);
  if (index === -1) throw new Error('Node not found');
  
  db.nodes[index] = {
    ...db.nodes[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDatabase();
  return db.nodes[index];
}

export async function getJobs() {
  await initializeDatabase();
  return { jobs: [...db.jobs].sort((a, b) => b.id - a.id) };
}

export async function getJob(id: number) {
  await initializeDatabase();
  const job = db.jobs.find(j => j.id === id);
  if (!job) throw new Error('Job not found');
  return job;
}

export async function createJob(data: any) {
  await initializeDatabase();
  const now = new Date().toISOString();
  const job: Job = {
    id: nextId.jobs++,
    title: data.title,
    description: data.description || '',
    status: data.status || 'pending',
    assigned_to: data.assigned_to || null,
    route_id: data.route_id || null,
    priority: data.priority || 'normal',
    due_date: data.due_date || null,
    created_at: now,
    updated_at: now,
  };
  db.jobs.push(job);
  await saveDatabase();
  return job;
}

export async function updateJob(id: number, data: any) {
  await initializeDatabase();
  const index = db.jobs.findIndex(j => j.id === id);
  if (index === -1) throw new Error('Job not found');
  
  db.jobs[index] = {
    ...db.jobs[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDatabase();
  return db.jobs[index];
}

export async function getClosures() {
  await initializeDatabase();
  return { closures: [...db.closures].sort((a, b) => b.id - a.id) };
}

export async function createClosure(data: any) {
  await initializeDatabase();
  const now = new Date().toISOString();
  const closure: Closure = {
    id: nextId.closures++,
    name: data.name,
    location: data.location || '',
    fiber_count: data.fiber_count || 0,
    status: data.status || 'active',
    route_id: data.route_id || null,
    created_at: now,
    updated_at: now,
  };
  db.closures.push(closure);
  await saveDatabase();
  return closure;
}

export async function getInventory() {
  await initializeDatabase();
  return { inventory: [...db.inventory].sort((a, b) => b.id - a.id) };
}

export async function createInventoryItem(data: any) {
  await initializeDatabase();
  const now = new Date().toISOString();
  const item: InventoryItem = {
    id: nextId.inventory++,
    name: data.name,
    quantity: data.quantity || 0,
    location: data.location || '',
    status: data.status || 'available',
    created_at: now,
    updated_at: now,
  };
  db.inventory.push(item);
  await saveDatabase();
  return item;
}

export async function getMapData() {
  await initializeDatabase();
  const routes = db.routes.filter(r => r.status === 'active').map(route => {
    const nodes = db.nodes.filter(n => n.route_id === route.id && n.status === 'active');
    return {
      id: route.id,
      routeName: route.name,
      nodes: nodes.map(n => ({
        nodeId: n.id,
        nodeName: n.name,
        latitude: n.latitude,
        longitude: n.longitude,
        node_type: n.node_type,
      })),
    };
  });
  return { routes };
}

export async function getStats() {
  await initializeDatabase();
  return {
    totalRoutes: db.routes.filter(r => r.status === 'active').length,
    totalNodes: db.nodes.filter(n => n.status === 'active').length,
    pendingJobs: db.jobs.filter(j => j.status === 'pending').length,
    inProgressJobs: db.jobs.filter(j => j.status === 'in_progress').length,
  };
}
