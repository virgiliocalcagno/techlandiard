"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
export type UserRole = "admin" | "seller" | "viewer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
}

/* ═══════════════════════════════════════════════════════
   CONTEXT
   ═══════════════════════════════════════════════════════ */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Recuperar perfil de cache para evitar el "spinner de la eternidad"
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("auth_profile");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Listen auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        if (typeof window !== "undefined") localStorage.removeItem("auth_profile");
        setLoading(false);
        return;
      }

      // Si ya tenemos un perfil en cache, podemos quitar el loading inmediatamente
      if (profile) {
        setLoading(false);
      }

      try {
        const profileRef = doc(db, "users", firebaseUser.uid);
        
        // Timeout para el fetch del perfil (5s) para no bloquear la app
        const profilePromise = getDoc(profileRef);
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 5000)
        );

        const profileSnap = (await Promise.race([profilePromise, timeout])) as any;

        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as UserProfile;
          setProfile(profileData);
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_profile", JSON.stringify(profileData));
          }
        } else {
          // Primer login: crear perfil
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            role: "admin", 
            photoURL: firebaseUser.photoURL || undefined,
          };
          setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          }).catch(console.error);
          setProfile(newProfile);
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_profile", JSON.stringify(newProfile));
          }
        }
      } catch (err) {
        console.warn("Profile fetch issue (offline or blocked):", err);
        // Fallback: si no hay perfil, creamos uno minimalista basado en firebaseUser
        if (!profile) {
          const fallback: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            role: "admin",
            photoURL: firebaseUser.photoURL || undefined,
          };
          setProfile(fallback);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email
  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Create profile
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name,
      role: "seller",
    };
    await setDoc(doc(db, "users", cred.user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
    });
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Sign out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const isAdmin = profile?.role === "admin";
  const isSeller = profile?.role === "seller" || profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOut, isAdmin, isSeller }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
