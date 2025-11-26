import { Router, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { requireAuth } from './auth';

const router = Router();

// In-memory job storage (will be replaced with database)
let jobs: any[] = [];

// GET all jobs for technician
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const techId = (req.session as any).technicianId;
    const filteredJobs = jobs.filter(
      j => j.assignedTechnician === techId || j.techniciansTeam?.includes(techId)
    );
    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: String(error) });
  }
});

// GET job by ID
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job', error: String(error) });
  }
});

// POST create job
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const { name, description, nodeIds, routeIds, scheduledDate, estimatedDuration, priority } = req.body;
    const techId = (req.session as any).technicianId;

    if (!name || !scheduledDate || !estimatedDuration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newJob = {
      id: `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      jobId: `JOB-${Date.now()}`,
      name,
      description: description || '',
      status: 'Pending',
      priority: priority || 'Medium',
      assignedTechnician: techId,
      techniciansTeam: [techId],
      nodeIds: nodeIds || [],
      routeIds: routeIds || [],
      scheduledDate,
      scheduledTime: '',
      duration: 0,
      estimatedDuration,
      materialRequired: [],
      estimatedCost: 0,
      notes: '',
      inlineNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unsyncedChanges: false,
    };

    jobs.push(newJob);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: String(error) });
  }
});

// PATCH update job
router.patch('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updated = { ...jobs[jobIndex], ...req.body, updatedAt: new Date().toISOString() };
    jobs[jobIndex] = updated;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job', error: String(error) });
  }
});

// DELETE job
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }

    jobs.splice(jobIndex, 1);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: String(error) });
  }
});

// POST sync jobs (bulk upload/download)
router.post('/sync', requireAuth, (req: Request, res: Response) => {
  try {
    const { uploadJobs } = req.body;
    const techId = (req.session as any).technicianId;

    if (uploadJobs && Array.isArray(uploadJobs)) {
      for (const uploadedJob of uploadJobs) {
        const existing = jobs.findIndex(j => j.id === uploadedJob.id);
        if (existing !== -1) {
          jobs[existing] = { ...uploadedJob, unsyncedChanges: false };
        } else {
          jobs.push({ ...uploadedJob, unsyncedChanges: false });
        }
      }
    }

    const techJobs = jobs.filter(
      j => j.assignedTechnician === techId || j.techniciansTeam?.includes(techId)
    );

    res.json({ synced: uploadJobs?.length || 0, jobs: techJobs });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: String(error) });
  }
});

export default router;
