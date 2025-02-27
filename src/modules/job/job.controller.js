import { Router } from "express";
import isAuthenticated from "../../middleWare/authentication.middleware.js";
import isAuthorized from "../../middleWare/authorization.midlleware.js";
import validation from "../../middleWare/validation.js";
import endPoints from "./job.endPoint.js";
import * as jobSchemas from "./job.validation.js"
import *as jobServices from "./job.services.js"
import { asyncHandler } from "../../utils/index.js";
import { fileValidation, uploadeCloud } from "../../utils/file uploading/multer.cloud.js";



const jobRouter = Router({mergeParams:true});


jobRouter.post("/add-job/:companyId",
    isAuthenticated,
    isAuthorized(endPoints.addJob),
    validation(jobSchemas.addJob),
    asyncHandler( jobServices.addJob)
);
jobRouter.patch("/update-job/:jobId",
    isAuthenticated,
    isAuthorized(endPoints.updateAndDelete),
    validation(jobSchemas.updateJob),
    asyncHandler( jobServices.updateJob)
);

jobRouter.delete("/delete-job/:jobId",
    isAuthenticated,
    isAuthorized(endPoints.updateAndDelete),
    validation(jobSchemas.deleteJob),
    asyncHandler( jobServices.deleteJob)
);
jobRouter.get("/",
    isAuthenticated,
    isAuthorized(endPoints.getJobs),
    validation(jobSchemas.getJobs),
    asyncHandler( jobServices.getJobs)
);
jobRouter.get("/get-jobs",
    isAuthenticated,
    isAuthorized(endPoints.getJobs),
    validation(jobSchemas.getJobsByFilter),
    asyncHandler( jobServices.getJobsByFilter)
);

jobRouter.get("/get-job-application/:jobId",
    isAuthenticated,
    isAuthorized(endPoints.getJobs),
    validation(jobSchemas.getJobApplications),
    asyncHandler( jobServices.getJobApplications)
);
jobRouter.post("/applyToJob/:jobId",
    isAuthenticated,
    uploadeCloud(fileValidation.sheet).single("image"),
    isAuthorized(endPoints.applyToJob),
    validation(jobSchemas.applyToJob),
    asyncHandler( jobServices.applyToJob)
);
jobRouter.put("/application/:applicationId",
    isAuthenticated,
    isAuthorized(endPoints.acceptOrRejectApplicant),
    validation(jobSchemas.acceptOrRejectApplicant),
    asyncHandler( jobServices.acceptOrRejectApplicant)
);


export default jobRouter;