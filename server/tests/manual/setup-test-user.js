#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    const email = process.env.TEST_USER_EMAIL || 'dev-test@localhost';

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[Setup] User already exists: ${existingUser.email} (id=${existingUser.id})`);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: '$2b$10$dummy_hash_for_testing_only_do_not_use_in_production',
      },
    });

    console.log('[Setup] Test user created:');
    console.log(`  Email: ${user.email}`);
    console.log(`  ID: ${user.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`[Setup] Error: ${error.message}`);
  process.exitCode = 1;
});