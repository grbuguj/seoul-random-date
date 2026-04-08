import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SESSION_KEY = 'seoul-date-visited';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'pc';
}

/**
 * 세션당 1회만 방문 기록
 */
export async function recordVisit() {
  if (!db) return;
  if (sessionStorage.getItem(SESSION_KEY)) return; // 이미 기록됨

  sessionStorage.setItem(SESSION_KEY, '1');

  try {
    await addDoc(collection(db, 'visits'), {
      device: getDeviceType(),
      referrer: document.referrer || 'direct',
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn('방문 기록 실패:', e.message);
  }
}
