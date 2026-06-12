import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  checkEmailAvailable,
  createUserProfileWithUsername,
  deleteAllUserData,
  getUserByUsername,
  getUserProfile,
  UserProfile,
} from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * While true, signUp is managing auth state manually.
   * onAuthStateChanged is ignored to prevent a race condition where Firebase
   * fires the listener before the Firestore profile is written, causing
   * AuthGate to briefly flash the home screen then kick back to login.
   */
  const signingUpRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (signingUpRef.current) return;
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signUp(email: string, password: string, username: string) {
    signingUpRef.current = true;
    setLoading(true);
    let cred: Awaited<ReturnType<typeof createUserWithEmailAndPassword>> | undefined;
    const authEmail = email.trim().toLowerCase();
    try {
      const emailFree = await checkEmailAvailable(authEmail);
      if (!emailFree) {
        const err: any = new Error("This Gmail is already registered.");
        err.code = "auth/gmail-already-registered";
        throw err;
      }

      cred = await createUserWithEmailAndPassword(auth, authEmail, password);
      await createUserProfileWithUsername(cred.user.uid, {
        email: authEmail,
        username,
        authEmail,
      });
      const p = await getUserProfile(cred.user.uid);
      setUser(cred.user);
      setProfile(p);
    } catch (e: any) {
      if (cred) await cred.user.delete().catch(() => {});
      setUser(null);
      setProfile(null);
      throw e;
    } finally {
      signingUpRef.current = false;
      setLoading(false);
    }
  }

  async function signIn(usernameOrEmail: string, password: string) {
    // Strip leading @ in case user typed "@username"
    const input = usernameOrEmail.trim().replace(/^@+/, "");

    let email: string;

    if (EMAIL_REGEX.test(input)) {
      // Looks like a proper email — sign in directly
      email = input;
    } else {
      // Treat as username — look up the authEmail from Firestore
      const p = await getUserByUsername(input.toLowerCase());
      if (!p) {
        const err: any = new Error("No account found with that username.");
        err.code = "auth/username-not-found";
        throw err;
      }
      email = p.authEmail ?? p.email;
    }

    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged fires → sets user + profile + loading = false
    // AuthGate then navigates to /(tabs)
  }

  async function signOut() {
    setUser(null);
    setProfile(null);
    setLoading(false);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore — local state is already cleared
    }
  }

  async function sendPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshProfile() {
    if (!user) return;
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    } catch {
      // ignore
    }
  }

  async function deleteAccount(password: string) {
    if (!user) throw new Error("No authenticated user.");
    const email = user.email;
    if (!email) throw new Error("No email on account.");

    // Re-authenticate to confirm identity before deletion
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete all Firestore data
    const username = profile?.username ?? "";
    await deleteAllUserData(user.uid, username);

    // Delete the Firebase Auth account
    await user.delete();

    // Clear local state
    setUser(null);
    setProfile(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, sendPasswordReset, refreshProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
