import express from "express";
import multer from "multer";
import path from "path";
import { uploadFileS3 } from "../utils/s3.js";
import fs from "fs";
import util from "util";
const unLinkFile = util.promisify(fs.unlink);

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads/");
    },
    filename(req, file, callback) {
        callback(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, callback) {
    const fileTypes = /jpg|jpeg|png/;
    const extNameCheck = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeTypeCheck = fileTypes.test(file.mimetype);

    if (extNameCheck && mimeTypeCheck) {
        return callback(null, true);
    } else {
        callback("Images Only Allowed To Upload!");
    }
}

const upload = multer({
    storage,
    fileFilter(req, file, callback) {
        checkFileType(file, callback);
    },
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const finalPath = req.file.path.replace("\\", "/");
        const resultS3 = await uploadFileS3(req.file);
        await unLinkFile(req.file.path);

        res.send({ path: `/${finalPath}`, s3Path: resultS3.Location });
    } catch (error) {
        res.status(401);
        throw new Error("Error in Uploading: " + error);
    }
});

// Get FIle From AWS
router.get("/", (req, res) => {
    const key = req.params.key;
});

export default router;
