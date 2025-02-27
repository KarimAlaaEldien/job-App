import User from "../DB/model/user.model.js";
import { roles } from "../utils/enum/enum.values.js";
import { asyncHandler, verifyToken } from "../utils/index.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    
    if (!authorization || !authorization.startsWith("bearer")) {
        return next(new Error("Token is required.....!", { cause: 403 }));
    }
    const token = authorization.split(" ")[1]
    const decoded = verifyToken({ token })

    const user = await User.findById(decoded?.id).lean();
    if (!user) return next(new Error("User not found", { cause: 404 }));
    if (user.changeCredentialTime?.getTime() > decoded.iat * 1000) 
        return next(new Error("please login again...!", { cause: 401 }));
    if(user.deletedAt?.getTime() < new Date().getTime())
        return next(new Error("please login again...!", { cause: 401 }));
    req.user = user;
    return next();
});

export default isAuthenticated;



export const authGraph = async ({authorization=""}) => {

    if (!authorization || !authorization.startsWith("bearer")) {
        throw new Error("Token is required.....!");
    }
    const token = authorization.split(" ")[1]
    const decoded = verifyToken({ token })

    const user = await User.findById(decoded?.id).lean();
    if (!user) throw new Error("User not found");
    if(roles.user!==user.role && roles.admin!==user.role) throw new Error("Not authorized...!");
    return user;
};

export const authSocket = async (socket,next) => {

    const authorization  = socket?.handshake?.auth?.authorization;
    
    if (!authorization ) return next(new Error("Token is required.....!"));

    if (!authorization.startsWith("bearer")) {
        return next(new Error("invalid token .....!"));
    }
    const token = authorization.split(" ")[1]
    const decoded = verifyToken({ token })

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user=user;
    socket.id=user.id
    return next();
};