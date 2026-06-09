const CLOUD_NAME = "ddmx5qvhn";
const UPLOAD_PRESET = "upload_profile";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function uploadImageToCloudinary(uri: string, mimeType = "image/jpeg"): Promise<CloudinaryUploadResult> {
  console.log(`[CLOUDINARY] uploadImageToCloudinary → uri=${uri} mimeType=${mimeType}`);
  // Derive a sensible extension from the mime type
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const formData = new FormData();
  formData.append("file", { uri, type: mimeType, name: `upload.${ext}` } as any);
  formData.append("upload_preset", UPLOAD_PRESET);
  console.log(`[CLOUDINARY] POST https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  console.log(`[CLOUDINARY] response status=${response.status} ok=${response.ok}`);
  if (!response.ok) {
    const text = await response.text();
    console.error(`[CLOUDINARY] upload error body: ${text}`);
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  console.log(`[CLOUDINARY] upload success → secure_url=${data.secure_url} public_id=${data.public_id}`);
  if (!data.secure_url || !data.public_id) {
    console.error(`[CLOUDINARY] unexpected response:`, JSON.stringify(data));
    throw new Error("Cloudinary returned an unexpected response. Check upload preset configuration.");
  }
  return { secure_url: data.secure_url, public_id: data.public_id };
}

/**
 * Deletes an image from Cloudinary via our API server.
 * The server handles the signed request (CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET).
 * In the browser, calls go through the dev-proxy at /api.
 * In native, uses EXPO_PUBLIC_API_URL if set.
 * This is best-effort — Firebase removal already handled separately.
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    let base: string;

    if (process.env.EXPO_PUBLIC_API_URL) {
      base = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      // Browser (Expo web): use relative path — dev-proxy routes /api → API server
      base = "";
    } else {
      // Native without config — skip
      return;
    }

    await fetch(`${base}/api/media/cloudinary/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
  } catch {
    // Best-effort: Firebase deletion already happened; orphaned Cloudinary file is acceptable
  }
}
