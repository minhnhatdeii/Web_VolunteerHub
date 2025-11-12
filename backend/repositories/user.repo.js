import prisma from '../db.js';

export const findById = async (id, select) => {
  return prisma.user.findUnique({ where: { id }, select });
};

export const findByEmail = async (email, select) => {
  return prisma.user.findUnique({ where: { email }, select });
};

export const create = async (data, select) => {
  return prisma.user.create({ data, select });
};

export const updateById = async (id, data, select) => {
  return prisma.user.update({ where: { id }, data, select });
};

