import joi from "joi"
import { fileObject, numOfEmployee, validateObjectId } from "../../middleWare/validation.js"

export const addCompany=joi.object({
    companyName:joi.string().min(3).trim().required(),
    companyEmail:joi.string().email().required(),
    description:joi.string().min(20).trim().required(),
    industry:joi.string().min(3).trim().required(),
    address:joi.string().min(10).trim().required(),
    numberOfEmployees:joi.string().custom(numOfEmployee).required(),
    file:joi.object(fileObject).required(),
});
export const updateCompany=joi.object({
    companyName:joi.string().min(3).trim(),
    companyEmail:joi.string().email(),
    description:joi.string().min(20).trim(),
    industry:joi.string().min(3).trim(),
    address:joi.string().min(10).trim(),
    numberOfEmployees:joi.string().custom(numOfEmployee),
    companyId:joi.custom(validateObjectId).required()
}).required();

export const deleteAndRestoreCompany=joi.object({
    companyId:joi.custom(validateObjectId).required()
}).required();
export const companyWithJobs=joi.object({
    companyId:joi.custom(validateObjectId).required()
}).required();
export const searchByName=joi.object({
    companyName:joi.string()
});

export const upload=joi.object({
    companyId:joi.custom(validateObjectId).required(),
    file:joi.object(fileObject).required(),
});
export const deleteLogoAndCover=joi.object({
    companyId:joi.custom(validateObjectId).required(),
});
export const addHRToCompany=joi.object({
    companyId:joi.custom(validateObjectId).required(),
    userId:joi.custom(validateObjectId).required(),
});
