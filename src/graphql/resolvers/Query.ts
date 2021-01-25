import { Context } from '../../context';
import { interceptQueries } from '../../services/interceptInfo';
import {
  QueryResolvers,
} from '../../generated/graphql';

import {
  User as PrismaUser,
  Post as PrismaPost,
  Comment as PrismaComment } from '@prisma/client';

const Query: QueryResolvers<Context> = {
  async users(_parent, _args, { prisma }, _info) {
    const result: PrismaUser[] = await prisma.user.findMany({
    })

    return result
  },
  async user(_parent, args, { prisma }, _info) {
    const result: PrismaUser | null = await prisma.user.findUnique({
      where: { id: args.id },
      rejectOnNotFound: true,
    })

    return result
  },
  async post(_parent, args, { prisma }, _info) {
    const result: PrismaPost | null = await prisma.post.findUnique({
      where: { id: args.id },
    });

    if (!result) {
      throw new Error(`No Post found for the id ${args.id}`);
    }

    return result
  },
  async posts(_parent, args: any, { prisma }, _info) {
    let resultList: PrismaPost[] = await prisma.post.findMany({
    });

    const filteredResult = args.searchCriteria
    ? resultList.filter(post =>
      post.title.toLocaleLowerCase().includes(args.searchCriteria.toLowerCase())
      || post.body.toLowerCase().includes(args.searchCriteria.toLowerCase()))
    : resultList;
    
    return filteredResult;
  },
  async comments(_parent, _args, { prisma }, _info) {
    const prismaComments: PrismaComment[] = await prisma.comment.findMany({
    });

    return prismaComments;
  },
}

export default Query
