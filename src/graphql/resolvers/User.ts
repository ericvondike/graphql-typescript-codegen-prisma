import { Context } from '../../context'
import { UserResolvers, User } from '../../generated/graphql'
import { Post as PrismaPost, Comment as PrismaComment } from '@prisma/client'

const User: UserResolvers<Context> = {
  async posts(parent, _args, { prisma }, _info) {
    const prismaUserPosts: PrismaPost[] = await prisma.post.findMany({
      where: {
        authorId: parent.id,
      }
    });

    return prismaUserPosts
  },
  async comments(parent, args, { prisma }, info) {
    const prismaUserComments: PrismaComment[] = await prisma.comment.findMany({
    });

    return prismaUserComments;
  },
}

export default User
