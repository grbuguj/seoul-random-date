import { useState } from 'react';

/**
 * 오늘의 궁합 TOP 5 랭킹 카드
 * props: rankings (배열) — { id, nameA, nameB, compat, station, timestamp }
 */
export default function RankingCard({ rankings }) {
  const [open, setOpen] = useState(false);

  if (!rankings || rankings.length === 0) return null;

  const top5 = rankings.slice(0, 5);

  const rankEmoji = (i) => {
    if (i === 0) return '👑';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `${i + 1}위`;
  };

  const compatColor = (compat) => {
    if (compat >= 90) return '#e8578a';
    if (compat >= 75) return '#f06292';
    if (compat >= 60) return '#f48fb1';
    return '#ffb3c6';
  };

  return (
    <div style={{
      margin: '0 16px 12px',
      borderRadius: 20,
      background: '#fff',
      border: '1.5px solid rgba(232,87,138,0.22)',
      boxShadow: '0 4px 20px rgba(232,87,138,0.10)',
      overflow: 'hidden',
    }}>
      {/* 헤더 — 토글 버튼 */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(232,87,138,0.08), rgba(168,85,247,0.08))',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💘</span>
          <span style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--pink)',
          }}>
            오늘의 궁합 TOP 5
          </span>
          <span style={{
            background: 'var(--pink)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 10,
          }}>
            {top5.length}팀
          </span>
        </div>
        <span style={{
          fontSize: 12,
          color: 'var(--muted)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>
          ▼
        </span>
      </button>

      {/* 내용 — 접힘/펼침 */}
      {open && (
        <div style={{ padding: '4px 0 10px' }}>
          {top5.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                borderBottom: i < top5.length - 1 ? '1px solid rgba(232,87,138,0.08)' : 'none',
                background: i === 0 ? 'rgba(232,87,138,0.04)' : 'transparent',
              }}
            >
              {/* 순위 */}
              <div style={{
                width: 30,
                textAlign: 'center',
                fontSize: i < 3 ? 18 : 12,
                fontWeight: 800,
                color: i === 0 ? '#e8578a' : i === 1 ? '#9e9e9e' : i === 2 ? '#cd7f32' : 'var(--muted)',
                fontFamily: "'마루 부리', 'MaruBuri', serif",
                flexShrink: 0,
              }}>
                {rankEmoji(i)}
              </div>

              {/* 이름 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'마루 부리', 'MaruBuri', serif",
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.nameA} 💕 {item.nameB}
                </div>
                {item.station && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginTop: 1 }}>
                    📍 {item.station}역
                  </div>
                )}
              </div>

              {/* 궁합 퍼센트 */}
              <div style={{
                background: `${compatColor(item.compat)}18`,
                border: `1.5px solid ${compatColor(item.compat)}44`,
                borderRadius: 50,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 800,
                color: compatColor(item.compat),
                fontFamily: "'마루 부리', 'MaruBuri', serif",
                flexShrink: 0,
              }}>
                {item.compat}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
