import { Context } from '../../context';
import { SubscriptionResolvers } from "../../generated/graphql";
import { Post as PrismaPost } from '@prisma/client';

const Subscription: SubscriptionResolvers<Context> = {
  comment: {
    async subscribe(_parent, { postId }, { prisma, pubsub }, _info) {
      const { post, comment } = prisma;
      const postSubscription: PrismaPost | null = await post.findUnique({
        where: {
          id: parseInt(postId)
        },
        select: {
          id: true,
          authorId: true,
          body: true,
          published: true,
          title: true,
        },
      });

      if (!postSubscription) {
        throw new Error('Post Not Found');
      }

      return pubsub.asyncIterator(`comment-${postId}`)
    }
  },
  post: {
    subscribe(_parent, _args, { pubsub }, _info ) {
      return pubsub.asyncIterator('post');
    }
  }
};

export default Subscription