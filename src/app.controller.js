import connectDB from "./DB/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/User/user.controller.js";
import jobRouter from "./modules/job/job.controller.js";
import adminRouter from "./modules/admin/admin.controller.js";
import companyRouter from "./modules/company/company.controller.js";
import chatRouter from './modules/socket/chat-api/chat.controller.js';
import collectRouter from "./modules/collect applecation/collect.controller.js";
import globalErrorHandler from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from './utils/error handling/notFoundHandler.js';
import { createHandler } from "graphql-http/lib/use/express";
import { deletOtp } from "./utils/delete otp/deleteOtp.js";
import { schema } from './app.schema.js';
import cors from "cors"
import {rateLimit} from "express-rate-limit";
import helmet from "helmet";

const limiter=rateLimit({
    windowMs: 5 * 60 * 1000,
    limit:30,
    handler:(req,res,next,options)=>{
        return next(new Error(options.message,{cause:options.statusCode}))
    },
    legacyHeaders:false,
})


const bootStrap = async (app, express) => {
    app.use(express.json());
    await connectDB();
    deletOtp()
    app.use(cors());
    app.use(helmet())
    app.use("/auth",limiter)
    app.get("/",(req,res)=>res.send("welcome to job App....!"))
    app.use("/graphql",createHandler({schema}))

    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/company",companyRouter)
    app.use("/job",jobRouter)
    app.use("/chat",chatRouter)
    app.use("/admin",adminRouter)
    app.use("/collect",collectRouter)


    app.all("*", notFoundHandler);
    app.use(globalErrorHandler)
};
export default bootStrap;