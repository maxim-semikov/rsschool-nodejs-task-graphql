import {GraphQLSchema} from "graphql/index.js";
import {query} from "./query.js";

export const schema = new GraphQLSchema({
    query: query,
});
