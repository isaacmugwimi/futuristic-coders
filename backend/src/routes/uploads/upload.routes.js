import { Router } from "express";
import { uploadImage } from "../../controller/uploads/upload.controller.js";
import upload from "../../middleware/upload/programThumbnailUpload.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.post(
  "/image",
  authenticateUser,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadImage,
);

export default router;
