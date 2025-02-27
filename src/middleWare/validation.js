import { Types } from "mongoose";
import joi from "joi"

const validation=(schema)=>{
    return(req,res,next)=>{
        const data={...req.body,...req.query,...req.params}
        if(req.files?.length||req.file)
            data.file=req.file||req.files

        const result=schema.validate(data,{abortEarly:false})
        if(result.error){
            const messageList=result.error.details.map((obj)=>obj.message)
            return next(new Error( messageList,{cause:400}))
        }
        return next();
    }
}
export default validation;

export const validateObjectId=(value,helper)=>{
    if(Types.ObjectId.isValid(value)) return true;
    return helper.message("invalid ObjectId....!");
};

export const numOfEmployee=(value, helpers) => {
    const [min, max] = value.split('-').map(Number);
    const minAllowed = 5;
    const maxAllowed = 1000;

    if (min < minAllowed || max > maxAllowed) {
        return helpers.message(`numberOfEmployees must be in the range between ${minAllowed} and ${maxAllowed}`);
    }
    return true
}

export const validateDOB = (value, helper) => {
    const today = new Date();
    const age = today.getFullYear() - value.getFullYear();
    if (age < 18) {
        return helper.message('User must be at least 18 years old.');
    }
    return true;
};


export const validationGraph = async (schema, args) => {
    const result = schema.validate(args, { abortEarly: false })
    if (result.error) throw new Error(result.error.toString())
    return true;
}

export const fileObject={
    fieldname:joi.string().valid("image").required(),
    originalname:joi.string().required(),
    encoding:joi.string().required(),
    mimetype:joi.string().required(),
    size:joi.number().required(),
    destination:joi.string().required(),
    filename:joi.string().required(),
    path:joi.string().required(),
}