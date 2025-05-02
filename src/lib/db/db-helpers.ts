import { prisma } from '@/prisma';

// Example helpers
export async function findExampleById(id: number) {
  return await prisma.example.findUnique({
    where: { id },
  });
}

export async function findExampleByName(name: string) {
  return await prisma.example.findUnique({
    where: { name },
  });
}

export async function createExample(data: { name: string; description: string }) {
  return await prisma.example.create({
    data,
  });
}

export async function queryExamples() {
  return await prisma.example.findMany();
}
