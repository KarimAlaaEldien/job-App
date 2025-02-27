import { Router } from "express";
import isAuthenticated from "../../../middleWare/authentication.middleware.js";
import isAuthorized from "../../../middleWare/authorization.midlleware.js";
import { asyncHandler } from "../../../utils/index.js";
import endPoints from "./chat.endPoints.js";
import validation from "../../../middleWare/validation.js";
import * as chatServices from "./chat.services.js";
import * as chatValidation from "./chat.validation.js";

const chatRouter=Router()



chatRouter.get("/:userId",
    isAuthenticated,
    isAuthorized(endPoints.getChat),
    validation(chatValidation.getChat),
    asyncHandler(chatServices.getChat));




export default chatRouter;