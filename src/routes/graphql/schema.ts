import {GraphQLSchema} from "graphql/index.js";
import {query} from "./query.js";
import {mutation} from "./mutation.js";

export const schema = new GraphQLSchema({
    query,
    mutation
});
