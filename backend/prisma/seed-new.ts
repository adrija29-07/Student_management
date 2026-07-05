import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // 1. DEPARTMENTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  const departments = [
    { name: 'CSE', code: 'CSE' },
    { name: 'IT', code: 'IT' },
    { name: 'ECE', code: 'ECE' },
    { name: 'EE', code: 'EE' },
    { name: 'ME', code: 'ME' },
    { name: 'Civil', code: 'CIVIL' },
    { name: 'AI & DS', code: 'AIDS' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: { name: dept.name, code: dept.code },
    });
  }
  console.log('✅ Departments seeded:', departments.map((d) => d.name).join(', '));

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // 2. ACTIVITY CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  const categories = [
    { name: 'Technical', icon: '💻', color: 'from-blue-500 to-cyan-600' },
    { name: 'Co-Curricular', icon: '🎭', color: 'from-rose-500 to-pink-600' },
    { name: 'Sports', icon: '⚽', color: 'from-emerald-500 to-teal-600' },
    { name: 'Social', icon: '🤝', color: 'from-amber-500 to-orange-600' },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const result = await prisma.activityCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon, color: cat.color },
    });
    categoryMap.set(cat.name, result.id);
  }
  console.log('✅ Activity categories seeded:', categories.map((c) => c.name).join(', '));

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // 3. ACTIVITY TYPES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  const activityTypes = {
    'Technical': [
      { name: 'Hackathons', icon: '🚀' },
      { name: 'Coding Contest', icon: '💡' },
      { name: 'Workshops', icon: '📚' },
      { name: 'Internships', icon: '💼' },
      { name: 'Research', icon: '🔬' },
      { name: 'Projects', icon: '🛠️' },
      { name: 'Certifications', icon: '📜' },
      { name: 'Open Source', icon: '🌐' },
      { name: 'Technical Seminar', icon: '🎓' },
    ],
    'Co-Curricular': [
      { name: 'Dance', icon: '💃' },
      { name: 'Music', icon: '🎵' },
      { name: 'Drama', icon: '🎬' },
      { name: 'Photography', icon: '📸' },
      { name: 'Debate', icon: '🗣️' },
      { name: 'Public Speaking', icon: '🎤' },
      { name: 'Anchoring', icon: '📻' },
      { name: 'Graphic Design', icon: '🎨' },
      { name: 'Video Editing', icon: '🎞️' },
      { name: 'Content Writing', icon: '✍️' },
      { name: 'Quiz', icon: '🧠' },
      { name: 'Art & Painting', icon: '🖼️' },
    ],
    'Sports': [
      { name: 'Cricket', icon: '🏏' },
      { name: 'Football', icon: '⚽' },
      { name: 'Basketball', icon: '🏀' },
      { name: 'Volleyball', icon: '🏐' },
      { name: 'Badminton', icon: '🏸' },
      { name: 'Table Tennis', icon: '🏓' },
      { name: 'Chess', icon: '♟️' },
      { name: 'Athletics', icon: '🏃' },
      { name: 'Kabaddi', icon: '🤸' },
    ],
    'Social': [
      { name: 'NSS', icon: '🕊️' },
      { name: 'NCC', icon: '🪖' },
      { name: 'Blood Donation', icon: '🩸' },
      { name: 'Tree Plantation', icon: '🌱' },
      { name: 'Volunteering', icon: '🙋' },
      { name: 'Community Service', icon: '👥' },
      { name: 'Awareness Campaign', icon: '📢' },
      { name: 'NGO Activities', icon: '🏢' },
    ],
  };

  const typeMap = new Map<string, string>();

  for (const [categoryName, types] of Object.entries(activityTypes)) {
    const categoryId = categoryMap.get(categoryName)!;
    for (const type of types) {
      const result = await prisma.activityType.upsert({
        where: { name: type.name },
        update: {},
        create: { name: type.name, categoryId, icon: type.icon },
      });
      typeMap.set(type.name, result.id);
    }
  }
  console.log('✅ Activity types seeded');

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // 4. USERS (Admin, Mentors, Students)
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  const passwordHash = bcrypt.hashSync('Welcome@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tracker.com' },
    update: { role: 'ADMIN', name: 'Dr. Gupta (Coordinator)', password: passwordHash },
    create: {
      email: 'admin@tracker.com',
      password: passwordHash,
      name: 'Dr. Gupta (Coordinator)',
      role: 'ADMIN',
      department: 'CSE',
    },
  });
  console.log('✅ Admin created:', admin.email);

  const mentor1 = await prisma.user.upsert({
    where: { email: 'sharma@tracker.com' },
    update: { role: 'MENTOR', name: 'Prof. Sharma', password: passwordHash },
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
    update: { role: 'MENTOR', name: 'Dr. Verma', password: passwordHash },
    create: {
      email: 'verma@tracker.com',
      password: passwordHash,
      name: 'Dr. Verma',
      role: 'MENTOR',
      department: 'ECE',
    },
  });
  console.log('✅ Mentors created:', mentor1.email, mentor2.email);

  const students = [
    { email: 'arjun@tracker.com', name: 'Arjun Mehta', dept: 'CSE', fields: ['AI', 'Web Development'], mentor: mentor1 },
    { email: 'priya@tracker.com', name: 'Priya Patel', dept: 'CSE', fields: ['Database', 'System Design'], mentor: mentor1 },
    { email: 'vikram@tracker.com', name: 'Vikram Singh', dept: 'IT', fields: ['Cloud', 'DevOps'], mentor: mentor1 },
    { email: 'neha@tracker.com', name: 'Neha Gupta', dept: 'ECE', fields: ['IoT', 'Embedded'], mentor: mentor2 },
  ];

  for (const stud of students) {
    await prisma.user.upsert({
      where: { email: stud.email },
      update: {},
      create: {
        email: stud.email,
        password: passwordHash,
        name: stud.name,
        role: 'STUDENT',
        department: stud.dept,
        interestedFields: stud.fields,
        mentorId: stud.mentor.id,
      },
    });
  }
  console.log('✅ Students created:', students.map((s) => s.email).join(', '));

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // 5. CLUBS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  const clubs = [
    // Technical
    { name: 'Hackathon Club', category: 'Technical', icon: '🚀' },
    { name: 'Coding Club', category: 'Technical', icon: '💻' },
    { name: 'AI Club', category: 'Technical', icon: '🤖' },
    { name: 'Robotics Club', category: 'Technical', icon: '🦾' },
    { name: 'Web Development', category: 'Technical', icon: '🌐' },
    // Co-Curricular
    { name: 'Dance Club', category: 'Co-Curricular', icon: '💃' },
    { name: 'Music Club', category: 'Co-Curricular', icon: '🎵' },
    { name: 'Drama Club', category: 'Co-Curricular', icon: '🎬' },
    { name: 'Photography Club', category: 'Co-Curricular', icon: '📸' },
    { name: 'Art Club', category: 'Co-Curricular', icon: '🎨' },
    // Sports
    { name: 'Cricket Team', category: 'Sports', icon: '🏏' },
    { name: 'Football Team', category: 'Sports', icon: '⚽' },
    { name: 'Basketball Team', category: 'Sports', icon: '🏀' },
    { name: 'Chess Club', category: 'Sports', icon: '♟️' },
    // Social
    { name: 'NSS', category: 'Social', icon: '🕊️' },
    { name: 'NCC', category: 'Social', icon: '🪖' },
    { name: 'Volunteer Group', category: 'Social', icon: '🙋' },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { name: club.name },
      update: {},
      create: { name: club.name, category: club.category, icon: club.icon },
    });
  }
  console.log('✅ Clubs seeded:', clubs.map((c) => c.name).join(', '));

  console.log('✨ Database seeding completed!');
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
