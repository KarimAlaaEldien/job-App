import { Router } from "express";
import isAuthenticated from "../../middleWare/authentication.middleware.js";
import isAuthorized from "../../middleWare/authorization.midlleware.js";
import { asyncHandler } from "../../utils/index.js";
import { endPoints } from "./admin.endPoins.js";
import * as adminServices from "./admin.services.js";
import validation from "../../middleWare/validation.js";
import * as adminSchemas from "./validation.js";

const adminRouter=Router();



adminRouter.patch("/ban-unban-user/:userId",
    isAuthenticated,
    isAuthorized(endPoints.generalAuth),
    validation(adminSchemas.banOrUnBanUser),
    asyncHandler(adminServices.banOrUnBanUser));

adminRouter.patch("/ban-unban-company/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.generalAuth),
    validation(adminSchemas.generalCompany),
    asyncHandler(adminServices.banOrUnBanCompany));

adminRouter.patch("/approve-company/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.generalAuth),
    validation(adminSchemas.generalCompany),
    asyncHandler(adminServices.approveCompany));




export default adminRouter