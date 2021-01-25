import { Context } from '../../context'
import { CommentResolvers } from '../../generated/graphql'
import { User as PrismaUser, Post as PrismaPost } from '@prisma/client';

const Comment: CommentResolvers<Context> = {
  async author(parent, args, { prisma }, info) {
    const prismaCommentAuthor: PrismaUser | null = await prisma.user.findUnique(
      {
        where: { id: parent.authorId },
        select: {
          id: true,
          name: true,
          email: true,
          posts: false,
          comments: false,
        },
      },
    )

    if (!prismaCommentAuthor) {
      throw new Error("Comment's author not found")
    }

    return {
      ...prismaCommentAuthor,
    }
  },
  async post(parent, _args, { prisma }, _info) {
    const prismaCommentPost: PrismaPost | null = await prisma.post.findUnique({
      where: { id: parent.postId },
    });

    if (!prismaCommentPost) {
      throw new Error('no post found for this comment')
    }

    const author: PrismaUser | null = await prisma.user.findUnique({
      where: { id: prismaCommentPost.authorId}
    });

    if (!author) {
      throw new Error(`No author found for the post ${prismaCommentPost.id}`);
    }

    return {
      ...prismaCommentPost,
      author: author
    }
  },
}

export default Comment
