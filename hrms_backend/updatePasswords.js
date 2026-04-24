// Use the same Prisma configuration as the backend
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create adapter with DATABASE_URL from environment
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

// Create PrismaClient instance with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function updatePasswords() {
  try {
    console.log('Updating password hashes for all users...');
    
    // Hash for password "1234"
    const hashedPassword = await bcrypt.hash('1234', 10);
    
    // Update all users with the new password hash
    const result = await prisma.user.updateMany({
      data: {
        passwordHash: hashedPassword
      }
    });
    
    console.log(`Updated ${result.count} users with password hash for "1234"`);
    
    // List all users with their emails
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        passwordHash: true
      }
    });
    
    console.log('\nUpdated users:');
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });
    
    console.log('\nYou can now login with any user email and password "1234"');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();