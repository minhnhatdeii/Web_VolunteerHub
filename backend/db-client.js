// This file helps import the Prisma client from the generated directory
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

module.exports = { prisma };