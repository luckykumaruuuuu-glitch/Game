import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, Persistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// getReactNativePersistence exists in the RN bundle but is not typed in web declarations.
// We use require to avoid the TS error while keeping RN session persistence.
let auth: ReturnType<typeof getAuth>;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getReactNativePersistence } = require("firebase/auth") as typeof import("firebase/auth") & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  };
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
