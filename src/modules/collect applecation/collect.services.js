import Application from "../../DB/model/applecation.model.js";
import Company from "../../DB/model/company.model.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import os from "os";

export const exportCompanyApplications = async (req, res, next) => {
    const { companyId, date } = req.query;

    if (!companyId || !date) return next(new Error("Company ID and date are required!", { cause: 400 }));
    
    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found!", { cause: 404 }));
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);


    const applications = await Application.find({
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .populate({
            path: "jobId",
            match: { companyId },
            select: "companyId",
        })
        .populate("userId", "firstName lastName email mobileNumber");

    const filteredApplications = applications.filter(app => app.jobId !== null);
    if (filteredApplications.length === 0) {
        return res.status(200).json({ message: "No applications found for this date." });
    }

    const data = filteredApplications.map(app => ({
        "Applicant Name": `${app.userId?.firstName || "Not Available"} ${app.userId?.lastName || ""}`,
        "Email": app.userId?.email || "Not Available",
        "Mobile Number": app.userId?.mobileNumber || "Not Available",
        "Applied Date": app.createdAt.toISOString()
    }));

    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    const tempDir = os.tmpdir();
    const fileName = `applications_${company.companyName}_${date}.xlsx`;
    const filePath = path.join(tempDir, fileName);

    await fs.promises.writeFile(filePath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));

    if (!fs.existsSync(filePath)) {
        return next(new Error("File creation failed!", { cause: 500 }));
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Length", fs.statSync(filePath).size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);


    fileStream.on("end", () => {
        fs.promises.unlink(filePath)
            .then(() => console.log("File deleted:", filePath))
            .catch(unlinkErr => console.error("Error deleting file:", unlinkErr));
    });

    fileStream.on("error", (err) => {
        next(new Error("Error downloading file", { cause: 500 }));
    });
};