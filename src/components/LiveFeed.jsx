import { useEffect, useRef, useState } from 'react';

// 유머러스한 액션 문구들
const ACTIONS = [
  '님이', '님께서', '님은', '님도',
];
const VERBS = [
  '뽑았어요 🎲', '뽑아버렸어요 ✨', '을(를) 득템했어요 💕',
  '행 확정 🌸', '으로 데이트 간대요 💌', '역 도장 찍으러 간대요 👣',
];

function makeSentence(nickname, station, lineKey) {
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const verb   = VERBS[Math.floor(Math.random() * VERBS.length)];
  // "뽑았어요" 류는 역명 포함, "행 확정" 류는 역명을 앞에 붙임
  if (verb.startsWith('을(를)') || verb.startsWith('행') || verb.startsWith('으로') || verb.startsWith('역')) {
    return `${nickname} ${action} ${station}역 ${verb}`;
  }
  return `${nickname} ${action} ${lineKey}호선 ${station}역 ${verb}`;
}

/**
 * LiveFeed
 * props:
 *   feed: [{ id, nickname, station, lineKey, lineColor, timestamp }]
 */
export default function LiveFeed({ feed }) {
  const [visibleItems, setVisibleItems] = useState([]);
  const prevFeedRef = useRef([]);
  const timerRef    = useRef({});

  // 새 항목만 추출해 visibleItems에 append
  useEffect(() => {
    if (!feed || feed.length === 0) return;

    const prevIds = new Set(prevFeedRef.current.map(f => f.id));
    const newItems = feed.filter(f => f.id && !prevIds.has(f.id));

    if (newItems.length > 0) {
      setVisibleItems(prev => {
        const combined = [...newItems.reverse(), ...prev].slice(0, 8);
        return combined;
      });

      // 각 항목 5초 후 자동 제거
      newItems.forEach(item => {
        if (timerRef.current[item.id]) clearTimeout(timerRef.current[item.id]);
        timerRef.current[item.id] = setTimeout(() => {
          setVisibleItems(prev => prev.filter(i => i.id !== item.id));
        }, 5000);
      });
    }

    prevFeedRef.current = feed;
  }, [feed]);

  if (visibleItems.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(340px, 90vw)',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      pointerEvents: 'none',
    }}>
      {visibleItems.map((item) => (
        <FeedBubble key={item.id} item={item} />
      ))}
    </div>
  );
}

function FeedBubble({ item }) {
  const [visible, setVisible] = useState(false);

  // mount 시 살짝 딜레이 후 페이드인
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const sentence = makeSentence(item.nickname, item.station, item.lineKey);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderRadius: 20,
      padding: '9px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      boxShadow: '0 4px 20px rgba(232,87,138,0.15), 0 1px 6px rgba(0,0,0,0.08)',
      border: '1px solid rgba(232,87,138,0.15)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      {/* 노선 뱃지 */}
      <div style={{
        width: 26, height: 26,
        borderRadius: 8,
        background: item.lineColor || '#e8578a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: 13,
        color: '#fff',
        fontWeight: 800,
        fontFamily: "'마루 부리', 'MaruBuri', serif",
      }}>
        {item.lineKey}
      </div>

      {/* 문구 */}
      <div style={{
        fontSize: 12,
        color: '#444',
        fontWeight: 600,
        lineHeight: 1.4,
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {sentence}
      </div>
    </div>
  );
}
