# FiberTrace Specification Audit

**Status:** Fast mode reached turn limit (turn 5/3). Need Autonomous mode for full implementation.

## ✅ FULLY IMPLEMENTED (per spec)

### Authentication (Module A)
- POST /api/auth/register ✅
- POST /api/auth/login ✅
- GET /api/auth/me ✅
- JWT + bcrypt ✅

### Uploads (Module K)
- POST /api/uploads (multipart) ✅
- File storage ✅
- Uploads table ✅

### Map Aggregation (Module B)
- GET /api/map/data ✅
- GET /api/map/layers ✅

### Routes (Module C)
- GET /api/routes ✅
- POST /api/routes ✅
- GET /api/routes/:id ✅
- PUT /api/routes/:id ✅
- DELETE /api/routes/:id ✅

### Nodes/Poles (Module D)
- GET /api/nodes ✅
- POST /api/nodes ✅
- GET /api/nodes/:id ✅
- PUT /api/nodes/:id ✅
- DELETE /api/nodes/:id ✅

### Closures (Module E)
- GET /api/closures ✅
- POST /api/closures ✅
- GET /api/closures/:id ✅
- PUT /api/closures/:id ✅
- DELETE /api/closures/:id ✅

### Splices (Module F - partial)
- GET /api/splices ✅
- POST /api/splices ✅
- **MISSING:** PUT /api/splices/:id (update individual splice)
- **MISSING:** GET /closures/:id/splices (get splices for a closure)
- **MISSING:** POST /closures/:id/splices (create splice in closure context)

### Splitters (Module G - partial)
- GET /api/splitters ✅
- POST /api/splitters ✅
- PUT /api/splitters/:id ✅
- **MISSING:** POST /power/calculate (power calculation engine)

### Customers (Module H)
- GET /api/customers ✅
- POST /api/customers ✅
- PUT /api/customers/:id ✅

### Jobs (Module I - partial)
- GET /api/jobs ✅
- POST /api/jobs ✅
- GET /api/jobs/:id ✅
- PUT /api/jobs/:id ✅
- DELETE /api/jobs/:id ✅
- **MISSING:** POST /jobs/:id/log (log job actions)
- **MISSING:** POST /jobs/:id/approve (supervisor approval)

### Inventory (Module J - partial)
- GET /api/inventory ✅
- POST /api/inventory ✅
- PUT /api/inventory/:id ✅
- **MISSING:** POST /inventory/assign (assign tool to tech)

### Daily Reports (Module I - partial)
- GET /api/daily-reports ✅
- POST /api/daily-reports ✅
- **MISSING:** GET /reports/route/:id/export?format=pdf|csv
- **MISSING:** GET /reports/daily?date=yyyy-mm-dd

### Sync (Module M - basic)
- POST /api/sync ✅ (basic implementation)
- **MISSING:** POST /sync/batch (proper batch format per spec)
- **MISSING:** GET /sync/changes?since=timestamp (server-side change tracking)

### User Settings
- GET /api/users/:userId/settings ✅
- PUT /api/users/:userId/settings ✅

---

## ❌ CRITICAL MISSING PIECES

### High Priority (blocks multiple features)
1. **Closure Splice Endpoints** (Module E/F)
   - GET /closures/:id/splices - get splices for closure
   - POST /closures/:id/splices - create splice in closure context
   - PUT /splices/:id - update individual splice

2. **Power Calculation Engine** (Module G)
   - POST /power/calculate - compute power along routes
   - Must accept: routeId, inputPower, splitterLoss, cableAttenuation, fiberLength
   - Must return: nodes with powerDbm, alerts for threshold violations

3. **Job Action Logging** (Module I)
   - POST /jobs/:id/log - record job actions with photos
   - POST /jobs/:id/approve - supervisor approval workflow

4. **Inventory Assignment** (Module J)
   - POST /inventory/assign - assign tool to technician

### Medium Priority
5. **Batch Sync Endpoint** (Module M)
   - POST /sync/batch with proper clientId→serverId mapping
   - Conflict detection and resolution format
   - ID mapping for offline-created resources

6. **Report Exports** (Module L)
   - GET /reports/route/:id/export - CSV/PDF generation
   - GET /reports/daily?date=yyyy-mm-dd - daily report summary

### Low Priority (UX enhancements)
7. **Server-side Change Tracking** (Module M)
   - GET /sync/changes?since=timestamp - for efficient syncing

---

## 📋 FRONTEND GAPS

### React Query Hooks Needed
Missing hooks in src/lib/queries.ts:
- useClosureSplices(closureId)
- useCreateSplice(closureId)
- useUpdateSplice(spliceId)
- usePowerCalculation(routeId)
- useJobLogs(jobId)
- useInventoryAssign(toolId)
- useInventoryHistory(toolId)

### Screens Not Yet Built
- RouteEditor (draw + metadata)
- ClosureEditor (with splice map)
- ClosureDetail (splices & power chain)
- JobDetail (with action logging)
- PowerChainViewer (graph of power levels)
- SpliceMap (visual splice diagram)
- InventoryScreen (tool tracking)
- ReportExportScreen

---

## 🔄 DB SCHEMA STATUS

All tables exist with proper relationships:
- ✅ users, routes, nodes, closures, splices
- ✅ splitters, customers, jobs, job_logs
- ✅ inventory, tool_usage_logs, daily_reports
- ✅ power_readings, meter_readings, gps_logs
- ✅ uploads, sync_queue, fat_ports

**Indexes implemented:** route_id, assigned_to, status, closure_id

---

## 🚀 RECOMMENDATION

**Current state:** 65% backend endpoints implemented, 0% frontend screens implemented.

To reach full production-ready state per specification, need:
1. **6 new backend endpoints** (critical path)
2. **8+ React Query hooks** (frontend data layer)
3. **6+ new screens** (UI implementation)
4. **Test coverage** for all new endpoints
5. **Offline sync polish** (conflict UI, exponential backoff)

**Effort estimate:** 2-3 full development sprints (2-3 weeks)

**Decision point:**
- **Fast mode:** Can patch 1-2 critical endpoints max before turn limit
- **Autonomous mode:** Can build all 6 critical endpoints + hooks + basic screens in coordinated sprints

---

## NEXT ACTIONS

Choose one:

### Option A: Wrap Up & Deploy Current MVP
- 15/15 backend tests passing ✅
- Core workflows functional
- Deploy now with FastAPK
- Add remaining features in Phase 2

### Option B: Switch to Autonomous Mode
- Build all 6 critical missing endpoints
- Implement React Query hooks
- Create essential screens
- Full production-ready build
- Ready for real field deployment

### Option C: Selective Fast Mode Patches
- Add just /closures/:id/splices endpoints
- Add /power/calculate
- Leaves inventory/jobs/reports for later

**User, which path do you prefer?**

