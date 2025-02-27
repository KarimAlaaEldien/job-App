import User, { defaultCover, defulteImage, publicIdCover, publicIdForImage } from "../../DB/model/user.model.js";
import { compareHash, encrypt } from "../../utils/index.js";
import cloudinary from './../../utils/file uploading/cloudinary.config.js';



export const updateProfile = async (req, res, next) => {
    if (req.body.mobileNumber)
        req.body.mobileNumber = encrypt({ plainText: req.body.mobileNumber })
    await User.findByIdAndUpdate(req.user._id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true })
    return res.status(200).json({ success: true, message: "profile Updated...!" });
};


export const profile = async (req, res) => {

    const user = await User.findOne({
        _id: req.user._id,
        isConfirmed: true,
        bannedAt: { $exists: false },
        deletedAt: { $exists: false },
    });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found', });
    }

    return res.status(200).json({
        success: true,
        data: user,
    });
};


export const getAccount = async (req, res) => {
    const { userId } = req.params;

    let user = await User.findOne({
        _id: userId,
        isConfirmed: true,
        bannedAt: { $exists: false },
        deletedAt: { $exists: false },
    });
    let data;
    if (user) {
        data = {
            userName: user.userName,
            mobileNumber: user.mobileNumber,
            profilePic: user.profilePic,
            coverPic: user.coverPic
        }
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
        success: true,
        data,
    });
};


export const updatePassword = async (req, res, next) => {
    const { oldPassword, password } = req.body;
    if (!compareHash({ plainText: oldPassword, hash: req.user.password }))
        return next(new Error("The old password is not correct", { cause: 400 }));

    const user = await User.findById(req.user._id);
    user.password = password;
    user.changeCredentialTime = Date.now();
    user.save();

    return res.status(200).json({ success: true, message: "password Updated successfully...!" });
};


export const uploadePic = async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/users/${req.user._id}/profile Picture` });

    user.profilePic = { secure_url, public_id };
    await user.save()

    return res.status(200).json({ success: true, results: user });
};


export const coverPic = async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/users/${req.user._id}/cover Picture` });

    user.coverPic = { secure_url, public_id };
    await user.save()

    return res.status(200).json({ success: true, results: user });
};


export const deleteProfilePic = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    let results;
    if (user.profilePic.public_id != publicIdForImage)
        results = await cloudinary.uploader.destroy(user.profilePic.public_id)

    if (results?.result == "ok") {
        user.profilePic = {
            secure_url: defulteImage,
            public_id: publicIdForImage
        };
        await user.save();
    }

    return res.status(200).json({ success: true, message: "profile pic deleted successfully" });
};

export const deleteCoverPic = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    let results;
    if (user.coverPic.public_id != publicIdCover)
        results = await cloudinary.uploader.destroy(user.coverPic.public_id)

    if (results?.result == "ok") {
        user.coverPic = {
            secure_url: defaultCover,
            public_id: publicIdCover
        };
        await user.save();
    }

    return res.status(200).json({ success: true, message: "cover pic deleted successfully" });
};

export const softDelete = async (req, res) => {

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    user.deletedAt = new Date();

    await user.save();

    return res.status(200).json({
        success: true,
        message: "User account has been soft deleted successfully",
    });
};