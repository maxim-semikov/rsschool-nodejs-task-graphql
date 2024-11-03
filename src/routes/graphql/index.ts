import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { schema } from './schema.js';

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
        const parsedQuery = parse(query);
        const errors = validate(schema, parsedQuery, [depthLimit(5)]);
        if (errors.length) {
          return { errors: errors.map(({ message }) => ({ message })) };
        }
      } catch (error) {
        return { errors: [{ message: 'Something went wrong' }] };
      }

      try {
        const { data, errors } = await graphql({
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
