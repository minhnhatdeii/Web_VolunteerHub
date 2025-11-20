// This file helps import the Prisma client from the generated directory
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

export { prisma };