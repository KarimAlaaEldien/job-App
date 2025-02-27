import Company from "../../DB/model/company.model.js";
import User from "../../DB/model/user.model.js";


export const banOrUnBanUser = async (req, res, next) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return next(new Error("User not found!", { cause: 404 }));

    let message;
    if (user.bannedAt) {
        await User.updateOne({ _id: userId }, { $unset: { bannedAt: "" } });
        message = "user has been unbanned successfully"
    } else {
        user.bannedAt = new Date();
        await user.save();
        message = "user has been banned successfully"
    }

    return res.status(200).json({ success: true, message });
};

export const banOrUnBanCompany = async (req, res, next) => {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) return next(new Error("User not found!", { cause: 404 }));

    let message;
    if (company.bannedAt) {
        await Company.updateOne({ _id: companyId }, { $unset: { bannedAt: "" } });
        message = "company has been unbanned successfully"
    } else {
        company.bannedAt = new Date();
        await company.save();
        message = "company has been banned successfully"
    }

    return res.status(200).json({ success: true, message });
};


export const approveCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.approvedByAdmin) {
        return res.status(400).json({ success: false, message: "Company is already approved" });
    }

    company.approvedByAdmin=true;
    await company.save()

    return res.status(200).json({
        success: true,
        message: "Company has been approved successfully"
    });
};