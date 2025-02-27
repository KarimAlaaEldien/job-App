import { model, Schema, Types } from "mongoose";
import { status } from "../../utils/enum/enum.values.js";

const applicationSchema = new Schema({
    jobId: {
        type: Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    userCV: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: 'pending'
    }
}, { timestamps: true });


const Application = model('Application', applicationSchema);

export default Application;