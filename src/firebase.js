// src/firebase.js
// ⚠️  REPLACE these values with your own Firebase project config
// (You'll get these from Firebase Console → Project Settings → Your Apps)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKV-MU8c1RN4T_7MpF2aVeDNqrQrn2QPI",
  authDomain: "camila-s-sleep.firebaseapp.com",
  projectId: "camila-s-sleep",
  storageBucket: "camila-s-sleep.firebasestorage.app",
  messagingSenderId: "192609755896",
  appId: "1:192609755896:web:a4ac6c49ddd64912d9510d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
