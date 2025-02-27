import multer, { diskStorage } from "multer";


export const fileValidation = {
    images: ["image/png", "image/jpeg"],
    sheet: ["application/msword", "application/pdf"],
    sheetandImage: ["application/msword", "application/pdf","image/png", "image/jpeg"],
};

export const uploadeCloud = (fileType) => {
    const storage = diskStorage({})
    const fileFilter = function (req, file, cb) {
        if (!fileType.includes(file.mimetype))
            return cb(new Error(`The only files allowed are ${JSON.stringify(fileType)}`), false);
        return cb(null, true);
    };

    const multerUploade = multer({ storage ,fileFilter});
    return multerUploade;
};