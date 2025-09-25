import { PrismaClient, GameType, UserType, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Test Player (Free)
  const testPlayer = await prisma.user.upsert({
    where: { email: 'player@test.com' },
    update: {},
    create: {
      email: 'player@test.com',
      password: hashedPassword,
      firstName: 'João',
      lastName: 'Silva',
      userType: UserType.PLAYER,
      plan: SubscriptionPlan.FREE,
    },
  });

  // Test Player (Pro)
  const testPlayerPro = await prisma.user.upsert({
    where: { email: 'pro@test.com' },
    update: {},
    create: {
      email: 'pro@test.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      userType: UserType.PLAYER,
      plan: SubscriptionPlan.PRO,
    },
  });

  // Test Coach
  const testCoach = await prisma.user.upsert({
    where: { email: 'coach@test.com' },
    update: {},
    create: {
      email: 'coach@test.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Poker',
      userType: UserType.COACH,
      plan: SubscriptionPlan.FREE,
    },
  });

  // Create coach profile
  await prisma.coachProfile.upsert({
    where: { userId: testCoach.id },
    update: {},
    create: {
      userId: testCoach.id,
      bio: 'Coach profissional de poker com 10 anos de experiência em MTTs',
      specialties: ['MTT', 'CASH'],
      languages: ['PT', 'EN'],
      experience: 10,
      hourlyRateUSD: 50.00,
      hourlyRateBRL: 250.00,
    },
  });

  // Create sample sessions for the pro player
  const sampleSessions = [
    {
      userId: testPlayerPro.id,
      gameType: GameType.CASH,
      location: 'PokerStars',
      buyIn: 100.00,
      cashOut: 150.00,
      result: 50.00,
      duration: 120,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 120), // +2 hours
    },
    {
      userId: testPlayerPro.id,
      gameType: GameType.TOURNAMENT,
      location: 'PartyPoker',
      tournamentName: 'Daily $50 GTD',
      buyIn: 5.50,
      rebuys: 1,
      prize: 25.00,
      result: 14.00, // 25 - 5.5 - 5.5 (rebuy)
      duration: 180,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 180), // +3 hours
    },
    {
      userId: testPlayerPro.id,
      gameType: GameType.CASH,
      location: 'Live - Clube ABC',
      buyIn: 200.00,
      cashOut: 180.00,
      result: -20.00,
      duration: 240,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1 + 1000 * 60 * 240), // +4 hours
    },
  ];

  for (const sessionData of sampleSessions) {
    await prisma.session.create({
      data: {
        ...sessionData,
        status: 'COMPLETED',
      },
    });
  }

  // Create sample GTO ranges (from Excel data - basic examples)
  const sampleRanges = [
    {
      position: 'UTG',
      stackBBs: '100+',
      action: 'RFI',
      range: '22+,A2s+,K9s+,QTs+,JTs,T9s,98s,87s,76s,65s,54s,ATo+,KQo',
      frequency: 0.12,
      scenario: '6max_cash',
    },
    {
      position: 'BTN',
      stackBBs: '100+',
      action: 'RFI',
      range: '22+,A2+,K2+,Q2+,J3+,T5+,95+,85+,74+,64+,53+,43s,42s,32s',
      frequency: 0.45,
      scenario: '6max_cash',
    },
    {
      position: 'SB',
      stackBBs: '20-30',
      action: 'PUSH',
      range: '22+,A2+,K2+,Q5+,J8+,T8+,98s',
      frequency: 0.35,
      scenario: 'mtt_20bb',
    },
  ];

  for (const rangeData of sampleRanges) {
    await prisma.gTORange.create({
      data: rangeData,
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('Test accounts created:');
  console.log('- Player (Free): player@test.com / 123456');
  console.log('- Player (Pro): pro@test.com / 123456');
  console.log('- Coach: coach@test.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });