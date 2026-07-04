import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, generateToken, authMiddleware, AuthRequest } from '../auth';

const router = express.Router();
const prisma = new PrismaClient();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        role: role.toUpperCase(), // STUDENT, MENTOR, ADMIN
        department: department || null,
        isActive: true,
      },
    });

    // Automatically link student to a default mentor if available (optional/fallback)
    if (user.role === 'STUDENT') {
      const defaultMentor = await prisma.user.findFirst({
        where: { role: 'MENTOR', department: user.department || undefined, isActive: true },
      });
      if (defaultMentor) {
        await prisma.user.update({
          where: { id: user.id },
          data: { mentorId: defaultMentor.id },
        });
      }
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        mentorId: user.mentorId
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        mentor: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!user || !user.isActive || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        mentor: user.mentor
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile details (Auth test)
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        mentor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      mentor: user.mentor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

export default router;
