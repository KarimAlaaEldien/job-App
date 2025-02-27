import { authGraph } from '../../../middleWare/authentication.middleware.js';
import { validationGraph } from '../../../middleWare/validation.js';
import User from '../../../DB/model/user.model.js';
import Company from '../../../DB/model/company.model.js';
import * as adminValidation from './../validation.js';



export const getAllData = async (parent, args) => {
    const { authorization } = args;
    await authGraph({ authorization });
    await validationGraph(adminValidation.getAllData, args);

    const [users, companies] = await Promise.all([User.find(),Company.find()]);
    return {
        message: "Data fetched successfully",
        statusCode: "200",
        users,
        companies
    };
};