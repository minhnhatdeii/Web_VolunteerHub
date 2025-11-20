import prisma from '../db.js';

export const findById = async (id, select) => {
  return prisma.user.findUnique({ where: { id }, select });
};

export const findByEmail = async (email, select) => {
  return prisma.user.findUnique({ where: { email }, select });
};

export const findByExternalId = async (externalId, select) => {
  return prisma.user.findFirst({ where: { externalId }, select });
};

export const create = async (data, select) => {
  return prisma.user.create({ data, select });
};

export const updateById = async (id, data, select) => {
  return prisma.user.update({ where: { id }, data, select });
};

export const updateByExternalId = async (externalId, data, select) => {
  // First find the user by externalId
  const user = await prisma.user.findFirst({
    where: { externalId },
    select: { id: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Then update using the unique id
  return prisma.user.update({
    where: { id: user.id },
    data,
    select
  });
};

