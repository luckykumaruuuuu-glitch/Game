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

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    let apiBase: string | null = null;

    if (process.env.EXPO_PUBLIC_API_URL) {
      apiBase = process.env.EXPO_PUBLIC_API_URL;
    } else if (typeof window !== "undefined" && window.location?.hostname) {
      apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;
    }

    if (!apiBase) return;

    await fetch(`${apiBase}/api/media/cloudinary/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
  } catch {
    // Best-effort: Firebase deletion already happened; Cloudinary cleanup may be orphaned
  }
}
