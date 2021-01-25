import { Context } from '../../context';
import { MutationResolvers, User } from '../../generated/graphql';
import { Post as PrismaPost, User as PrismaUser, Comment as PrismaComment } from '@prisma/client';

const Mutation: MutationResolvers<Context> = {
  async createUser(_parent, { data }, { prisma }, _info) {
    const emailTaken: User | null = await prisma.user.findFirst({ where: { email: data.email } })
    
    if (emailTaken) {
      throw new Error('The email is taken')
    }

    const prismaUser: User = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    console.log(prismaUser);

    return prismaUser
  },
  async updateUser(parent, { id, data }, { prisma }, info) {
    const { name, email } = data

    const prismaUser: PrismaUser | null = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    })

    if (!prismaUser) {
      throw new Error('User not found')
    }

    if (typeof email === 'string') {
      if (await prisma.user.findFirst({ where: { email } })) {
        throw new Error('The meail is already in use')
      }

      // Here we should change the state. this is the same bject beging saved
      prismaUser.email = email
    }

    if (typeof name === 'string') {
      prismaUser.name = name
    }

    const createdUser: PrismaUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: prismaUser.name,
        email: prismaUser.email,
      },
    })

    return createdUser
  },
  async deleteUser(_parent, { id }, { prisma }, _info) {
    const prismaDeleteduser: PrismaUser | null = await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    if (!prismaDeleteduser) {
      throw new Error('User not found or it could not be deleted')
    }

    return prismaDeleteduser
  },
  async createPost(_parent, { data }, { prisma, pubsub }, _info) {
    let { user, post } = prisma

    const existingUser: PrismaUser | null = await user.findUnique({
      where: { id: parseInt(data.author) },
    })

    if (!existingUser) {
      throw new Error(`The user with the id ${data.author} not found`)
    }

    const createdPost: PrismaPost = await post.create({
      data: {
        title: data.title,
        body: data.body,
        published: data.published,
        authorId: parseInt(data.author),
      },
    });


    if (createdPost.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: createdPost,
        },
      })
    }

    return createdPost
  },
  async updatePost(_parent, { id, data }, { prisma, pubsub }, _info) {
    const { title, body, published } = data
    const existingPost: PrismaPost | null = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    })
    const originalPost = { ...existingPost }
    if (!existingPost) {
      throw new Error('The post not found')
    }

    if (typeof title === 'string') {
      existingPost.title = title
    }

    if (typeof body === 'string') {
      existingPost.body = body
    }

    const updatedPost: PrismaPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...existingPost,
      },
    })

    if (typeof published === 'boolean') {
      existingPost.published = published

      if (originalPost.published && !existingPost.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost,
          },
        })
      } else if (!originalPost.published && existingPost.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: existingPost,
          },
        })
      }
    } else if (existingPost.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: existingPost,
        },
      })
    }

    return updatedPost
  },
  async deletePost(_parent, { id }, { prisma, pubsub }, _info) {
    let { post } = prisma
    const existsingPost: PrismaPost | null = await post.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existsingPost) {
      throw new Error('Post not found')
    }

    const deletedPost: PrismaPost = await post.delete({
      where: { id: parseInt(id) },
    })

    if (deletedPost.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: deletedPost,
        },
      })
    }

    return deletedPost
  },
  async createComment(_parent, { data }, { prisma, pubsub }, _info) {
    const { text, author, post } = data
    if (
      !(await prisma.user.findUnique({
        where: { id: parseInt(author) },
      }))
    ) {
      throw new Error('Author not found')
    }

    const existingPost: PrismaPost | null = await prisma.post.findUnique({
      where: {
        id: parseInt(post),
      },
    })

    if (!existingPost || !existingPost.published) {
      throw new Error('Post not found or is not published')
    }

    const createdComment: PrismaComment = await prisma.comment.create({
      data: {
        authorId: parseInt(author),
        postId: parseInt(post),
        text: text,
      }
    })


    pubsub.publish(`comment-${existingPost.id}`, {
      comment: {
        mutation: 'CREATED',
        data: createdComment,
      },
    })

    return createdComment
  },
  async updateComment(parent, { id, data }, { prisma, pubsub }, info) {
    const { text } = data
    const { post, comment } = prisma

    let existingComment: PrismaComment | null = await comment.findFirst({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      throw new Error(`The comment to be updated does not exits`);
    }

    const existingPost = await comment
      .findUnique({
        where: { id: parseInt(id) },
      })
      .post()

    if (!existingPost) {
      throw new Error('No post found')
    }


    let updatedComment: PrismaComment

    if (typeof text === 'string') {
      const prismaUpdatedComment: PrismaComment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: {
          text: text,
        },
      })

      updatedComment = {
        ...prismaUpdatedComment,
      }
    } else {
      updatedComment = {
        ...existingComment,
      }
    }

    pubsub.publish(`comment-${updatedComment.postId}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment,
      },
    })


    return updatedComment
  },
  async deleteComment(parent, { id }, { prisma, pubsub }, info) {
    const existingComment: PrismaComment | null = await prisma.comment.findUnique(
      {
        where: { id: parseInt(id) },
      },
    )

    if (!existingComment) {
      throw new Error('The comment not found')
    }

    const deletedComment: PrismaComment = await prisma.comment.delete({
      where: { id: parseInt(id) },
    })

    pubsub.publish(`comment-${deletedComment.postId}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    })

    return deletedComment
  },
}

export default Mutation
