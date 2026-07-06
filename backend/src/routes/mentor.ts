import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Note: do NOT apply a global mentor-only role restriction here because
// some resources (categories, activity-types, departments) must be
// available to students as well (for upload forms). We'll apply
// `requireRole(['MENTOR','ADMIN'])` selectively to mentor-only endpoints below.

// ─── Public Resources (Available to all roles) ──────────────────────────────────
router.get('/categories', async (req: AuthRequest, res) => {
  try {
    const categories = await prisma.activityCategory.findMany({
      include: { types: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity-types', async (req: AuthRequest, res) => {
  try {
    const types = await prisma.activityType.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments', async (req: AuthRequest, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/dashboard-stats', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get assigned students
    const assignedStudents = await prisma.user.findMany({
      where: { mentorId, role: 'STUDENT', isActive: true },
      select: { id: true },
    });
    const studentIds = assignedStudents.map((s) => s.id);

    // Pending
    const pendingCount = await prisma.activity.count({
      where: { studentId: { in: studentIds }, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    });

    // Approved today
    const approvedToday = await prisma.activityApproval.count({
      where: { mentorId, decision: 'APPROVED', reviewDate: { gte: today } },
    });

    // Rejected today
    const rejectedToday = await prisma.activityApproval.count({
      where: { mentorId, decision: 'REJECTED', reviewDate: { gte: today } },
    });

    // Total credits approved
    const approvedActivities = await prisma.activityApproval.findMany({
      where: { mentorId, decision: 'APPROVED' },
      include: { activity: { select: { credits: true } } },
    });
    const totalCreditsApproved = approvedActivities.reduce(
      (sum, a) => sum + (a.activity?.credits || 0), 0
    );

    // Recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUploads = await prisma.activity.count({
      where: { studentId: { in: studentIds }, uploadDate: { gte: sevenDaysAgo } },
    });

    // Activity by type (for pie chart)
    const allActivities = await prisma.activity.findMany({
      where: { studentId: { in: studentIds } },
      select: { type: true },
    });
    const activityByType: Record<string, number> = {};
    allActivities.forEach((a) => {
      const typeName = a.type?.name || 'Other';
      activityByType[typeName] = (activityByType[typeName] || 0) + 1;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const count = await prisma.activity.count({
        where: {
          studentId: { in: studentIds },
          uploadDate: { gte: monthStart, lt: monthEnd },
        },
      });
      monthlyTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        count,
      });
    }

    res.json({
      assignedStudentsCount: studentIds.length,
      pendingCount,
      approvedToday,
      rejectedToday,
      totalCreditsApproved,
      recentUploads,
      activityByType,
      monthlyTrend,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Assigned Students ────────────────────────────────────────────────────────
router.get('/students', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const { search, department } = req.query;

    const students = await prisma.user.findMany({
      where: {
        mentorId,
        role: 'STUDENT',
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(department ? { department: department as string } : {}),
      },
      include: {
        studentActivities: {
          select: {
            id: true,
            status: true,
            credits: true,
            type: true,
            uploadDate: true,
          },
          orderBy: { uploadDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = students.map((s) => {
      const totalCredits = s.studentActivities
        .filter((a) => a.status === 'APPROVED')
        .reduce((sum, a) => sum + a.credits, 0);
      const pendingCount = s.studentActivities.filter((a) =>
        ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)
      ).length;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        interestedFields: s.interestedFields,
        totalCredits,
        pendingCount,
        totalActivities: s.studentActivities.length,
        recentActivity: s.studentActivities[0] || null,
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Student Profile (with full activity history) ─────────────────────────────
router.get('/students/:id', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        studentActivities: {
          include: {
            approvals: {
              include: { mentor: { select: { name: true } } },
              orderBy: { reviewDate: 'desc' },
            },
          },
          orderBy: { uploadDate: 'desc' },
        },
        mentor: { select: { name: true, email: true } },
      },
    });

    if (!student || student.mentorId !== req.userId) {
      return res.status(404).json({ error: 'Student not found or not assigned to you' });
    }

    const totalCredits = student.studentActivities
      .filter((a) => a.status === 'APPROVED')
      .reduce((sum, a) => sum + a.credits, 0);

    res.json({ ...student, password: undefined, totalCredits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Department Insights ──────────────────────────────────────────────────────
router.get('/department-insights', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const students = await prisma.user.findMany({
      where: { mentorId, role: 'STUDENT', isActive: true },
      include: {
        studentActivities: {
          where: { status: 'APPROVED' },
          select: { credits: true, type: true },
        },
      },
    });

    // Students ranked by credits
    const studentRankings = students
      .map((s) => ({
        id: s.id,
        name: s.name,
        department: s.department,
        totalCredits: s.studentActivities.reduce((sum, a) => sum + a.credits, 0),
        activityCount: s.studentActivities.length,
      }))
      .sort((a, b) => b.totalCredits - a.totalCredits);

    // Activity type breakdown
    const typeBreakdown: Record<string, number> = {};
    students.forEach((s) => {
      s.studentActivities.forEach((a) => {
        const typeName = a.type?.name || 'Other';
        typeBreakdown[typeName] = (typeBreakdown[typeName] || 0) + 1;
      });
    });

    // Skill/interest breakdown
    const interestBreakdown: Record<string, number> = {};
    students.forEach((s) => {
      s.interestedFields.forEach((f) => {
        interestBreakdown[f] = (interestBreakdown[f] || 0) + 1;
      });
    });

    const avgCredits = studentRankings.length
      ? Math.round(studentRankings.reduce((s, r) => s + r.totalCredits, 0) / studentRankings.length)
      : 0;

    res.json({
      totalStudents: students.length,
      avgCredits,
      topStudents: studentRankings.slice(0, 5),
      bottomStudents: [...studentRankings].reverse().slice(0, 5),
      typeBreakdown,
      interestBreakdown,
      studentRankings,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Mentor's Approved Activities ─────────────────────────────────────────────
router.get('/approved-activities', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const approvals = await prisma.activityApproval.findMany({
      where: { mentorId, decision: 'APPROVED' },
      include: {
        activity: {
          include: { student: { select: { name: true, email: true, department: true } } },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });
    res.json(approvals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Mentor's Rejected Activities ─────────────────────────────────────────────
router.get('/rejected-activities', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const approvals = await prisma.activityApproval.findMany({
      where: { mentorId, decision: 'REJECTED' },
      include: {
        activity: {
          include: { student: { select: { name: true, email: true, department: true } } },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });
    res.json(approvals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Mentor Reports ──────────────────────────────────────────────────────────
router.get('/reports', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const mentorId = req.userId!;
    const now = new Date();
    const reportStart = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    const approvals = await prisma.activityApproval.findMany({
      where: { mentorId, reviewDate: { gte: reportStart } },
      select: { decision: true, reviewDate: true },
    });

    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(reportStart.getFullYear(), reportStart.getMonth() + idx, 1);
      const label = date.toLocaleString('default', { month: 'short' });
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label,
        approved: 0,
        rejected: 0,
      };
    });
    const monthMap = new Map(months.map((m) => [m.key, m]));

    approvals.forEach((approval) => {
      const reviewDate = new Date(approval.reviewDate);
      const key = `${reviewDate.getFullYear()}-${reviewDate.getMonth()}`;
      const month = monthMap.get(key);
      if (!month) return;
      if (approval.decision === 'APPROVED') month.approved += 1;
      if (approval.decision === 'REJECTED') month.rejected += 1;
    });

    res.json(months.map((m) => ({ month: m.label, approved: m.approved, rejected: m.rejected })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Teams (Universal Team Builder with activity types) ───────────────────────
router.get('/teams', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { category, activityType } = req.query;
    
    const teams = await prisma.team.findMany({
      where: {
        leaderId: req.userId!,
        ...(category ? { category: category as string } : {}),
        ...(activityType ? { activityType: activityType as string } : {}),
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, department: true, interestedFields: true } } },
        },
        leader: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teams', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, tags, memberIds, activityType, category } = req.body;
    const mentorId = req.userId!;

    if (!name) return res.status(400).json({ error: 'Team name is required' });

    const team = await prisma.team.create({
      data: {
        name,
        description,
        tags: tags || [],
        leaderId: mentorId,
        activityType,
        category,
        members: {
          create: (memberIds || []).map((uid: string) => ({
            userId: uid,
            role: 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, department: true } } },
        },
      },
    });

    // Send notifications to members
    for (const uid of (memberIds || [])) {
      await prisma.notification.create({
        data: {
          userId: uid,
          title: `Added to ${activityType || 'Team'}`,
          message: `You have been added to the team "${name}" by your mentor.`,
          type: 'INFO',
        },
      });
    }

    res.json(team);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teams/:id', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team || team.leaderId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility: Hackathon teams now use /teams endpoint
router.get('/hackathon-teams', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { activityType, ...query } = req.query;
    const teams = await prisma.team.findMany({
      where: {
        leaderId: req.userId!,
        activityType: 'Hackathons',
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, department: true, interestedFields: true } } },
        },
        leader: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hackathon-teams', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, tags, memberIds } = req.body;
    const mentorId = req.userId!;

    if (!name) return res.status(400).json({ error: 'Team name is required' });

    const team = await prisma.team.create({
      data: {
        name,
        description,
        tags: tags || [],
        leaderId: mentorId,
        activityType: 'Hackathons',
        category: 'Technical',
        members: {
          create: (memberIds || []).map((uid: string) => ({
            userId: uid,
            role: 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, department: true } } },
        },
      },
    });

    // Send notifications to members
    for (const uid of (memberIds || [])) {
      await prisma.notification.create({
        data: {
          userId: uid,
          title: 'Added to Hackathon Team',
          message: `You have been added to the hackathon team "${name}" by your mentor.`,
          type: 'INFO',
        },
      });
    }

    res.json(team);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hackathon-teams/:id', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team || team.leaderId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Clubs (with category filtering) ──────────────────────────────────────────
router.get('/clubs', async (req: AuthRequest, res) => {
  try {
    const { category } = req.query;
    
    const clubs = await prisma.club.findMany({
      where: category ? { category: category as string } : {},
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, department: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(clubs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clubs', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
    const club = await prisma.club.create({ data: { name, description, category } });
    res.json(club);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student: join a club (authenticated students)
router.post('/clubs/:id/join', async (req: AuthRequest, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.userId!;

    // Ensure club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Prevent duplicate membership
    const exists = await prisma.clubMember.findFirst({ where: { clubId, userId } });
    if (exists) return res.status(400).json({ error: 'Already a member' });

    const member = await prisma.clubMember.create({ data: { clubId, userId } });

    // Notify mentor(s) or club leader? For now, notify the student
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `Joined ${club.name}`,
          message: `You have joined the club ${club.name}.`,
          type: 'INFO',
          link: `/student/clubs/${clubId}`,
        },
      });
    } catch (err) {
      console.error('Failed to create join notification:', err);
    }

    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student: leave a club
router.delete('/clubs/:id/leave', async (req: AuthRequest, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.userId!;

    await prisma.clubMember.deleteMany({ where: { clubId, userId } });
    res.json({ message: 'Left club' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clubs/:id/add-member', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { userId, role } = req.body;
    const member = await prisma.clubMember.create({
      data: { clubId: req.params.id, userId, role: role || 'MEMBER' },
    });
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/clubs/:id/remove-member/:userId', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    await prisma.clubMember.deleteMany({
      where: { clubId: req.params.id, userId: req.params.userId },
    });
    res.json({ message: 'Member removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', async (req: AuthRequest, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/:id/read', async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.userId! },
      data: { isRead: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/read-all', async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/notifications/:id', async (req: AuthRequest, res) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notif || notif.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: 'Notification deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
