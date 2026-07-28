import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Firebase Auth 회원가입
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore DB 'users' 컬렉션에 프로필 정보 저장
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          nickname: nickname || '모닝러',
          gold: 0,
          exp: 0,
          role: 'user',
          createdAt: new Date()
        });

        alert('회원가입이 완료되었습니다! 로그인해 주세요.');
        setIsSignUp(false);
      } else {
        // Firebase 로그인
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(userCredential.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        setErrorMsg('오류가 발생했습니다: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
        {isSignUp ? 'ALLAM 회원가입' : 'ALLAM 로그인'}
        
          {isSignUp && (
             setNickname(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          )}
           setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
           setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
          {errorMsg && {errorMsg}}
          
            {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
          
        
        
           { setIsSignUp(!isSignUp); setErrorMsg(''); }} style={{ color: '#7C3AED', cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? '로그인으로 전환' : '회원가입으로 전환'}
          
        
        닫기
      
    
  );
}
