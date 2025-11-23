import { format } from 'date-fns';

// Types
export type JobStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
export type JobType = 'Install' | 'Repair' | 'Splice' | 'Survey';

export interface Job {
  id: string;
  clientName: string;
  address: string;
  type: JobType;
  status: JobStatus;
  date: string;
  coordinates: [number, number];
  notes?: string;
  readings?: {
    loss: number;
    distance: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Cable' | 'Equipment' | 'Connectors' | 'Tools';
  quantity: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Client {
  id: string;
  name: string;
  package: 'Bronze' | 'Silver' | 'Gold' | 'Enterprise';
  status: 'Active' | 'Pending' | 'Overdue';
  address: string;
  phone: string;
}

// Mock Data
const MOCK_JOBS: Job[] = [
  {
    id: 'JOB-1024',
    clientName: 'TechCorp Industries',
    address: '123 Innovation Blvd, Tech City',
    type: 'Install',
    status: 'In Progress',
    date: format(new Date(), 'yyyy-MM-dd'),
    coordinates: [40.7128, -74.0060],
    notes: 'Fiber drop required from pole 42.',
  },
  {
    id: 'JOB-1025',
    clientName: 'Alice Johnson',
    address: '45 Maple Ave, Suburbia',
    type: 'Repair',
    status: 'Pending',
    date: format(new Date(), 'yyyy-MM-dd'),
    coordinates: [40.7150, -74.0100],
    notes: 'Customer reports high loss.',
  },
  {
    id: 'JOB-1026',
    clientName: 'City Library',
    address: '88 Public Sq, Downtown',
    type: 'Splice',
    status: 'Completed',
    date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'),
    coordinates: [40.7200, -74.0050],
    readings: [{ loss: 0.15, distance: 1250 }],
  },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'Drop Cable (2-Core)', category: 'Cable', quantity: 450, unit: 'm', status: 'In Stock' },
  { id: 'INV-002', name: 'SC/APC Connectors', category: 'Connectors', quantity: 12, unit: 'pcs', status: 'Low Stock' },
  { id: 'INV-003', name: 'ONU - Huawei HG8245', category: 'Equipment', quantity: 5, unit: 'units', status: 'In Stock' },
  { id: 'INV-004', name: 'Fusion Splicer', category: 'Tools', quantity: 1, unit: 'unit', status: 'In Stock' },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'CL-001', name: 'TechCorp Industries', package: 'Enterprise', status: 'Active', address: '123 Innovation Blvd', phone: '+1 555-0101' },
  { id: 'CL-002', name: 'Alice Johnson', package: 'Silver', status: 'Overdue', address: '45 Maple Ave', phone: '+1 555-0102' },
];

export const mockData = {
  jobs: MOCK_JOBS,
  inventory: MOCK_INVENTORY,
  clients: MOCK_CLIENTS,
  user: { name: 'Alex Tech', role: 'Senior Technician' }
};
