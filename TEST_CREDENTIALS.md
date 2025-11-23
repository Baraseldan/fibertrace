# FiberTrace - Test Credentials & Seeded Data

## 🔐 Test User Accounts

All users have the default password: **`password`**

### User 1: Alex Rodriguez (Senior Technician)
- **Email**: `alex.tech@fibertrace.com`
- **Password**: `password`
- **Name**: Alex Rodriguez
- **Role**: Senior Technician
- **Phone**: +1 (555) 123-4567
- **Jobs Assigned**: 4 jobs (Completed, In Progress, Pending)

### User 2: Sarah Chen (Technician)
- **Email**: `sarah.chen@fibertrace.com`
- **Password**: `password`
- **Name**: Sarah Chen
- **Role**: Technician
- **Phone**: +1 (555) 234-5678
- **Jobs Assigned**: 1 job

### User 3: Mike Johnson (Lead Technician)
- **Email**: `mike.johnson@fibertrace.com`
- **Password**: `password`
- **Name**: Mike Johnson
- **Role**: Lead Technician
- **Phone**: +1 (555) 345-6789
- **Jobs Assigned**: 1 job

---

## 🏢 Seeded Clients

### Client 1: TechCorp HQ
- **Package**: Enterprise
- **Status**: Active
- **Address**: 123 Silicon Valley Blvd, San Jose, CA 95110
- **Coordinates**: 37.33874, -121.88485
- **Phone**: +1 (555) 100-2001
- **Email**: admin@techcorp.com

### Client 2: Downtown Medical Center
- **Package**: Gold
- **Status**: Active
- **Address**: 456 Healthcare Ave, San Francisco, CA 94102
- **Coordinates**: 37.77493, -122.41942
- **Phone**: +1 (555) 200-3002
- **Email**: it@downtownmedical.com

### Client 3: StartupHub Co-working
- **Package**: Silver
- **Status**: Active
- **Address**: 789 Innovation Dr, Palo Alto, CA 94301
- **Coordinates**: 37.44188, -122.14302
- **Phone**: +1 (555) 300-4003
- **Email**: facilities@startuphub.com

### Client 4: Green Valley Apartments
- **Package**: Bronze
- **Status**: Active
- **Address**: 321 Residential St, Mountain View, CA 94040
- **Coordinates**: 37.38605, -122.08385
- **Phone**: +1 (555) 400-5004
- **Email**: manager@greenvalley.com

### Client 5: Riverside Shopping Mall
- **Package**: Gold
- **Status**: Active
- **Address**: 555 Commerce Way, San Mateo, CA 94401
- **Coordinates**: 37.56299, -122.32553
- **Phone**: +1 (555) 500-6005
- **Email**: ops@riversidemail.com

---

## 📋 Seeded Jobs

### Job #1: TechCorp HQ - Fiber Installation
- **Status**: ✅ Completed
- **Type**: Fiber Installation
- **Technician**: Alex Rodriguez
- **Scheduled**: Yesterday
- **Notes**: New fiber line installation for main building. Customer satisfied.
- **Materials**: Single-mode OS2 (500m), 10x SC connectors, 2x patch panels

### Job #2: Downtown Medical Center - Maintenance
- **Status**: 🔄 In Progress
- **Type**: Maintenance
- **Technician**: Alex Rodriguez
- **Scheduled**: Today
- **Notes**: Quarterly maintenance check. Signal degradation reported on line 3.

### Job #3: StartupHub Co-working - Troubleshooting
- **Status**: ⏳ Pending
- **Type**: Troubleshooting
- **Technician**: Alex Rodriguez
- **Scheduled**: Tomorrow
- **Notes**: Intermittent connectivity issues on floor 2. Check splice points.

### Job #4: Green Valley Apartments - Fiber Installation
- **Status**: ⏳ Pending
- **Type**: Fiber Installation
- **Technician**: Sarah Chen
- **Scheduled**: Tomorrow
- **Notes**: Install fiber to 12 residential units.

### Job #5: Riverside Shopping Mall - Network Upgrade
- **Status**: ⏳ Pending
- **Type**: Network Upgrade
- **Technician**: Mike Johnson
- **Scheduled**: Next Week
- **Notes**: Upgrade to 10Gbps backbone. Coordinate with building management.

### Job #6: TechCorp HQ - Testing
- **Status**: ✅ Completed
- **Type**: Testing
- **Technician**: Alex Rodriguez
- **Completed**: March 15, 2024
- **Notes**: OTDR testing completed. All parameters within spec.

---

## 📦 Seeded Inventory

### Cables
1. **Single-mode OS2 Fiber Cable**
   - Quantity: 2,500 meters
   - Status: ✅ In Stock
   - Min Stock: 1,000 meters

2. **Multi-mode OM4 Fiber Cable**
   - Quantity: 1,200 meters
   - Status: ✅ In Stock
   - Min Stock: 800 meters

### Connectors
3. **SC/UPC Connectors**
   - Quantity: 150 pieces
   - Status: ✅ In Stock
   - Min Stock: 100 pieces

4. **LC/UPC Connectors**
   - Quantity: 45 pieces
   - Status: ⚠️ Low Stock
   - Min Stock: 50 pieces

### Equipment
5. **Fusion Splicer**
   - Quantity: 3 units
   - Status: ✅ In Stock

6. **OTDR Meter**
   - Quantity: 5 units
   - Status: ✅ In Stock

### Tools
7. **Fiber Cleaver**
   - Quantity: 8 units
   - Status: ✅ In Stock

### Hardware
8. **Patch Panels (24-port)**
   - Quantity: 12 units
   - Status: ✅ In Stock

### Accessories
9. **Cable Ties**
   - Quantity: 5 pieces
   - Status: ❌ Out of Stock
   - Min Stock: 20 pieces

10. **Fiber Cleaning Kit**
    - Quantity: 25 units
    - Status: ✅ In Stock

---

## 📊 Seeded Meter Readings

### Job #1 Readings (TechCorp HQ)
1. **OTDR Reading**
   - Device: EXFO MaxTester 940
   - Loss: -14.5 dBm
   - Distance: 450.25 meters
   - Events: Splice at 125m, Connector at 450m

2. **Power Meter Reading**
   - Device: EXFO MaxTester 940
   - Loss: -12.8 dBm

### Job #6 Readings (TechCorp HQ Testing)
3. **OTDR Reading**
   - Device: VIAVI OneExpert
   - Loss: -15.2 dBm
   - Distance: 485.50 meters
   - Events: Clean run, no events detected

---

## ✨ Features Implemented

### ✅ Authentication System
- **Login**: Fully functional with session management
- **Registration**: New users can register as technicians
- **Offline Mode**: All data stored in memory (no database required)

### ✅ Dashboard
- Real-time job statistics
- Quick access to today's jobs
- Performance metrics

### ✅ Job Management
- View all assigned jobs
- Create new jobs with client selection
- Update job status
- Track materials used
- Job scheduling with calendar

### ✅ Interactive Map
- View all job locations on map
- Fiber route visualization
- Click markers for job details

### ✅ OTDR Meter Integration
- Simulated Bluetooth device connection
- Live signal readings
- Reading history and graphs
- Save readings to jobs

### ✅ Inventory Management
- Track all equipment and materials
- Low stock alerts
- Use items on jobs
- Restock functionality

### ✅ Reports & Analytics
- Weekly job completion charts
- Job type distribution
- Export capabilities

---

## 🚀 Quick Start Guide

1. **Login with Demo Account**
   - Email: `alex.tech@fibertrace.com`
   - Password: `password`

2. **Or Register a New Account**
   - Click "Register Here" on login screen
   - Fill in your details
   - Auto-login after registration

3. **Explore the Features**
   - Dashboard: Overview of your jobs
   - Jobs: Manage and create fiber installation jobs
   - Map: View job locations on interactive map
   - Meter: Simulate OTDR readings
   - Inventory: Track tools and materials
   - Reports: View analytics and export data

---

## 💡 Tips for Testing

- **Create Jobs**: Use the existing clients or create new ones
- **Update Status**: Change job status from Pending → In Progress → Completed
- **Use Inventory**: Log materials used on jobs
- **Take Meter Readings**: Connect to virtual OTDR and save readings
- **View Reports**: Check weekly statistics and charts
- **All Data Persists**: During the session (in-memory storage)

---

## 🔄 Offline Capability

The app runs **completely offline** with in-memory storage:
- No database connection required
- All data pre-seeded for testing
- Perfect for field technicians without internet
- Data persists during session (resets on server restart)

---

## 📱 Responsive Design

Fully optimized for:
- Desktop browsers
- Tablets
- Mobile devices
- Dark theme optimized for field use
