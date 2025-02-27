import { Router } from "express";
import * as companyServices from "./company.services.js";
import * as companySchemas from "./company.validation.js"
import endPoints from "./company.endPoint.js";
import isAuthenticated from "../../middleWare/authentication.middleware.js";
import isAuthorized from "../../middleWare/authorization.midlleware.js";
import validation from "../../middleWare/validation.js";
import { asyncHandler } from "../../utils/index.js";
import { fileValidation, uploadeCloud } from "../../utils/file uploading/multer.cloud.js";
import jobRouter from "../job/job.controller.js";


const companyRouter = Router();

companyRouter.use("/:companyId/job",jobRouter)

companyRouter.post("/add-company",
    isAuthenticated,
    isAuthorized(endPoints.addCompany),
    uploadeCloud(fileValidation.sheetandImage).single("image"),
    validation(companySchemas.addCompany),
    asyncHandler(companyServices.addCompany)
);
companyRouter.patch("/update-company/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.updateCompany),
    validation(companySchemas.updateCompany),
    asyncHandler(companyServices.updateCompany)
);
companyRouter.delete("/soft-delete/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.deleteAndRestoreCompany),
    validation(companySchemas.deleteAndRestoreCompany),
    asyncHandler(companyServices.softDelete)
);
companyRouter.patch("/restore-company/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.deleteAndRestoreCompany),
    validation(companySchemas.deleteAndRestoreCompany),
    asyncHandler(companyServices.restoreCompany)
);

companyRouter.get("/searchByName",
    isAuthenticated,
    isAuthorized(endPoints.searchByName),
    validation(companySchemas.searchByName),
    asyncHandler(companyServices.searchByName)
);

companyRouter.get("/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.companyWithJobs),
    validation(companySchemas.companyWithJobs),
    asyncHandler(companyServices.companyWithJobs)
);

companyRouter.post("/upload-logo/:companyId",
    isAuthenticated,
    uploadeCloud(fileValidation.images).single("image"),
    isAuthorized(endPoints.uploadAndDelete),
    validation(companySchemas.upload),
    asyncHandler(companyServices.uploadelogo));

companyRouter.post("/upload-cover/:companyId",
    isAuthenticated,
    uploadeCloud(fileValidation.images).single("image"),
    isAuthorized(endPoints.uploadAndDelete),
    validation(companySchemas.upload),
    asyncHandler(companyServices.uploadeCover));

companyRouter.delete("/delete-logo/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.uploadAndDelete),
    validation(companySchemas.deleteLogoAndCover),
    asyncHandler(companyServices.deleteLogo));

companyRouter.delete("/delete-cover/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.uploadAndDelete),
    validation(companySchemas.deleteLogoAndCover),
    asyncHandler(companyServices.deleteCover));


companyRouter.post("/add-hr/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.addHRToCompany),
    validation(companySchemas.addHRToCompany),
    asyncHandler(companyServices.addHRToCompany));


export default companyRouter;