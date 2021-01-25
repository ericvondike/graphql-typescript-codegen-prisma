import {
  Post,
  PostResolvers,
  User,
} from '../../generated/graphql';
import { Context } from '../../context';
import { User as PrismaUser, Comment as PrismaComment } from '@prisma/client';

const Post: PostResolvers<Context> = {
  async author(parent, _args, { prisma }, _info) {

    const authorId = parent.authorId;

    if (!authorId) {
      throw new Error('The author not found')
    }

    const prismaAuthor: PrismaUser | null = await prisma.user.findUnique({
      where: {
        id: authorId,
      },
      rejectOnNotFound: true,
    })

    if (!prismaAuthor) {
      throw new Error('The author of the post not found')
    }

    return prismaAuthor
  },
  async comments(parent, _args, { prisma }, info) {
    const prismaPostComments: PrismaComment[] = await prisma.comment.findMany({
      where: {
        postId: parent.id,
      }
    });

    return prismaPostComments;
  },
}

export default Post
