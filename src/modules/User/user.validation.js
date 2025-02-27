import  joi  from 'joi';
import { fileObject, validateDOB, validateObjectId } from '../../middleWare/validation.js';
import { genders } from '../../utils/enum/enum.values.js';

export const updateprofile=joi.object({
    mobileNumber:joi.string(),
    DOB: joi.date().custom(validateDOB),
    firstName:joi.string(),
    lastName:joi.string(),
    gender:joi.string().valid(...Object.values(genders)),
});

export const getAccount=joi.object({
    userId:joi.string().custom(validateObjectId).required(),
}).required()


export const updatePassword=joi.object({
    oldPassword:joi.string().required(),
    password:joi.string().not(joi.ref("oldPassword")).required(),
    cPassword:joi.string().valid(joi.ref("password")).required(),
});

export const uploadPicAndCover=joi.object({
    file:joi.object(fileObject).required(),
});