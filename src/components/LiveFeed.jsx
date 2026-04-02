import { useEffect, useRef, useState } from 'react';
import { useCheckinFeed } from '../hooks/useFeed';

const VERBS = [
  '뽑았어요 🎲', '뽑아버렸어요 ✨',
  '을(를) 득템했어요 💕', '행 확정 🌸',
  '으로 데이트 간대요 💌', '역 도장 찍으러 간대요 👣',
];

function makeSentence(nickname, station, lineKey) {
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const sfx = ['을(를)', '행', '으로', '역'].some(s => verb.startsWith(s));
  return sfx
    ? `${nickname} 커플이 ${station}역 ${verb}`
    : `${nickname} 커플이 ${lineKey}호선 ${station}역 ${verb}`;
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const M = d.getMonth() + 1;
    const D = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${M}/${D} ${h}:${m}`;
  } catch { return ''; }
}

// 배열 보장 헬퍼
function toArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function LiveFeed({ feed }) {
  const [items, setItems] = useState([]);
  const [open, setOpen]   = useState(true);

  // 초기화 완료 여부 추적 (null = 아직, Set = 초기화 완료된 ID 세트)
  const initSpinIds    = useRef(null);
  const initCheckinIds = useRef(null);

  const { checkinFeed } = useCheckinFeed();

  // ── spins ──────────────────────────────────────────────────────
  useEffect(() => {
    const arr = toArray(feed);
    if (arr.length === 0) return;

    // 첫 스냅샷: ID set만 저장하고 피드에 채워 넣기
    if (initSpinIds.current === null) {
      initSpinIds.current = new Set(arr.map(f => f.id).filter(Boolean));
      setItems(prev => {
        const existingKeys = new Set(toArray(prev).map(p => p._key));
        const initial = arr
          .filter(f => f.id && !existingKeys.has(f.id))
          .map(f => ({ ...f, _type: 'spin', _key: f.id }));
        return [...toArray(prev), ...initial].slice(0, 50);
      });
      return;
    }

    // 이후: 신규 항목만
    const newItems = arr
      .filter(f => f.id && !initSpinIds.current.has(f.id))
      .map(f => ({ ...f, _type: 'spin', _key: f.id }));

    if (newItems.length > 0) {
      newItems.forEach(f => initSpinIds.current.add(f.id));
      setItems(prev => [...newItems, ...toArray(prev)].slice(0, 50));
    }
  }, [feed]);

  // ── checkins ───────────────────────────────────────────────────
  useEffect(() => {
    const arr = toArray(checkinFeed);
    if (arr.length === 0) return;

    if (initCheckinIds.current === null) {
      initCheckinIds.current = new Set(arr.map(f => f.id).filter(Boolean));
      setItems(prev => {
        const existingKeys = new Set(toArray(prev).map(p => p._key));
        const initial = arr
          .filter(f => f.id && !existingKeys.has(f.id))
          .map(f => ({ ...f, _type: 'checkin', _key: f.id }));
        return [...toArray(prev), ...initial].slice(0, 50);
      });
      return;
    }

    const newItems = arr
      .filter(f => f.id && !initCheckinIds.current.has(f.id))
      .map(f => ({ ...f, _type: 'checkin', _key: f.id }));

    if (newItems.length > 0) {
      newItems.forEach(f => initCheckinIds.current.add(f.id));
      setItems(prev => [...newItems, ...toArray(prev)].slice(0, 50));
    }
  }, [checkinFeed]);

  return (
    <div style={{
      margin: '0 16px 24px',
      borderRadius: 20,
      background: '#fff',
      border: '1.5px solid rgba(232,87,138,0.18)',
      boxShadow: '0 4px 20px rgba(232,87,138,0.08)',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(232,87,138,0.07), rgba(168,85,247,0.07))',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>💬</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)' }}>실시간 피드</span>
          {items.length > 0 && (
            <span style={{
              background: 'var(--pink)', color: '#fff',
              fontSize: 10, fontWeight: 700,
              padding: '1px 6px', borderRadius: 10,
            }}>
              {items.length}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11, color: 'var(--muted)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', display: 'inline-block',
        }}>▼</span>
      </button>

      {/* 로그 목록 */}
      {open && (
        <div style={{ maxHeight: 260, overflowY: 'auto', padding: '6px 0' }}>
          {items.length === 0 ? (
            <div style={{
              padding: '18px 0', textAlign: 'center',
              fontSize: 11, color: 'var(--muted)', fontWeight: 500,
            }}>
              아직 아무도 뽑지 않았어요 — 첫 번째가 되어보세요! 🌸
            </div>
          ) : (
            items.map((item, idx) => (
              <LogRow key={item._key} item={item} isNew={idx === 0} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LogRow({ item, isNew }) {
  const [visible, setVisible] = useState(false);
  const isCheckin = item._type === 'checkin';

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const text = isCheckin
    ? `📍 ${item.nickname} 커플이 ${item.station}역 다녀왔어요! "${item.review}"`
    : makeSentence(item.nickname, item.station, item.lineKey);

  const timeStr = formatTime(item.timestamp);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 16px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'opacity 0.25s, transform 0.25s',
      background: (isNew && isCheckin)
        ? 'rgba(76,175,80,0.05)'
        : isNew
          ? 'rgba(232,87,138,0.04)'
          : 'transparent',
    }}>
      {/* 뱃지 */}
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: isCheckin ? '#4caf50' : (item.lineColor || '#e8578a'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: '#fff', fontWeight: 800,
        fontFamily: "'마루 부리', 'MaruBuri', serif",
      }}>
        {isCheckin ? '✅' : item.lineKey}
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, lineHeight: 1.4,
          color: isCheckin ? '#2e7d32' : '#555',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {text}
        </div>
        {timeStr && (
          <div style={{ fontSize: 9, color: '#bbb', marginTop: 1 }}>
            {timeStr}
          </div>
        )}
      </div>
    </div>
  );
}
