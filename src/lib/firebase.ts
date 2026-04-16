import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAS4ZMI_P05AKQWyJmshosSdJCbo9kAIJo",
  authDomain: "techlandiard.firebaseapp.com",
  projectId: "techlandiard",
  storageBucket: "techlandiard.firebasestorage.app",
  messagingSenderId: "889767477275",
  appId: "1:889767477275:web:40f06f9f280c627191b8be",
};

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
