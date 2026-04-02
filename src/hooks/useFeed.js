import { useEffect, useState, useRef } from 'react';
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot,
  serverTimestamp, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firebase 실시간 피드 훅
 *
 * useFeed() → { feed, pushSpin, pushCheckin, pushRanking }
 *   feed: 최근 뽑기 기록 배열 (최대 20개)
 *   pushSpin(nickname, station, lineKey, lineColor): 새 기록 추가
 *   pushCheckin(nickname, station, lineKey, lineColor, review): checkins 컬렉션에 저장
 *   pushRanking(nameA, nameB, compat, station): rankings 컬렉션에 저장
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

  async function pushCheckin(nickname, station, lineKey, lineColor, review) {
    if (!db) return;
    try {
      await addDoc(collection(db, 'checkins'), {
        nickname,
        station,
        lineKey,
        lineColor,
        review,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('체크인 기록 실패:', e.message);
    }
  }

  async function pushRanking(nameA, nameB, compat, station) {
    if (!db) return;
    try {
      await addDoc(collection(db, 'rankings'), {
        nameA,
        nameB,
        compat,
        station,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('랭킹 기록 실패:', e.message);
    }
  }

  return { feed, pushSpin, pushCheckin, pushRanking };
}

/**
 * 오늘 날짜 기준 station별 뽑기 카운트 반환
 * useStationCounts() → { stationCounts }
 *   stationCounts: { [stationName]: count }
 */
export function useStationCounts() {
  const [stationCounts, setStationCounts] = useState({});

  useEffect(() => {
    if (!db) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = Timestamp.fromDate(todayStart);

    const q = query(
      collection(db, 'spins'),
      where('timestamp', '>=', todayTs),
      orderBy('timestamp', 'desc'),
      limit(200),
    );

    const unsub = onSnapshot(q, (snap) => {
      const counts = {};
      snap.docs.forEach(doc => {
        const { station } = doc.data();
        if (station) {
          counts[station] = (counts[station] || 0) + 1;
        }
      });
      setStationCounts(counts);
    });

    return () => unsub();
  }, []);

  return { stationCounts };
}

/**
 * 오늘의 궁합 랭킹 상위 10개 반환
 * useRankings() → { rankings }
 */
export function useRankings() {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (!db) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = Timestamp.fromDate(todayStart);

    const q = query(
      collection(db, 'rankings'),
      where('timestamp', '>=', todayTs),
      orderBy('timestamp', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // compat 내림차순 정렬 후 상위 10개
      items.sort((a, b) => (b.compat || 0) - (a.compat || 0));
      setRankings(items.slice(0, 10));
    });

    return () => unsub();
  }, []);

  return { rankings };
}

/**
 * checkins 최근 10개 실시간 구독
 * useCheckinFeed() → { checkinFeed }
 */
export function useCheckinFeed() {
  const [checkinFeed, setCheckinFeed] = useState([]);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'checkins'),
      orderBy('timestamp', 'desc'),
      limit(10),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCheckinFeed(items);
    });

    return () => unsub();
  }, []);

  return { checkinFeed };
}
