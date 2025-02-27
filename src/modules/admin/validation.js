import joi from "joi"
import { validateObjectId } from "../../middleWare/validation.js"


export const getAllData=joi.object({
    authorization:joi.string().required(),
})
export const banOrUnBanUser=joi.object({
    userId:joi.custom(validateObjectId).required(),
})
export const generalCompany=joi.object({
    companyId:joi.custom(validateObjectId).required(),
})

