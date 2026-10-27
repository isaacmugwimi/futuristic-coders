import asyncHandler from "../../middleware/error/asyncHandler.js";
import cloudinary from "../../config/cloudinary/cloudinary.js";

const UPLOAD_FOLDERS = {
  programs: "futuristic-coders/programs",
  blogs: "futuristic-coders/blogs",
  profiles: "futuristic-coders/profiles",
  testimonials: "futuristic-coders/testimonials",
  general: "futuristic-coders/general",
};

const IMAGE_TRANSFORMATIONS = {
  programs: {
    width: 1200,
    height: 675,
    crop: "limit",
  },
  blogs: {
    width: 1600,
    height: 1200,
    crop: "limit",
  },
  profiles: {
    width: 500,
    height: 500,
    crop: "limit",
  },
  testimonials: {
    width: 1000,
    height: 1000,
    crop: "limit",
  },
  general: {
    width: 1600,
    height: 1600,
    crop: "limit",
  },
};

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select an image to upload.",
    });
  }

  const category = req.body.category || "general";
  const folder = UPLOAD_FOLDERS[category];

  if (!folder) {
    return res.status(400).json({
      success: false,
      message: "Invalid image upload category.",
      allowedCategories: Object.keys(UPLOAD_FOLDERS),
    });
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [IMAGE_TRANSFORMATIONS[category]],
      },
      (error, uploadedImage) => {
        if (error) return reject(error);
        resolve(uploadedImage);
      },
    );

    stream.end(req.file.buffer);
  });

  return res.status(201).json({
    success: true,
    message: "Image uploaded successfully.",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    },
  });
});
