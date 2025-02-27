import Application from "../../DB/model/applecation.model.js";
import Company from "../../DB/model/company.model.js";
import Job from "../../DB/model/job.model.js";
import User from "../../DB/model/user.model.js";
import { roles, status } from "../../utils/enum/enum.values.js";
import cloudinary from "../../utils/file uploading/cloudinary.config.js";
import { emailEmitter, subjects } from "../../utils/index.js";
import { getIo } from "../socket/chat-socket/chat.socket.js";

export const addJob = async (req, res, next) => {
    const {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
    } = req.body;
    const userId = req.user._id;
    const { companyId } = req.params;
    const company = await Company.findOne({
        _id: companyId,
        deletedAt: { $exists: false },
    });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (
        company.createdBy.toString() !== userId.toString() &&
        !company.HRs.includes(userId)
    ) {
        return next(
            new Error("You are not authorized to add a job for this company", {
                cause: 403,
            })
        );
    }

    const newJob = new Job({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        addedBy: userId,
        companyId,
    });

    await newJob.save();

    return res.status(201).json({
        success: true,
        data: newJob,
    });
};

export const updateJob = async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(jobId);

    if (!job) {
        return next(new Error("job not found", { cause: 404 }));
    }

    const company = await Company.findById(job.companyId);
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    if (
        job?.addedBy?.toString() !== userId?.toString() &&
        !company.HRs.includes(userId)
    ) {
        return next(
            new Error("You are not authorized to update this job", { cause: 403 })
        );
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, {
        new: true,
    });

    return res
        .status(200)
        .json({ success: true, message: "job updated successflly", updatedJob });
};

export const deleteJob = async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    console.log(job);
    if (!job) return next(new Error("job not found", { cause: 404 }));

    const company = await Company.findById(job.companyId);
    if (!company) return next(new Error("company not found", { cause: 404 }));

    if (!company.HRs.includes(userId)) {
        return next(
            new Error("You are not authorized to delete this job", { cause: 403 })
        );
    }

    await Job.findByIdAndDelete(jobId);

    return res.status(200).json({
        success: true,
        message: "job deleted successfully",
    });
};

export const getJobs = async (req, res, next) => {
    const { companyId, companyName } = req.query;
    const { page = 1, limit = 10, sort = "createdAt" } = req.query;

    let company;
    if (companyName) {
        company = await Company.findOne({
            companyName: { $regex: companyName, $options: "i" },
        });
        if (!company) return next(new Error("company not found", { cause: 404 }));
    }

    const filter = companyId ? { companyId } : {};
    if (company) filter.companyId = company._id;

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ [sort]: -1 });

    const totalJobs = await Job.countDocuments(filter);

    return res.status(200).json({
        success: true,
        data: jobs,
        totalCount: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page),
    });
};

export const getJobsByFilter = async (req, res, next) => {
    const {
        companyId,
        companyName,
        jobTitle,
        workingTime,
        jobLocation,
        seniorityLevel,
        technicalSkills,
        page = 1,
        limit = 10,
        sort = "createdAt" } = req.query;

    let company;
    if (companyName) {
        company = await Company.findOne({
            companyName: { $regex: companyName, $options: "i" },
        });
        if (!company) return next(new Error("Company not found", { cause: 404 }));
    }

    const filter = {};


    if (companyId) filter.companyId = companyId;
    if (company) filter.companyId = company._id;
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (technicalSkills) filter.technicalSkills = { $in: technicalSkills.split(",") };

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ [sort]: -1 });

    const totalJobs = await Job.countDocuments(filter);

    return res.status(200).json({
        success: true,
        data: jobs,
        totalCount: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page),
    });
};

export const getJobApplications = async (req, res, next) => {
    const { jobId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const job = await Job.findById(jobId);
    if (!job) return next(new Error("Job not found", { cause: 404 }));

    const userId = req.user._id;

    if (job?.companyId?.toString() !== userId.toString() && job?.addedBy?.toString() !== userId?.toString()) {
        return next(new Error("You do not have permission to view these applications", { cause: 403 }));
    }

    const jobWithApplications = await Job.findById(jobId)
        .populate({
            path: 'applications',
            populate: {
                path: 'userId',
                select: 'firstName lastName email'
            }
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ [sort]: -1 });

    if (!jobWithApplications || jobWithApplications.applications.length === 0) {
        return next(new Error("No applications found for this job", { cause: 404 }));
    }

    const totalApplications = jobWithApplications.applications.length;

    return res.status(200).json({
        success: true,
        data: jobWithApplications.applications,
        totalCount: totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: Number(page),
    });
};

export const applyToJob = async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id

    if (req.user.role !== roles.user) return next(new Error("You are not authorized to apply for jobs", { cause: 403 }));

    const job = await Job.findById(jobId);
    if (!job) return next(new Error("Job not found", { cause: 404 }));


    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) return next(new Error("You have already applied for this job", { cause: 400 }));

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/users/${req.user._id}/Applecation` });


    const application = new Application({
        jobId,
        userId,
        userCV: { secure_url, public_id },
        status: 'pending',
    });

    await application.save();


    job.applications.push(application._id);
    await job.save();

    getIo().to(job.addedBy?.toString()).emit('newApplication', {
        jobId,
        userId,
        message: 'A new application has been submitted for your job.'
    });

    return res.status(200).json({
        success: true,
        message: "Application submitted successfully",
        data: application
    });
};

export const acceptOrRejectApplicant  = async (req, res, next) => {
    const { applicationId } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const application = await Application.findById(applicationId).populate({
        path: 'jobId',
        populate: { path: 'companyId' }
    });
    if (!application) return next(new Error("Application not found", { cause: 404 }));
    const job = application.jobId;
    
    if (job?.addedBy?.toString() !== userId && !job?.companyId.HRs?.includes(userId)) {
        return next(new Error("You are not authorized to accept or reject this application", { cause: 403 }));
    }
    let user = await User.findById(application.userId);
    
    if (action === status.accepted) {
        application.status = status.accepted;
        let message = `Dear ${user.userName},\n\nCongratulations!\n Your application for the job "${job.jobTitle}" has been accepted. We will be in touch with further details.\n\nBest regards,\nYour Company`;
        emailEmitter.emit("sendEmail", user.email, message, subjects.applecationAccept);

    } else if (action === status.rejected) {
        application.status = status.rejected;
        message=`Dear ${user.name},\n\nWe regret to inform you that your application for the job "${job.title}" has been rejected. We encourage you to apply again for future positions.\n\nBest regards,\nYour Company`;
        emailEmitter.emit("sendEmail", user.email, message, subjects.applecationReject);
    } else {
        return next(new Error("Invalid action, please use 'accepted' or 'rejected'", { cause: 400 }));
    }

    await application.save();

    return res.status(200).json({
        success: true,
        message: `Application ${action} successfully`,
        data: application
    });
};
