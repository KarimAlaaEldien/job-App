import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLList } from "graphql";

export const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        mobileNumber: { type: GraphQLString },
        role: { type: GraphQLString }
    }
});

export const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: {
        id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        companyEmail: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLString }
    }
});

export const getAllData = new GraphQLObjectType({
    name: "Data",
    fields: {
        users: { type: new GraphQLList(UserType) },
        companies: { type: new GraphQLList(CompanyType) },
        message: { type: GraphQLString },
        statusCode: { type: GraphQLString }
    }
});

