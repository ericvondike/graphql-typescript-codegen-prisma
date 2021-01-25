import { ApolloServer, ServerInfo } from 'apollo-server';
import { createContext, Context } from './context';
import Query from './graphql/resolvers/Query';
import Mutation from './graphql/resolvers/Mutation';
import Subscription from './graphql/resolvers/Subscription';
import Post from './graphql/resolvers/Post';
import User from './graphql/resolvers/User';
import Comment from './graphql/resolvers/Comment';
import { Resolvers } from './generated/graphql';

import fs from 'fs';
import path from 'path';

const context = createContext();

const resolvers: Resolvers<Context> = {
  Query,
  Mutation,
  Subscription,
  Post,
  User,
  Comment
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: ({ req }: any) => {
    return {
      ...req,
      ...context
    }
  }
});

server
  .listen()
  .then(({ url }: ServerInfo) => console.log(`Server is running on ${url}`));