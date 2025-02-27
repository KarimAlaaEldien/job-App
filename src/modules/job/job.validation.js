import joi from "joi";
import { fileObject, validateObjectId } from "../../middleWare/validation.js";
import { jobLevel, jobLocation, status, workingTime } from "../../utils/enum/enum.values.js";



export const addJob = joi.object({
    companyId:joi.string().custom(validateObjectId).required(),
    jobTitle: joi.string().min(3).required(),
    jobLocation: joi.string().valid(...Object.values(jobLocation)).required(),
    workingTime: joi.string().valid(...Object.values(workingTime)).required(),
    seniorityLevel: joi.string().valid(...Object.values(jobLevel)).required(),
    jobDescription: joi.string().min(10).required(),
    technicalSkills: joi.array().items(joi.string().min(2).required()).min(1).required(),
    softSkills: joi.array().items(joi.string().min(2).required()).min(1).required(),
}).required();


export const updateJob = joi.object({
    jobId:joi.string().custom(validateObjectId).required(),
    jobTitle: joi.string().min(3),
    jobLocation: joi.string().valid(...Object.values(jobLocation)),
    workingTime: joi.string().valid(...Object.values(workingTime)),
    seniorityLevel: joi.string().valid(...Object.values(jobLevel)),
    jobDescription: joi.string().min(10),
    technicalSkills: joi.array().items(joi.string().min(2).required()).min(1),
    softSkills: joi.array().items(joi.string().min(2).required()).min(1),
}).required();

export const deleteJob = joi.object({
    jobId:joi.string().custom(validateObjectId).required(),
}).required();

export const getJobs = joi.object({
    companyId: joi.string().custom(validateObjectId),
    companyName:joi.string(),
    page: joi.number().integer().min(1).default(1), 
    limit: joi.number().integer().min(1).default(10),
    sort: joi.string().valid('createdAt', '-createdAt').default('createdAt')
}).or("companyId","companyName");


export const getJobsByFilter = joi.object({
    jobLocation: joi.string().valid(...Object.values(jobLocation)),
    workingTime: joi.string().valid(...Object.values(workingTime)),
    seniorityLevel: joi.string().valid(...Object.values(jobLevel)),
    jobTitle: joi.string().optional(),
    technicalSkills: joi.string(),
    page: joi.number().integer().min(1).default(1), 
    limit: joi.number().integer().min(1).default(10),
    sort: joi.string().valid('createdAt', '-createdAt').default('createdAt')
});
export const getJobApplications = joi.object({
    jobId:joi.string().custom(validateObjectId).required(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).default(10),
    sort: joi.string().valid('createdAt', 'updatedAt').default('createdAt'),
});
export const applyToJob = joi.object({
    jobId:joi.string().custom(validateObjectId).required(),
    file:joi.object(fileObject).required(),
});
export const acceptOrRejectApplicant  = joi.object({
    applicationId:joi.string().custom(validateObjectId).required(),
    action:joi.string().valid(...Object.values(status)).required(),
});
