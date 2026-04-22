// ─── Firebase Config ──────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBC771sb2pJcrCD1MhtZ1WlBhn19zunR68",
  authDomain: "tiffo-1e245.firebaseapp.com",
  projectId: "tiffo-1e245",
  storageBucket: "tiffo-1e245.firebasestorage.app",
  messagingSenderId: "673979668784",
  appId: "1:673979668784:web:1ef1ec3263f4f2046cd0f5",
  measurementId: "G-5MPVEZ6ES1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Services
export const auth = getAuth(app);

// explicitly set local persistence to prevent session drops during React routing
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("Auth Persistence Error:", error));

// Configure Firestore to try WebSockets first to bypass aggressive adblockers 
// that block the long-polling HTTP fallback (/Listen/channel endpoints)
import { initializeFirestore } from "firebase/firestore";
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
});

export const storage = getStorage(app);
