import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLNonNull,
    GraphQLList,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { Profile } from './profile.js';
import { Post } from './post.js';
import {PrismaClientContext} from "../prismaClientContext.js";

export const User: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: {
            type: Profile,
            resolve: async (parent: { id: string }, _, { prisma }: PrismaClientContext) =>
                await prisma.profile.findUnique({ where: { userId: parent.id } }),
        },
        posts: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
            resolve: async (parent, _, { prisma }) =>
                await prisma.post.findMany({ where: { authorId: parent.id } }),
        },
        userSubscribedTo: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
            resolve: async (parent, _, { prisma }) =>
                await prisma.user.findMany({
                    where: {
                        subscribedToUser: {
                            some: {
                                subscriberId: parent.id,
                            },
                        },
                    },
                }),
        },
        subscribedToUser: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
            resolve: async (parent, _, { prisma }) =>
                await prisma.user.findMany({
                    where: {
                        userSubscribedTo: {
                            some: {
                                authorId: parent.id,
                            },
                        },
                    },
                }),
        },
    }),
});
