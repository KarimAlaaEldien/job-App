import { Router } from "express";
import * as authServices from "./auth.services.js";
import { asyncHandler } from "../../utils/index.js";
import * as schemas from "./auth.validation.js";
import validation from "../../middleWare/validation.js";
const authRouter=Router();


authRouter.post("/signup",validation(schemas.signUp),asyncHandler(authServices.signUp));
authRouter.post("/signup/admin-only",validation(schemas.signUp),asyncHandler(authServices.signUpAdmin));
authRouter.post("/confirm-otp",validation(schemas.confirmOTP),asyncHandler(authServices.confirmOTP));
authRouter.post("/resend-otp",validation(schemas.resendOTP),asyncHandler(authServices.resendOTP));
authRouter.post("/signin",validation(schemas.signIn),asyncHandler(authServices.signIn));
authRouter.post("/signup-google",validation(schemas.googleLoginOrSignup),asyncHandler(authServices.googleLoginOrSignup));
authRouter.post("/signin-google",validation(schemas.googleLoginOrSignup),asyncHandler(authServices.googleLoginOrSignup));
authRouter.post("/forget_Password",validation(schemas.forgetPassword),asyncHandler(authServices.forgetPassword));
authRouter.post("/reset_password",validation(schemas.resetPassword),asyncHandler(authServices.resetPassword));
authRouter.post("/refresh_token",validation(schemas.refreshToken),asyncHandler(authServices.refreshToken));



export default authRouter;