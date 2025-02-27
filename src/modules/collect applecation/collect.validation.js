import joi from "joi"
import {validateObjectId } from "../../middleWare/validation.js"

export const exportCompanyApplications=joi.object({
    companyId:joi.custom(validateObjectId).required(),
    date: joi.string().isoDate().required(),
}).required();
