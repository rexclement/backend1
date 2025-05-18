import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from 'url';

// Emulate __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Factory function to configure multer
const getMulterUpload = (folderName, allowedTypes) => {
  const uploadDir = path.join(__dirname, `../uploads/${folderName}`);
  fs.ensureDirSync(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
};

// Export specific configurations
export const eventUpload = getMulterUpload("event_fliers", ["image/jpeg", "image/png", "image/jpg"]);
export const documentUpload = getMulterUpload("documents", [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
export const teamMemberUpload = getMulterUpload("team_members", ["image/jpeg", "image/png", "image/jpg"]);