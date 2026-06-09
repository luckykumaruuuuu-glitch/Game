const CLOUD_NAME = "ddmx5qvhn";
const UPLOAD_PRESET = "upload_profile";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function uploadImageToCloudinary(uri: string): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", { uri, type: "image/jpeg", name: "profile.jpg" } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${text}`);
  }

  const data = await response.json();
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
