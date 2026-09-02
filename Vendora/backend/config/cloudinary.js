const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file buffer to Cloudinary (never exposes credentials to the client).
const uploadBuffer = (buffer, folder = "vendora") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

// Extract the public_id from a Cloudinary delivery URL.
const publicIdFromUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("/upload/")) return null;
  const after = url.split("/upload/")[1];
  const withoutVersion = after.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, "");
};

// Destroy a Cloudinary asset (safe to call with local/legacy paths — no-ops).
const deleteAsset = async (url) => {
  try {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
  }
};

module.exports = { cloudinary, uploadBuffer, deleteAsset, publicIdFromUrl };