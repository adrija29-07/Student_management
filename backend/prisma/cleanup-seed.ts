import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Cleaning up database...');

  // First, set all mentorIds to null to break the relationship
  await prisma.user.updateMany({
    data: { mentorId: null },
  });

  // Delete all data (respecting foreign key constraints)
  await prisma.activityApproval.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.clubMember.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.activityType.deleteMany({});
  await prisma.activityCategory.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Database cleaned!');
  
  // Now run the seed
  console.log('🌱 Running seed...');
  const { exec } = require('child_process');
  exec('npm run prisma:seed', (error: any) => {
    if (error) {
      console.error('Seed failed:', error);
      process.exit(1);
    }
    console.log('✨ Seed completed!');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
