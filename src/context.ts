import { PrismaClient } from '@prisma/client';
import { PubSub } from 'apollo-server';

const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

const pubsub = new PubSub();

export interface Context {
  prisma: PrismaClient,
  pubsub: PubSub
}

export function createContext(): Context {
  return { prisma, pubsub }
}
