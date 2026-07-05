import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userDepartment?: string | null;
  userMentorId?: string | null;
}

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

export const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};

export const generateToken = (userId: string, role: string, department?: string | null, mentorId?: string | null) => {
  return jwt.sign(
    {
      userId,
      role,
      department: department ?? null,
      mentorId: mentorId ?? null,
    },
    process.env.JWT_SECRET || 'super-secret-key-student-tracker-2026',
    {
      expiresIn: '7d',
    }
  );
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-student-tracker-2026') as {
      userId: string;
      role: string;
      department?: string | null;
      mentorId?: string | null;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userDepartment = decoded.department ?? null;
    req.userMentorId = decoded.mentorId ?? null;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
