import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql/type/index.js';
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
      resolve: async (_, __, context: PrismaClientContext) =>
        context.prisma.profile.findMany(),
    },
    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.prisma.profile.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async (_, __, context: PrismaClientContext) =>
        context.prisma.post.findMany(),
    },
    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.prisma.post.findUnique({ where: { id } }),
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
        context.prisma.memberType.findUnique({ where: { id } }),
    },
    users: {
      type: new GraphQLList(User),
      resolve: async (_, __, context: PrismaClientContext) =>
        context.prisma.user.findMany(),
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, context: PrismaClientContext) =>
        context.prisma.user.findUnique({ where: { id } }),
    },
  },
});
