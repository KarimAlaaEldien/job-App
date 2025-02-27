import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { adminQuery } from "./modules/admin/graphql/admin.query.js";



export const schema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"mainQuery",
        fields:{
            hello:{
                type:GraphQLString,
                resolve:()=>{
                    return "hi"
                }
            },
            ...adminQuery
        },
    }),
});