import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {graphql,} from 'graphql';
import {schema} from "./schema.js";


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      try {
        const {data, errors} = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { prisma },
        });
        return { data, errors: errors || null };
      } catch (error) {
        fastify.log.error(error);
        return { errors: [{ message: 'Internal server error' }] };
      }
    },
  });
};

export default plugin;
