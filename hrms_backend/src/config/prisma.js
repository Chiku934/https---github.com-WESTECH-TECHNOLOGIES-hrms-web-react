// Prisma client configuration with MariaDB adapter
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Create adapter with DATABASE_URL from environment
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

// Create PrismaClient instance with adapter
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;