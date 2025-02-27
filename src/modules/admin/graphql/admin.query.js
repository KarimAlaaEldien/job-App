import * as responseType from "./types/admin.types.response.js"
import * as requestType from "./types/admin.types.request.js"
import * as adminService from "./admin.graphql.service.js"

export const adminQuery={
    getAllData:{
        type:responseType.getAllData,
        args:requestType.getAllData,
        resolve:adminService.getAllData,
    },
}