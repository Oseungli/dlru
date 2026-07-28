import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // firebase.js 경로 확인
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [opinions, setOpinions] = useState([]);
  const [inputText, setInputText] = useState('');

  // ② 앱을 열면 Firestore에 저장된 글을 최신순으로 불러오기
  const fetchOpinions = async () => {
    try {
      const q = query(collection(db, "opinions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOpinions(list);
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
    }
  };

  useEffect(() => {
    fetchOpinions();
  }, []);

  // ① 입력창에 글을 쓰고 등록 버튼을 누르면 Firestore에 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await addDoc(collection(db, "opinions"), {
        text: inputText,
        createdAt: serverTimestamp() // ⑤ 최신순 정렬을 위한 서버 시간 기록
      });
      setInputText(''); // 입력창 초기화
      fetchOpinions(); // 목록 새로고침
    } catch (error) {
      console.error("데이터 저장 중 오류가 발생했습니다: ", error);
    }
  };

  return (
    <div className="opinion-board-container">
      {/* 의견 입력 폼 영역 */}
      <form onSubmit={handleSubmit} className="opinion-form">
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="소중한 의견을 입력해주세요..."
          required
        />
        <button type="submit">등록</button>
      </form>

      {/* 의견 목록 영역 (최신순 출력) */}
      <div className="opinion-list">
        {opinions.length === 0 ? (
          <p className="no-opinions">아직 등록된 의견이 없습니다.</p>
        ) : (
          opinions.map((item) => (
            <div key={item.id} className="opinion-item">
              <p className="opinion-text">{item.text}</p>
              <span className="opinion-date">
                {item.createdAt?.toDate 
                  ? item.createdAt.toDate().toLocaleDateString() + ' ' + item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '방금 전'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
