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

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 파이어스토어 데이터베이스 내보내기 (서비스 계정 키 불필요)
export const db = getFirestore(app);
