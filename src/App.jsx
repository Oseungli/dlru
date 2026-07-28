import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ nickname: '모닝러', gold: 0, exp: 0 });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Firebase 로그인 상태 및 사용자 데이터 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Firestore에서 사용자 프로필 정보 가져오기
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("프로필 정보 로드 실패:", error);
        }
      } else {
        setUserData({ nickname: '모닝러', gold: 0, exp: 0 });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    alert('로그아웃 되었습니다.');
  };

  return (
    
      {/* 1. 상단 헤더 (Header) */}
      
        
          
            ALLAM .
          
        

        
          {user ? (
            
              
                💰 {userData.gold || 0} G
              
              
                로그아웃
              
            
          ) : (
             setIsAuthOpen(true)} style={{
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              로그인 / 회원가입
            
          )}
        
      

      {/* 2. 본문 컨텐츠 메인 영역 */}
      
        {activeTab === 'home' && (
          
            {/* 다음 알람 카드 */}
            
              
                다음 모닝콜 알람
                
                  🔥 5일 연속 성공
                
              
              
                07:00 AM
              
              
                목표: "오전 7시에 일어나서 운동하기"
              
            

            {/* 오늘의 미션 카드 */}
            
              🎯 오늘의 기상 미션
              
                
                  7시 이전 기상하기
                  [완료]
                
                
                  AI 모닝콜 대화 듣기
                  
                    +50G 받기
                  
                
              
            
          
        )}

        {activeTab === 'alarm' && (
          
            ☀️ AI 모닝콜 설정
            AI 페르소나가 나만의 기상 대사를 맞춤 생성해 드립니다.
          
        )}

        {activeTab === 'community' && (
          
            👥 기상 커뮤니티
            모닝러들과 기상 인증을 공유해 보세요!
          
        )}

        {activeTab === 'shop' && (
          
            🛍️ 포인트 상점
            모은 골드로 프로필 치장 아이템을 구매하세요.
          
        )}
      

      {/* 3. 하단 네비게이션 바 (Bottom Nav) */}
      
        {[
          { id: 'home', label: '홈', icon: '🏠' },
          { id: 'alarm', label: 'AI 모닝콜', icon: '☀️' },
          { id: 'community', label: '커뮤니티', icon: '👥' },
          { id: 'shop', label: '상점', icon: '🛍️' }
        ].map((tab) => (
           setActiveTab(tab.id)} style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: activeTab === tab.id ? '#7C3AED' : '#94A3B8',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal'
          }}>
            {tab.icon}
            {tab.label}
          
        ))}
      

      {/* 4. 로그인/회원가입 모달 팝업 */}
       setIsAuthOpen(false)}
        onLoginSuccess={(u) => alert(`${u.email}님, 환영합니다!`)}
      />
    
  );
}
