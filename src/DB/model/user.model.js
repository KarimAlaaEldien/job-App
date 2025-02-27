
import { model, Schema, Types } from "mongoose";
import { genders, otpContent, providers, roles } from "../../utils/enum/enum.values.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import { hash } from "../../utils/index.js";

export const defulteImage = "https://res.cloudinary.com/dgkmmsxq4/image/upload/v1738180125/loremsimple146886245dsjsdaskddmvc_ef49r7.png";
export const publicIdForImage = "loremsimple146886245dsjsdaskddmvc_ef49r7";
export const defaultCover = "https://res.cloudinary.com/dgkmmsxq4/image/upload/v1740344951/cover_eye6g4.jpg"
export const publicIdCover = "cover_eye6g4"

export const expireTime = function expiresIn() {
    const currentTime = new Date();
    const expireTime = new Date(currentTime.getTime() + 10 * 60000);
    return expireTime
}

const userSchema = new Schema({
    firstName: {
        type: String,
        required: function () {
            return this.provider === providers.system;
        }
    },
    lastName: {
        type: String,
        required: function () {
            return this.provider === providers.system;
        }
    },
    userName: {
        type: String,
        virtual: true,
        get() {
            return `${this.firstName} ${this.lastName}`;
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === providers.system;
        }
    },
    provider: {
        type: String,
        enum: Object.values(providers),
        default: providers.system
    },
    gender: {
        type: String,
        enum: Object.values(genders),
        required: true
    },
    DOB: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                if (age < 18) return false;
                return true;
            },
            message: 'User must be at least 18 years old.'
        }
    },
    mobileNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.user,
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    bannedAt: {
        type: Date
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },
    changeCredentialTime: {
        type: Date
    },
    profilePic: {
        public_id: { type: String, default: publicIdForImage },
        secure_url: { type: String, default: defulteImage },
    },
    coverPic: {
        secure_url: { type: String, default: defaultCover },
        public_id: { type: String, default: publicIdCover }
    },
    OTP: [{
        code: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: Object.values(otpContent),
            required: true
        },
        expiresIn: {
            type: Date,
            required: true
        }
    }],
    passwordOTPValid: { type: Boolean, default: false },
    jobRole:{type:String},
});


userSchema.pre('save', function (next) {
    const today = new Date();
    const age = today.getFullYear() - this.DOB.getFullYear();

    if (age < 18) {
        return next(new Error('User must be at least 18 years old.'));
    }
    if (this.isModified("password")) {
        this.password = hash({ plainText: this.password })
    }
    if (this.isModified("mobileNumber")) {
        this.mobileNumber = encrypt({ plainText: this.mobileNumber })
    }

    if (this.isModified("OTP") || this.isNew) {
        this.OTP.forEach(otpItem => {
            if (otpItem.code) {
                otpItem.code = encrypt({ plainText: otpItem.code });
            }
        });
    }

    return next();
});


userSchema.post('findOne', function (doc) {
    if (doc) doc.mobileNumber = decrypt({ cipherText: doc.mobileNumber });
});

userSchema.post('find', function (docs) {
    if (docs && Array.isArray(docs)) {
        docs.forEach(doc => {
            if (doc && doc.mobileNumber) {
                doc.mobileNumber = decrypt({ cipherText: doc.mobileNumber });
            }
        });
    }
});


const User = model('User', userSchema);

export default User;
