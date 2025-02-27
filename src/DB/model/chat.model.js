import { model, Schema, Types } from "mongoose";
import { jobRole } from "../../utils/enum/enum.values.js";


const chatSchema = new Schema({
    senderId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function (value) {
                let userExist = await this.model('User').findById(value)
                if (!userExist) return false;
                if (!userExist.jobRole) return false;
                return userExist.jobRole === jobRole.companyOwner || userExist.jobRole === jobRole.HR;
            },
            message: 'Sender must be an HR or company owner.'
        }
    },
    receiverId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        message: {
            type: String,
            required: true
        },
        senderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true 
        }
    }]
}, { timestamps: true });


const Chat = model('Chat', chatSchema);

export default Chat;