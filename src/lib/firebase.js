import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3RZhhP6dnkT8K-hCiwpMdls79vsg0XC0",
  authDomain: "tlrks45qns.firebaseapp.com",
  projectId: "tlrks45qns",
  storageBucket: "tlrks45qns.firebasestorage.app",
  messagingSenderId: "353924438666",
  appId: "1:353924438666:web:22eff85301d4875c62eb73",
  measurementId: "G-QTVQRG44S3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
