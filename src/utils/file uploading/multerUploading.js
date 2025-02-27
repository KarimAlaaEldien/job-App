import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";


export const extensionValidation = {
    images: ["image/png", "image/jpeg"],
    sheet: ["application/msword", "application/pdf"],
}

export const uploadeFile = (fileType, folder) => {
    const storage = diskStorage({
        destination: (req, file, cb) => {
            let pathFolder = path.resolve(`${folder}/${req.user._id}`);
            if (!fs.existsSync(pathFolder))
                fs.mkdirSync(pathFolder,{ recursive: true });
            console.log(pathFolder);
            
            cb(null , pathFolder)

        }, filename: (req, file, cb) => {
            console.log(file), "kl";

            cb(null, nanoid() + "__" + file.originalname)
        }
    });

    const fileFilter = function (req, file, cb) {
        if (!fileType.includes(file.mimetype))
            return cb(new Error(`The only files allowed are ${JSON.stringify(fileType)}`), false);
        return cb(null, true);
    };

    const multerUploade = multer({ storage, fileFilter });
    return multerUploade;
};