import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql/type/index.js';
import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { PrismaClientContext } from './prismaClientContext.js';
import { MemberType, MemberTypeId } from './types/memberTypes.js';
import { Post } from './types/post.js';
import { UUIDType } from './types/uuid.js';
import { Profile } from './types/profile.js';
import { User } from './types/user.js';

export const query = new GraphQLObjectType({
  name: 'MainQuery',
  fields: {
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(Profile)),
      resolve: async (_, __, context: PrismaClientContext) => {
        const profiles = await context.prisma.profile.findMany({});
        profiles.forEach((profile) => context.loader.profile.prime(profile.id, profile));

        return profiles;
      },
    },
    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.loader.profile.load(id),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async (_, __, context: PrismaClientContext) => {
        const posts = await context.prisma.post.findMany({});
        posts.forEach((post) => context.loader.post.prime(post.id, post));

        return posts;
      },
    },
    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.loader.post.load(id),
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, __, context: PrismaClientContext) =>
        context.prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.loader.memberType.load(id),
    },
    users: {
      type: new GraphQLList(User),
      resolve: async (_source, _args, context: PrismaClientContext, info) => {
        const parsedResolveInfo = parseResolveInfo(info) as ResolveTree;
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          parsedResolveInfo,
          User,
        );

        const includeRelations = {
          subscribedToUser: Boolean(fields['subscribedToUser']),
          userSubscribedTo: Boolean(fields['userSubscribedTo']),
        };

        const users = await context.prisma.user.findMany({
          include: includeRelations,
        });

        users.forEach((user) => {
          if (includeRelations.userSubscribedTo) {
            const authors = users.filter((u) =>
              u.userSubscribedTo.some((sub) => sub.authorId === user.id),
            );
            context.loader.userSubscribedTo.prime(user.id, authors);
          }

          if (includeRelations.subscribedToUser) {
            const subscribers = users.filter((u) =>
              u.subscribedToUser.some((sub) => sub.subscriberId === user.id),
            );
            context.loader.subscribedToUser.prime(user.id, subscribers);
          }
        });

        return users;
      },
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.loader.user.load(id),
    },
  },
});
