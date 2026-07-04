import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest, hashPassword } from '../auth';

const router = express.Router();
const prisma = new PrismaClient();

// Restrict all routes in this router to ADMIN
router.use(authMiddleware, requireRole(['ADMIN']));

// 1. MANAGE USERS

// Get all users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        mentor: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove password hash from response
    const sanitizedUsers = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create single user
router.post('/users', async (req: AuthRequest, res) => {
  try {
    const { email, password, name, role, department, mentorId } = req.body;

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
        role: role.toUpperCase(),
        department: department || null,
        mentorId: mentorId || null,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'USER_CREATED',
        details: `Created user ${user.name} (${user.role})`,
      },
    });

    const { password: _, ...sanitized } = user;
    res.status(201).json(sanitized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Bulk import users
router.post('/users/bulk', async (req: AuthRequest, res) => {
  try {
    const { users } = req.body; // Array of { email, password, name, role, department }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Valid users array required' });
    }

    const createdUsers = [];
    const skippedUsers = [];

    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        skippedUsers.push(u.email);
        continue;
      }

      const created = await prisma.user.create({
        data: {
          email: u.email,
          password: hashPassword(u.password || 'Welcome@123'),
          name: u.name,
          role: (u.role || 'STUDENT').toUpperCase(),
          department: u.department || null,
        },
      });
      createdUsers.push(created.email);
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'USER_BULK_IMPORT',
        details: `Imported ${createdUsers.length} users. Skipped ${skippedUsers.length} duplicates.`,
      },
    });

    res.json({
      message: `Bulk import completed. Successfully created ${createdUsers.length} users.`,
      created: createdUsers,
      skipped: skippedUsers,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

// Assign mentor to student
router.put('/users/:id/assign-mentor', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.body;
    const studentId = id;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    let mentorName = 'None';
    if (mentorId) {
      const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
      if (!mentor || mentor.role !== 'MENTOR') {
        return res.status(400).json({ error: 'Invalid mentor ID' });
      }
      mentorName = mentor.name;
    }

    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { mentorId: mentorId || null },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'MENTOR_ASSIGNED',
        details: `Assigned mentor ID ${mentorId || 'NULL'} (${mentorName}) to student ${student.name}`,
      },
    });

    res.json({ message: 'Mentor assigned successfully', user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign mentor' });
  }
});

// Toggle User status (Active/Deactive) or Edit Role/Dept
router.put('/users/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role, department, isActive, name, email } = req.body;
    const targetUserId = id;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: role ? role.toUpperCase() : undefined,
        department,
        isActive: isActive !== undefined ? isActive : undefined,
        name,
        email,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'USER_UPDATED',
        details: `Updated user profile of ${updated.name} (Active: ${updated.isActive})`,
      },
    });

    const { password, ...sanitized } = updated;
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// 2. ANALYTICS & DASHBOARD METRICS

router.get('/dashboard-stats', async (req: AuthRequest, res) => {
  try {
    // Activities Count by status
    const statusCounts = await prisma.activity.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    // Total counts
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalMentors = await prisma.user.count({ where: { role: 'MENTOR' } });
    const totalActivities = await prisma.activity.count();

    // Activities status list mapped for easy charting
    const activityStats = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    statusCounts.forEach((group) => {
      if (group.status in activityStats) {
        (activityStats as any)[group.status] = group._count._all;
      }
    });

    // Approval Rate
    const totalReviewed = activityStats.APPROVED + activityStats.REJECTED;
    const approvalRate = totalReviewed > 0 ? Math.round((activityStats.APPROVED / totalReviewed) * 100) : 0;

    // Dept-wise stats
    const deptStatsRaw = await prisma.activity.groupBy({
      by: ['type'],
      _count: { _all: true },
    });

    // Get Student Progress Distribution
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentActivities: {
          select: { status: true, credits: true },
        },
      },
    });

    const studentProgress = students.map((s) => {
      const approvedCount = s.studentActivities.filter((a) => a.status === 'APPROVED').length;
      const totalCount = s.studentActivities.length;
      const progressPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

      return {
        id: s.id,
        name: s.name,
        department: s.department,
        total: totalCount,
        approved: approvedCount,
        progress: progressPercent,
      };
    });

    // Workload by mentor (ActivityApproval counts)
    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      include: {
        approvals: { select: { id: true } },
        students: { select: { id: true } },
      },
    });

    const mentorWorkload = mentors.map((m) => ({
      name: m.name,
      studentsCount: m.students.length,
      reviewsCount: m.approvals.length,
    }));

    // Department Performance (activities approved vs total)
    const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'];
    const deptPerformance = await Promise.all(
      departments.map(async (dept) => {
        const approved = await prisma.activity.count({
          where: { student: { department: dept }, status: 'APPROVED' },
        });
        const total = await prisma.activity.count({
          where: { student: { department: dept } },
        });
        return {
          department: dept,
          approved,
          total,
          ratio: total > 0 ? Math.round((approved / total) * 100) : 0,
        };
      })
    );

    res.json({
      summary: {
        totalUsers,
        totalStudents,
        totalMentors,
        totalActivities,
        approvalRate,
        pendingReview: activityStats.SUBMITTED + activityStats.UNDER_REVIEW,
      },
      statusDistribution: Object.entries(activityStats).map(([status, count]) => ({
        name: status,
        value: count,
      })),
      mentorWorkload,
      deptPerformance,
      studentProgress: studentProgress.slice(0, 10), // return top 10 for dashboard preview
    });
  } catch (error) {
    console.error('Stats aggregation error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// 3. GENERATE CUSTOM REPORTS
router.get('/reports', async (req: AuthRequest, res) => {
  try {
    const { period, department } = req.query; // Weekly, Monthly, Semester

    if (!period) {
      return res.status(400).json({ error: 'Period is required' });
    }

    // Filter date ranges
    const now = new Date();
    let startDate = new Date();
    if (period === 'Weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'Monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'Semester') {
      startDate.setMonth(now.getMonth() - 6);
    }

    let filterClause: any = {
      uploadDate: { gte: startDate },
    };

    if (department && department !== 'ALL') {
      filterClause.student = { department: department as string };
    }

    const activities = await prisma.activity.findMany({
      where: filterClause,
      include: {
        student: { select: { name: true, department: true, email: true } },
        approvals: {
          include: { mentor: { select: { name: true } } },
        },
      },
    });

    const total = activities.length;
    const approved = activities.filter((a) => a.status === 'APPROVED').length;
    const rejected = activities.filter((a) => a.status === 'REJECTED').length;
    const pending = activities.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;
    const approvalRate = total > 0 ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;

    const reportData = {
      period,
      department: department || 'ALL',
      totalActivities: total,
      approved,
      rejected,
      pending,
      approvalRate,
      generatedOn: new Date().toISOString(),
      details: activities.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        student: a.student.name,
        department: a.student.department,
        status: a.status,
        date: a.uploadDate.toISOString().split('T')[0],
        mentor: a.approvals[0]?.mentor?.name || 'Unreviewed',
        feedback: a.approvals[0]?.feedback || '',
      })),
    };

    // Save report in DB
    await prisma.report.create({
      data: {
        adminId: req.userId!,
        period: period as string,
        data: JSON.stringify(reportData),
      },
    });

    res.json(reportData);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 4. CONFIGURATION SETTINGS

// Get active configuration
router.get('/config', async (req: AuthRequest, res) => {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { key: 'global_settings' },
    });

    if (!config) {
      // Seed default configs if missing
      const defaultSettings = {
        allowedActivityTypes: ['Workshop', 'Project', 'Volunteer Work', 'Sports', 'Internship', 'Certifications'],
        requireMentorApproval: true,
        emailTriggers: {
          onSubmission: true,
          onDecision: true,
        },
      };
      config = await prisma.systemConfig.create({
        data: {
          key: 'global_settings',
          value: JSON.stringify(defaultSettings),
        },
      });
    }

    res.json(JSON.parse(config.value));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save configuration
router.post('/config', async (req: AuthRequest, res) => {
  try {
    const newConfig = req.body;

    const updated = await prisma.systemConfig.upsert({
      where: { key: 'global_settings' },
      update: { value: JSON.stringify(newConfig) },
      create: { key: 'global_settings', value: JSON.stringify(newConfig) },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'CONFIG_CHANGED',
        details: `Updated global system configuration`,
      },
    });

    res.json(JSON.parse(updated.value));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// 5. AUDIT LOGS
router.get('/audit-logs', async (req: AuthRequest, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100, // retrieve latest 100 entries
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
