import jwt from "jsonwebtoken"

export const generatToken=({payload,signature=process.env.JWT_SECRET,options={}})=>{
    return jwt.sign(payload,signature,options);
};

export const verifyToken=({token,signature=process.env.JWT_SECRET,options={}})=>{
    return jwt.verify(token,signature,options)
};