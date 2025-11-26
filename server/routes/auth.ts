import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '@shared/schema';

const router = Router();

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      technicianId: string;
    }
  }
}

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).role = user.role;
    (req.session as any).technicianId = user.id;

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: String(error) });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  req.session?.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    id: (req.session as any).userId,
    email: (req.session as any).email,
    role: (req.session as any).role,
    technicianId: (req.session as any).technicianId,
  });
});

// Middleware to check authentication
export const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

export default router;
