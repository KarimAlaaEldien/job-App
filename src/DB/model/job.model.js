import { model, Schema, Types } from "mongoose";
import { jobLevel, jobLocation, workingTime } from "../../utils/enum/enum.values.js";

const jobSchema = new Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    jobLocation: {
        type: String,
        enum: Object.values(jobLocation),
        required: true,
    },
    workingTime: {
        type: String,
        enum: Object.values(workingTime),
        required: true,
    },
    seniorityLevel: {
        type: String,
        enum: Object.values(jobLevel),
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    technicalSkills: [{
        type: String,
        required: true
    }],
    softSkills: [{
        type: String,
        required: true,
    }],
    addedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: [{
        type: Types.ObjectId,
        ref: 'User', 
        required: true,
    }],
    closed: {
        type: Boolean,
        default: false,
    },
    companyId: {
        type: Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    applications: [{
        type: Types.ObjectId,
        ref: 'Application'
    }],
}, { timestamps: true }); 


jobSchema.virtual('Aapplications', {
    ref: 'Application',
    localField: 'applications',
    foreignField: 'jobId',
});


const Job = model('Job', jobSchema);

export default Job;