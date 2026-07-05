import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../auth';
import { sendNotificationEmail } from '../utils/mailer';
import { imagekit } from '../utils/imagekit';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Multer Config — use memory storage so we can stream to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word docs are allowed'));
    }
  },
});

// Helper: upload a file buffer to ImageKit and return the CDN URL
const uploadToImageKit = async (buffer: Buffer, originalName: string): Promise<string> => {
  const fileName = `${Date.now()}-${path.basename(originalName)}`;
  const base64 = buffer.toString('base64');
  console.log(`[IMAGEKIT] Uploading file: ${fileName} (${buffer.length} bytes)`);
  try {
    const response = await imagekit.files.upload({
      file: base64,
      fileName,
      folder: '/edutrack',
    });
    const url = (response as any).url;
    console.log(`[IMAGEKIT] Upload success: ${url}`);
    return url;
  } catch (err: any) {
    console.error('[IMAGEKIT] Upload failed:', err?.message || err);
    throw err;
  }
};

// Student upload activity
router.post('/upload', requireRole(['STUDENT', 'ADMIN']), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { title, description, type, credits, githubLink, linkedinLink } = req.body;
    const userId = req.userId!;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get student details to find their mentor
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { mentor: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Upload file to ImageKit if provided
    let fileUrl: string | null = null;
    if (req.file) {
      fileUrl = await uploadToImageKit(req.file.buffer, req.file.originalname);
    }

    const activity = await prisma.activity.create({
      data: {
        studentId: userId,
        title,
        description,
        type,
        status: 'SUBMITTED',
        filePath: fileUrl,
        credits: credits ? parseInt(credits) : 1,
        githubLink: githubLink || null,
        linkedinLink: linkedinLink || null,
      },
    });

    // Notify Mentor
    if (student.mentor) {
      await sendNotificationEmail(
        student.mentor.email,
        `New Activity Review Request from ${student.name}`,
        `Hello ${student.mentor.name},\n\nStudent ${student.name} has submitted a new activity for review:\nTitle: "${title}"\nType: ${type}\n\nPlease log in to review and approve/reject this activity.`
      );
    }

    res.status(201).json(activity);
  } catch (error: any) {
    console.error('Upload activity error:', error);
    res.status(500).json({ error: error.message || 'Activity upload failed' });
  }
});

// Get student's own activities
router.get('/my-activities', requireRole(['STUDENT', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const activities = await prisma.activity.findMany({
      where: { studentId: userId },
      include: {
        approvals: {
          orderBy: { reviewDate: 'desc' },
          include: { mentor: { select: { name: true, email: true } } },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student activities' });
  }
});

// Get all activities (filtered for Mentor/Admin review)
router.get('/all', requireRole(['MENTOR', 'ADMIN', 'FACULTY']), async (req: AuthRequest, res) => {
  try {
    const role = req.userRole;
    const userId = req.userId!;

    let filter: any = {};

    // If Mentor, show either all, or filter by assigned students
    if (role === 'MENTOR') {
      const { filterAssigned } = req.query;
      if (filterAssigned === 'true') {
        filter.student = { mentorId: userId };
      }
    }

    const { status, type, studentId } = req.query;
    if (status) filter.status = status as string;
    if (type) filter.type = type as string;
    if (studentId) filter.studentId = studentId as string;

    const activities = await prisma.activity.findMany({
      where: filter,
      include: {
        student: {
          select: { id: true, name: true, email: true, department: true },
        },
        approvals: {
          orderBy: { reviewDate: 'desc' },
          include: { mentor: { select: { name: true } } },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Start activity review (State: SUBMITTED -> UNDER_REVIEW)
router.post('/:id/review', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const activityId = id;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Can only review submitted activities' });
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: { status: 'UNDER_REVIEW' },
    });

    res.json({ message: 'Activity state updated to under review', activity: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transition activity to review state' });
  }
});

// Mentor Approve activity
router.post('/:id/approve', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const mentorId = req.userId!;
    const activityId = id;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { student: true },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Create approval record
    const approval = await prisma.activityApproval.create({
      data: {
        activityId,
        mentorId,
        decision: 'APPROVED',
        feedback: feedback || 'Approved',
      },
    });

    // Update activity status to APPROVED (or immediately COMPLETED)
    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: { status: 'APPROVED' }, // Will count as COMPLETED in progress tracking
    });

    // Notify Student
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    await sendNotificationEmail(
      activity.student.email,
      `Your activity "${activity.title}" has been APPROVED`,
      `Hello ${activity.student.name},\n\nYour submitted activity "${activity.title}" has been APPROVED by Prof. ${mentor?.name || 'Mentor'}.\nFeedback: "${feedback || 'No additional feedback.'}"\n\nLog in to see your updated completion percentage!`
    );

    res.json({ message: 'Activity approved successfully', activity: updated, approval });
  } catch (error) {
    console.error('Approve activity error:', error);
    res.status(500).json({ error: 'Failed to approve activity' });
  }
});

// Mentor Reject activity
router.post('/:id/reject', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const mentorId = req.userId!;
    const activityId = id;

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required when rejecting activities' });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { student: true },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Create approval record
    const approval = await prisma.activityApproval.create({
      data: {
        activityId,
        mentorId,
        decision: 'REJECTED',
        feedback,
      },
    });

    // Update activity status
    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: { status: 'REJECTED' },
    });

    // Notify Student
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    await sendNotificationEmail(
      activity.student.email,
      `Your activity "${activity.title}" has been REJECTED`,
      `Hello ${activity.student.name},\n\nYour submitted activity "${activity.title}" was REJECTED by Prof. ${mentor?.name || 'Mentor'}.\nFeedback: "${feedback}"\n\nPlease address the feedback and resubmit the activity from your student dashboard.`
    );

    res.json({ message: 'Activity rejected successfully', activity: updated, approval });
  } catch (error) {
    console.error('Reject activity error:', error);
    res.status(500).json({ error: 'Failed to reject activity' });
  }
});

// Student Resubmit activity
router.put('/:id/resubmit', requireRole(['STUDENT', 'ADMIN']), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, credits, githubLink, linkedinLink } = req.body;
    const userId = req.userId!;
    const activityId = id;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { student: { include: { mentor: true } } },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only resubmit your own activities' });
    }

    // Upload new file to ImageKit if provided
    let newFileUrl: string | null = activity.filePath;
    if (req.file) {
      newFileUrl = await uploadToImageKit(req.file.buffer, req.file.originalname);
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title: title || activity.title,
        description: description || activity.description,
        type: type || activity.type,
        status: 'SUBMITTED',
        filePath: newFileUrl,
        credits: credits ? parseInt(credits) : activity.credits,
        githubLink: githubLink !== undefined ? (githubLink || null) : activity.githubLink,
        linkedinLink: linkedinLink !== undefined ? (linkedinLink || null) : activity.linkedinLink,
        uploadDate: new Date(), // Reset upload date to now
      },
    });

    // Notify Mentor
    if (activity.student.mentor) {
      await sendNotificationEmail(
        activity.student.mentor.email,
        `Activity Resubmission: ${activity.student.name}`,
        `Hello ${activity.student.mentor.name},\n\nStudent ${activity.student.name} has resubmitted the activity:\nTitle: "${updated.title}"\nType: ${updated.type}\n\nPlease log in to review the revised activity.`
      );
    }

    res.json({ message: 'Activity resubmitted successfully', activity: updated });
  } catch (error) {
    console.error('Resubmit activity error:', error);
    res.status(500).json({ error: 'Failed to resubmit activity' });
  }
});

// Bulk approve endpoint for mentors
router.post('/bulk-approve', requireRole(['MENTOR', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { activityIds, feedback } = req.body;
    const mentorId = req.userId!;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'Activity IDs array is required' });
    }

    // Perform approval operations in transactions
    const activities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
      include: { student: true },
    });

    await prisma.$transaction(async (tx) => {
      for (const act of activities) {
        await tx.activityApproval.create({
          data: {
            activityId: act.id,
            mentorId,
            decision: 'APPROVED',
            feedback: feedback || 'Approved via bulk actions',
          },
        });

        await tx.activity.update({
          where: { id: act.id },
          data: { status: 'APPROVED' },
        });

        // Notify students
        await sendNotificationEmail(
          act.student.email,
          `Your activity "${act.title}" has been APPROVED`,
          `Hello ${act.student.name},\n\nYour activity "${act.title}" has been APPROVED in bulk by your mentor.\n\nLog in to view details.`
        );
      }
    });

    res.json({ message: `Successfully approved ${activities.length} activities.` });
  } catch (error) {
    console.error('Bulk approval error:', error);
    res.status(500).json({ error: 'Bulk approval failed' });
  }
});

// Get activity details
router.get('/:id', requireRole(['STUDENT', 'MENTOR', 'ADMIN', 'FACULTY']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, name: true, email: true, department: true }
        },
        approvals: {
          orderBy: { reviewDate: 'desc' },
          include: { mentor: { select: { name: true, email: true } } },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity details' });
  }
});

// Delete an activity
router.delete('/:id', requireRole(['STUDENT', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const role = req.userRole!;

    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Students can only delete their own activities
    if (role === 'STUDENT' && activity.studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own activities' });
    }

    await prisma.activity.delete({
      where: { id },
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;
