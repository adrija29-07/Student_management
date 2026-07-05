import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = bcrypt.hashSync('Welcome@123', 10);

  // 1. Create Admins
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tracker.com' },
    update: {
      role: 'ADMIN',
      name: 'Dr. Gupta (Coordinator)',
      password: passwordHash,
      department: 'CSE',
    },
    create: {
      email: 'admin@tracker.com',
      password: passwordHash,
      name: 'Dr. Gupta (Coordinator)',
      role: 'ADMIN',
      department: 'CSE',
    },
  });
  console.log('Admin seeded:', admin.email);

  // 2. Create Mentors
  const mentor1 = await prisma.user.upsert({
    where: { email: 'sharma@tracker.com' },
    update: {
      role: 'MENTOR',
      name: 'Prof. Sharma',
      password: passwordHash,
      department: 'CSE',
    },
    create: {
      email: 'sharma@tracker.com',
      password: passwordHash,
      name: 'Prof. Sharma',
      role: 'MENTOR',
      department: 'CSE',
    },
  });

  const mentor2 = await prisma.user.upsert({
    where: { email: 'verma@tracker.com' },
    update: {
      role: 'MENTOR',
      name: 'Dr. Verma',
      password: passwordHash,
      department: 'ECE',
    },
    create: {
      email: 'verma@tracker.com',
      password: passwordHash,
      name: 'Dr. Verma',
      role: 'MENTOR',
      department: 'ECE',
    },
  });
  console.log('Mentors seeded:', mentor1.email, mentor2.email);

  // 3. Create Students and Link to Mentors
  const student1 = await prisma.user.upsert({
    where: { email: 'arjun@tracker.com' },
    update: {
      role: 'STUDENT',
      name: 'Arjun Mehta',
      password: passwordHash,
      department: 'CSE',
      mentorId: mentor1.id,
    },
    create: {
      email: 'arjun@tracker.com',
      password: passwordHash,
      name: 'Arjun Mehta',
      role: 'STUDENT',
      department: 'CSE',
      mentorId: mentor1.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'priya@tracker.com' },
    update: {
      role: 'STUDENT',
      name: 'Priya Patel',
      password: passwordHash,
      department: 'CSE',
      mentorId: mentor1.id,
    },
    create: {
      email: 'priya@tracker.com',
      password: passwordHash,
      name: 'Priya Patel',
      role: 'STUDENT',
      department: 'CSE',
      mentorId: mentor1.id,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'rohit@tracker.com' },
    update: {
      role: 'STUDENT',
      name: 'Rohit Sen',
      password: passwordHash,
      department: 'ECE',
      mentorId: mentor2.id,
    },
    create: {
      email: 'rohit@tracker.com',
      password: passwordHash,
      name: 'Rohit Sen',
      role: 'STUDENT',
      department: 'ECE',
      mentorId: mentor2.id,
    },
  });
  console.log('Students seeded & assigned to mentors');

  // 4. Seed Activities and Review cycles
  
  // Arjun: Internship (Approved) -> Day 1 Upload, Day 2 Approval
  const act1 = await prisma.activity.create({
    data: {
      studentId: student1.id,
      title: 'Summer Internship at TCS',
      description: '6-week internship in software development. Worked on Python backend for inventory system.',
      type: 'Internship',
      status: 'APPROVED',
      credits: 3,
      uploadDate: new Date('2026-06-24T10:00:00Z'),
    },
  });
  await prisma.activityApproval.create({
    data: {
      activityId: act1.id,
      mentorId: mentor1.id,
      decision: 'APPROVED',
      feedback: 'Excellent work on the project. Real-world application of concepts is clear.',
      reviewDate: new Date('2026-06-25T14:00:00Z'),
    },
  });

  // Arjun: Workshop (Submitted, Pending Review)
  await prisma.activity.create({
    data: {
      studentId: student1.id,
      title: 'AI/ML Bootcamp attendance',
      description: 'Attended 3-day bootcamp on deep learning fundamentals.',
      type: 'Workshop',
      status: 'SUBMITTED',
      credits: 1,
      uploadDate: new Date(),
    },
  });

  // Priya: Project (Rejected)
  const act2 = await prisma.activity.create({
    data: {
      studentId: student2.id,
      title: 'E-commerce React Application',
      description: 'Developed full e-commerce store with checkout. Used Redux for state.',
      type: 'Project',
      status: 'REJECTED',
      credits: 2,
      uploadDate: new Date('2026-06-26T09:00:00Z'),
    },
  });
  await prisma.activityApproval.create({
    data: {
      activityId: act2.id,
      mentorId: mentor1.id,
      decision: 'REJECTED',
      feedback: 'Project repo link is missing and report has very thin documentation. Please add Github links and resubmit.',
      reviewDate: new Date('2026-06-27T11:00:00Z'),
    },
  });

  // Rohit: Sports (Under Review)
  await prisma.activity.create({
    data: {
      studentId: student3.id,
      title: 'Inter-College Basketball Tournament',
      description: 'Represented department team. Won silver medal.',
      type: 'Sports',
      status: 'UNDER_REVIEW',
      credits: 1,
      uploadDate: new Date(),
    },
  });

  // 5. System Config
  const defaultSettings = {
    allowedActivityTypes: ['Workshop', 'Project', 'Volunteer Work', 'Sports', 'Internship', 'Certifications'],
    requireMentorApproval: true,
    emailTriggers: {
      onSubmission: true,
      onDecision: true,
    },
  };

  await prisma.systemConfig.upsert({
    where: { key: 'global_settings' },
    update: {},
    create: {
      key: 'global_settings',
      value: JSON.stringify(defaultSettings),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
