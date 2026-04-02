import { getCouplefortune, getCompatibilityScore } from '../data/coupleFortuneTexts';
import { playButtonPop } from '../utils/sounds';

/**
 * CoupleResult — 이름 기반 커플 결과 카드
 * props:
 *   nameA, nameB: string
 *   resultA, resultB: { lineKey, lineInfo, station }
 *   onShare: () => void
 */
export default function CoupleResult({ nameA, nameB, resultA, resultB, onShare }) {
  if (!resultA || !resultB) return null;

  const fortune     = getCouplefortune(nameA, nameB, resultA.station);
  const compat      = getCompatibilityScore(nameA, nameB);
  const compatEmoji = compat >= 90 ? '💘' : compat >= 75 ? '💕' : compat >= 60 ? '🩷' : '💛';

  return (
    <div style={{
      margin: '0 16px 14px',
      borderRadius: 20,
      background: '#fff',
      border: '1.5px solid rgba(232,87,138,0.22)',
      boxShadow: '0 6px 28px rgba(232,87,138,0.13), 0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      animation: 'slideUp 0.4s ease',
    }}>
      {/* 상단 그라디언트 바 */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${resultA.lineInfo.color}, #e8578a, ${resultB.lineInfo.color})`,
      }} />

      {/* 헤더 + 궁합 */}
      <div style={{ padding: '14px 20px 10px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', letterSpacing: 0.5, marginBottom: 6 }}>
          💑 오늘의 데이트 코스
        </div>

        {/* 궁합 점수 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(232,87,138,0.07)',
          border: '1px solid rgba(232,87,138,0.18)',
          borderRadius: 20,
          padding: '5px 14px',
        }}>
          <span style={{ fontSize: 16 }}>{compatEmoji}</span>
          <span style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontWeight: 800,
            fontSize: 15,
            color: 'var(--pink)',
          }}>
            오늘의 궁합 {compat}%
          </span>
        </div>
      </div>

      {/* 두 역 + 코스 화살표 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 16px 14px',
        gap: 10,
      }}>
        <StationCard name={nameA} result={resultA} />

        {/* 화살표 + 코스 설명 */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--pink-mid)' }}>→</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>
            오늘의<br/>코스
          </div>
        </div>

        <StationCard name={nameB} result={resultB} />
      </div>

      {/* 코스 설명 */}
      <div style={{
        margin: '0 20px 12px',
        padding: '10px 14px',
        borderRadius: 14,
        background: 'rgba(232,87,138,0.05)',
        border: '1px solid rgba(232,87,138,0.12)',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--muted)',
        fontWeight: 500,
        lineHeight: 1.6,
      }}>
        🗺 <strong style={{ color: 'var(--text)' }}>{resultA.station}역</strong>에서 출발해서{' '}
        <strong style={{ color: 'var(--text)' }}>{resultB.station}역</strong>까지!<br/>
        두 역 사이 골목골목이 오늘의 데이트 구역이에요 🌸
      </div>

      {/* 이름 기반 운세 */}
      <div style={{
        margin: '0 20px 14px',
        padding: '12px 14px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(255,182,203,0.12), rgba(232,87,138,0.08))',
        border: '1px solid rgba(232,87,138,0.20)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>🔮</span>
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.5 }}>
            {fortune.text}
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--pink)',
            lineHeight: 1.2,
            marginTop: 2,
          }}>
            {fortune.percent}
          </div>
        </div>
      </div>

      {/* 공유 버튼 */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
        <button
          onClick={() => { playButtonPop(); onShare?.(); }}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 14,
            border: 'none',
            background: '#FEE500',
            color: '#3C1E1E',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          💬 카카오로 공유
        </button>
        <button
          onClick={() => { playButtonPop(); onShare?.('copy'); }}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 14,
            border: '1.5px solid rgba(232,87,138,0.3)',
            background: 'rgba(232,87,138,0.06)',
            color: 'var(--pink)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🔗 링크 복사
        </button>
      </div>
    </div>
  );
}

function StationCard({ name, result }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      {/* 이름 */}
      <div style={{
        fontSize: 12, fontWeight: 700,
        color: 'var(--muted)',
        marginBottom: 6,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {name}의 역
      </div>

      {/* 호선 배지 */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 14,
        background: result.lineInfo.color,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 7px',
        boxShadow: `0 3px 10px ${result.lineInfo.color}55`,
      }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>호선</span>
        <span style={{
          fontSize: 20, color: '#fff',
          fontFamily: "'마루 부리', 'MaruBuri', serif",
          fontWeight: 800, lineHeight: 1,
        }}>{result.lineKey}</span>
      </div>

      {/* 역명 */}
      <div style={{
        fontFamily: "'마루 부리', 'MaruBuri', serif",
        fontSize: 18, fontWeight: 800,
        color: result.lineInfo.color,
        letterSpacing: -0.5,
        lineHeight: 1.1,
      }}>
        {result.station}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>역</div>
    </div>
  );
}
