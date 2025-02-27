import User, { defaultCover, publicIdCover } from '../../DB/model/user.model.js';
import { jobRole, roles } from '../../utils/enum/enum.values.js';
import cloudinary from '../../utils/file uploading/cloudinary.config.js';
import Company, { comanyLogoDefault, publicIdLogo } from './../../DB/model/company.model.js';


export const addCompany = async (req, res, next) => {
    const { companyName, companyEmail, description, industry, address, numberOfEmployees } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new Error("user not found", { cause: 404 }));

    const existingCompanyName = await Company.findOne({ companyName });
    if (existingCompanyName) return next(new Error("Company name already exists", { cause: 400 }));

    const existingCompanyEmail = await Company.findOne({ companyEmail });
    if (existingCompanyEmail) return next(new Error("Company email already exists", { cause: 400 }));
    let data
    if (req.file.mimetype == "application/pdf") {
        data = await cloudinary.uploader.upload(req.file.path, { resource_type: "raw", folder: `${process.env.CLOUD_FOLDER_NAME}/Company/${req.user._id}/legalAttachment` });
    } else {
        data = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/Company/${req.user._id}/legalAttachment` });
    }
    let { secure_url, public_id } = data

    const newCompany = new Company({
        companyName,
        companyEmail,
        description,
        industry,
        address,
        numberOfEmployees,
        legalAttachment: { secure_url, public_id },
        createdBy: user._id,
    });
    user.jobRole = jobRole.companyOwner;
    await newCompany.save();
    await user.save();

    return res.status(201).json({
        success: true,
        message: 'Company added successfully',
        data: newCompany,
    });
};


export const updateCompany = async (req, res, next) => {
    const companyId = req.params.companyId;
    const userId = req.user._id;
    const companyData = req.body;

    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to update this company", { cause: 403 }));
    }

    const updatedCompany = await Company.findByIdAndUpdate(companyId, companyData, { new: true });

    return res.status(200).json({
        success: true,
        message: "Company data updated successfully",
        data: updatedCompany
    });
};


export const softDelete = async (req, res, next) => {
    const companyId = req.params.companyId;
    const userId = req.user._id;

    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));
    if(company.approvedByAdmin==false)
        return next(new Error("This company is not accepted by the admin", { cause: 403 }));

    const user = await User.findById(userId);
    if (!user) return next(new Error("User not found", { cause: 404 }));

    if (company.createdBy.toString() !== userId.toString() && user.role !== roles.admin) {
        return next(new Error("You are not authorized to delete this company", { cause: 403 }));
    }

    if (company?.deletedAt) return next(new Error("Company is already deleted", { cause: 400 }));

    await Company.findOneAndUpdate(
        { _id: companyId },
        { deletedAt: new Date() },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "Company deleted successfully",
    });
};

export const restoreCompany = async (req, res, next) => {
    const companyId = req.params.companyId;
    const userId = req.user._id;

    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));
    if(company.approvedByAdmin==false)
        return next(new Error("This company is not accepted by the admin", { cause: 403 }));

    const user = await User.findById(userId);
    if (!user) return next(new Error("User not found", { cause: 404 }));

    if (company.createdBy.toString() !== userId.toString() && user.role !== roles.admin) {
        return next(new Error("You are not authorized to restore this company", { cause: 403 }));
    }

    if (!company.deletedAt) return next(new Error("Company is not deleted", { cause: 400 }));

    await Company.findOneAndUpdate(
        { _id: companyId },
        { $unset: { deletedAt: 1 } },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "Company and its associated jobs restored successfully",
    });
};


export const companyWithJobs = async (req, res, next) => {
    const { companyId } = req.params;

    const company = await Company.findById(companyId)
        .populate('jobs');

    if (!company) return next(new Error("Company not found", { cause: 404 }));
    if(company.approvedByAdmin==false)
        return next(new Error("This company is not accepted by the admin", { cause: 403 }));

    return res.status(200).json({
        success: true,
        data: company
    });
};


export const searchByName = async (req, res, next) => {
    const { companyName } = req.query;

    if (!companyName) return next(new Error("Company name is required", { cause: 400 }));

    const company = await Company.findOne({
        companyName: { $regex: companyName, $options: 'i' },
        approvedByAdmin:true
    });

    if (!company) return next(new Error("Company not found", { cause: 404 }));


    return res.status(200).json({ success: true, data: company });
};


export const uploadelogo = async (req, res, next) => {

    const companyId = req.params.companyId;
    const userId = req.user._id;

    const company = await Company.findOne({ _id: companyId, deletedAt: { $exists: false },approvedByAdmin:true });
    if (!company) return next(new Error("company not found", { cause: 404 }));
    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to delete logo for this company", { cause: 403 }));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/Company/${req.user._id}/Company Logo` });

    company.logo = { secure_url, public_id };
    await company.save()
    return res.status(200).json({ success: true, company });
};


export const uploadeCover = async (req, res, next) => {

    const companyId = req.params.companyId;
    const userId = req.user._id;


    const company = await Company.findOne({ _id: companyId, deletedAt: { $exists: false },approvedByAdmin:true });
    if (!company) return next(new Error("company not found", { cause: 404 }));
    if (company?.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to delete logo for this company", { cause: 403 }));
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.CLOUD_FOLDER_NAME}/Company/${req.user._id}/Company Cover` });

    company.coverPic = { secure_url, public_id };
    await company.save()

    return res.status(200).json({ success: true, company });
};


export const deleteLogo = async (req, res, next) => {

    const companyId = req.params.companyId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return next(new Error("user not found", { cause: 404 }));
    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== userId.toString() && user.role !== "admin") {
        return next(new Error("You are not authorized to delete logo for this company", { cause: 403 }));
    }
    let results;
    if (company.logo.public_id != publicIdLogo)
        results = await cloudinary.uploader.destroy(company.logo.public_id)

    if (results?.result == "ok") {
        company.logo = {
            secure_url: comanyLogoDefault,
            public_id: publicIdLogo
        };
        await company.save();
    }

    return res.status(200).json({ success: true, message: "company logo deleted successfully" });
};

export const deleteCover = async (req, res, next) => {
    const companyId = req.params.companyId;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return next(new Error("user not found", { cause: 404 }));
    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== userId.toString() && user.role !== "admin") {
        return next(new Error("You are not authorized to delete logo for this company", { cause: 403 }));
    }
    let results;
    if (company.coverPic.public_id != publicIdCover)
        results = await cloudinary.uploader.destroy(company.coverPic.public_id)

    if (results?.result == "ok") {
        company.coverPic = {
            secure_url: defaultCover,
            public_id: publicIdCover
        };
        await company.save();
    }

    return res.status(200).json({ success: true, message: "company cover pic deleted successfully" });
};

export const addHRToCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const { userId } = req.body;

    const company = await Company.findOne({ _id: companyId, deletedAt: { $exists: false },approvedByAdmin:true });
    if (!company) return next(new Error("company not found", { cause: 404 }));

    const isAuthorized = company.createdBy.toString() === req.user._id.toString() || company.HRs.includes(req.user._id);
    if (!isAuthorized) return next(new Error("You are not authorized to delete this company", { cause: 403 }));

    let user = await User.findById(userId);
    if (!user) return next(new Error("User not found", { cause: 404 }));

    if (company.HRs.includes(userId)) return next(new Error("User is already an HR for this company"));

    company.HRs.push(userId);
    user.jobRole = jobRole.HR;

    await user.save();
    await company.save();

    return res.status(200).json({
        success: true,
        message: "User successfully added as HR",
    });
};