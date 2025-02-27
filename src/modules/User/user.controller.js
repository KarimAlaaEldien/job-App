import { Router } from "express";
import * as userServices from "./user.services.js"
import isAuthenticated from "../../middleWare/authentication.middleware.js";
import isAuthorized from "../../middleWare/authorization.midlleware.js";
import { asyncHandler } from "../../utils/index.js";
import validation from "../../middleWare/validation.js";
import * as userValidation from "./user.validation.js";
import { endPoints } from "./user.endPoint.js";
import { fileValidation, uploadeCloud } from "../../utils/file uploading/multer.cloud.js";



const userRouter = Router();


userRouter.patch("/updateprofile",
    isAuthenticated,
    isAuthorized(endPoints.updateProfile),
    validation(userValidation.updateprofile),
    asyncHandler(userServices.updateProfile));


userRouter.get("/profile",
    isAuthenticated,
    isAuthorized(endPoints.profile),
    asyncHandler(userServices.profile));


userRouter.get("/profile-account/:userId",
    isAuthenticated,
    isAuthorized(endPoints.getAccount),
    validation(userValidation.getAccount),
    asyncHandler(userServices.getAccount));

userRouter.patch("/update-password",
    isAuthenticated,
    isAuthorized(endPoints.updatePassword),
    validation(userValidation.updatePassword),
    asyncHandler(userServices.updatePassword));


userRouter.post("/upload-pic",
    isAuthenticated,
    uploadeCloud(fileValidation.images).single("image"),
    isAuthorized(endPoints.profile),
    validation(userValidation.uploadPicAndCover),
    asyncHandler(userServices.uploadePic));

userRouter.post("/cover-pic",
    isAuthenticated,
    uploadeCloud(fileValidation.images).single("image"),
    isAuthorized(endPoints.profile),
    validation(userValidation.uploadPicAndCover),
    asyncHandler(userServices.coverPic))


    userRouter.delete("/delete-profile-pic",
        isAuthenticated,
        isAuthorized(endPoints.profile),
        asyncHandler(userServices.deleteProfilePic))

    userRouter.delete("/delete-cover-pic",
        isAuthenticated,
        isAuthorized(endPoints.profile),
        asyncHandler(userServices.deleteCoverPic));

    userRouter.delete("/soft-delete",
        isAuthenticated,
        isAuthorized(endPoints.profile),
        asyncHandler(userServices.softDelete))


export default userRouter;