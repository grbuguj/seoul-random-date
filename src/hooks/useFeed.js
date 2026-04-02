import { useEffect, useState, useRef } from 'react';
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firebase 실시간 피드 훅
 *
 * useFeed() → { feed, pushSpin }
 *   feed: 최근 뽑기 기록 배열 (최대 20개)
 *   pushSpin(nickname, station, lineKey, lineColor): 새 기록 추가
 */
export function useFeed() {
  const [feed, setFeed] = useState([]);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!db) return; // Firebase 없으면 피드 비활성화

    const q = query(
      collection(db, 'spins'),
      orderBy('timestamp', 'desc'),
      limit(20),
    );

    unsubRef.current = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeed(items);
    });

    return () => unsubRef.current?.();
  }, []);

  async function pushSpin(nickname, station, lineKey, lineColor) {
    if (!db) return;
    try {
      await addDoc(collection(db, 'spins'), {
        nickname,
        station,
        lineKey,
        lineColor,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('피드 기록 실패:', e.message);
    }
  }

  return { feed, pushSpin };
}
