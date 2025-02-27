import joi from "joi";
import { validateObjectId } from "../../../middleWare/validation.js";


export const getChat=joi.object({
    userId:joi.string().custom(validateObjectId).required(),
}).required();