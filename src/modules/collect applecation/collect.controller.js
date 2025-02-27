import { Router } from "express";
import endPoints from "./collect.endPoint.js";
import isAuthenticated from "../../middleWare/authentication.middleware.js";
import isAuthorized from "../../middleWare/authorization.midlleware.js";
import validation from "../../middleWare/validation.js";
import { asyncHandler } from "../../utils/index.js";
import { exportCompanyApplications } from "./collect.validation.js";
import * as collectServices from './collect.services.js';



const collectRouter = Router();


collectRouter.get("/",
    isAuthenticated, 
    isAuthorized(endPoints.exportCompanyApplications),
    validation(exportCompanyApplications), 
    asyncHandler(collectServices.exportCompanyApplications)
);

export default collectRouter;