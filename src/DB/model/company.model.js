import { model, Schema, Types } from "mongoose";
import { defaultCover, publicIdCover } from "./user.model.js";
import Job from "./job.model.js";

export const comanyLogoDefault = "https://res.cloudinary.com/dgkmmsxq4/image/upload/v1740493844/logo_vk462z.jpg"
export const publicIdLogo = "logo_vk462z"

const minAllowed = 5;
const maxAllowed = 1000;

const companySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 20
    },
    industry: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    numberOfEmployees: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                const [min, max] = value.split('-').map(Number);
                return min >= minAllowed && max <= maxAllowed;
            },
            message: `numberOfEmployees must be in the range between ${minAllowed} and ${maxAllowed}`
        }
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    logo: {
        secure_url: {
            type: String,
            default: comanyLogoDefault
        },
        public_id: {
            type: String,
            default: publicIdLogo
        }
    },
    coverPic: {
        secure_url: {
            type: String,
            default: defaultCover
        },
        public_id: {
            type: String,
            default: publicIdCover
        },
    },
    HRs: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    bannedAt: {
        type: Date
    },
    deletedAt: {
        type: Date 
    },
    legalAttachment: {
        secure_url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
        
    },
    approvedByAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true ,toObject:{virtuals:true},toJSON:{virtuals:true}});



companySchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'companyId',
});


companySchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.deletedAt) {
        await Job.updateMany(
            { companyId: this.getQuery()._id, deletedAt: null },
            { deletedAt: update.deletedAt }
        );
    } else if (update.$unset && update.$unset.deletedAt) {
        await Job.updateMany(
            { companyId: this.getQuery()._id },
            { $unset: { deletedAt: 1 } } 
        );
    }
    next();
});


const Company = model('Company', companySchema);

export default Company;
