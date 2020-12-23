import express from "express";
import multer from "multer";
import path from "path";

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

router.post("/", upload.single("image"), (req, res) => {
    const finalPath = req.file.path.replace("\\", "/");
    res.send(`/${finalPath}`);
});

export default router;
