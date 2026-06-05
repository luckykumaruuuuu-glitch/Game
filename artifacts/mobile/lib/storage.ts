import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function uploadProfilePhoto(
  userId: string,
  uri: string
): Promise<string> {
  const blob = await uriToBlob(uri);
  const storageRef = ref(storage, `profile/${userId}/photo.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function uploadContentImage(
  userId: string,
  uri: string
): Promise<string> {
  const blob = await uriToBlob(uri);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const storageRef = ref(storage, `images/${userId}/${filename}.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
