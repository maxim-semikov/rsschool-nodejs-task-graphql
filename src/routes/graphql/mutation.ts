import { PrismaClient } from '@prisma/client';
import { GraphQLNonNull, GraphQLObjectType } from 'graphql/type/index.js';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
} from './types/inputs.js';
import { User } from './types/user.js';
import { UUIDType } from './types/uuid.js';
import {
  ChangePostDto,
  ChangeProfileDto,
  ChangeUserDto,
  CreatePostDto,
  CreateProfileDto,
  CreateUserDto,
} from './types/dto.js';
import { Post } from './types/post.js';
import { Profile } from './types/profile.js';

const prisma = new PrismaClient();

export const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: User,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_, { dto }: { dto: CreateUserDto }) =>
        await prisma.user.create({ data: dto }),
    },
    changeUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_, { id, dto }: { id: string; dto: ChangeUserDto }) =>
        await prisma.user.update({ where: { id }, data: dto }),
    },
    deleteUser: {
      type: new GraphQLNonNull(UUIDType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }) => {
        await prisma.user.delete({ where: { id } });
        return id;
      },
    },
    createPost: {
      type: Post,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_, { dto }: { dto: CreatePostDto }) =>
        prisma.post.create({ data: dto }),
    },
    changePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_, { id, dto }: { id: string; dto: ChangePostDto }) =>
        await prisma.post.update({ where: { id }, data: dto }),
    },
    deletePost: {
      type: new GraphQLNonNull(UUIDType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }) => {
        await prisma.post.delete({ where: { id } });
        return id;
      },
    },
    createProfile: {
      type: Profile,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_, { dto }: { dto: CreateProfileDto }) =>
        await prisma.profile.create({ data: dto }),
    },
    changeProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_, { id, dto }: { id: string; dto: ChangeProfileDto }) =>
        await prisma.profile.update({ where: { id }, data: dto }),
    },
    deleteProfile: {
      type: new GraphQLNonNull(UUIDType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }) => {
        await prisma.profile.delete({ where: { id } });
        return id;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(UUIDType),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }: { userId: string; authorId: string }) => {
        const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });

        if (existingSubscription) {
          throw new Error('Already subscribed.');
        }
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });

        return authorId;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(UUIDType),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }: { userId: string; authorId: string }) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });

        return userId;
      },
    },
  },
});
