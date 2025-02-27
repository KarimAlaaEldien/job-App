import joi from "joi"
import { validateDOB } from "../../middleWare/validation.js";
import { genders, otpContent, roles } from "../../utils/enum/enum.values.js";


export const signUp=joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    password:joi.string().required(),
    cPassword:joi.string().valid(joi.ref("password")).required(),
    email:joi.string().email().required(),
    mobileNumber:joi.string().required(),
    gender:joi.string().valid(...Object.values(genders)),
    DOB: joi.date().custom(validateDOB).required(),
    role:joi.string().valid(...Object.values(roles))
}).required();

export const confirmOTP=joi.object({
    otp:joi.string().length(6).required(), 
    email:joi.string().email().required(),
    type:joi.string().valid(...Object.values(otpContent)),
}).required();

export const resendOTP=joi.object({
    email:joi.string().email().required(),
    type:joi.string().valid(...Object.values(otpContent)),
}).required();

export const signIn=joi.object({
    email:joi.string().email().required(),
    password:joi.string().required(),
}).required();

export const googleLoginOrSignup = joi.object({
    idToken:joi.string().required(),
}).required();


export const forgetPassword = joi.object({
    email:joi.string().email().required(),
}).required();



export const resetPassword = joi.object({
    email:joi.string().email().required(),
    newPassword:joi.string().required(),
    cPassword:joi.string().valid(joi.ref("newPassword")).required(),
}).required();


export const refreshToken = joi.object({
    refresh_token:joi.string().required(),
}).required();