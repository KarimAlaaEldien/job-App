import { GraphQLNonNull, GraphQLString } from "graphql";

export const getAllData = {
    authorization: { type: new GraphQLNonNull(GraphQLString) }
};
