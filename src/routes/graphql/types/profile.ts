import { GraphQLObjectType, GraphQLInt, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType, MemberTypeId } from './memberTypes.js';
import {PrismaClientContext} from "../prismaClientContext.js";

export const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: {
        id: { type: new GraphQLNonNull(UUIDType) },
        userId: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
        memberType: {
            type: new GraphQLNonNull(MemberType),
            resolve: async (parent: { memberTypeId: string }, _, { prisma }: PrismaClientContext) => {
                return prisma.memberType.findUnique({where: {id: parent.memberTypeId}});
            },
        },
    },
});
