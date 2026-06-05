import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, Persistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "game-217ce.firebaseapp.com",
  projectId: "game-217ce",
  storageBucket: "game-217ce.firebasestorage.app",
  messagingSenderId: "25583360638",
  appId: "1:25583360638:web:941d312e9455d705a7562f",
  measurementId: "G-2W6JVL87WG",
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
