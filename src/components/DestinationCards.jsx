import html2canvas from 'html2canvas';
import { getFortune } from '../data/fortuneTexts';
import { getCouplefortune, getCompatibilityScore } from '../data/coupleFortuneTexts';
import ImageGrid from './ImageGrid';
import { playTap, playButtonPop } from '../utils/sounds';

export default function DestinationCards({ destinations, nameA, nameB, destCount }) {
  if (!destinations || destinations.length === 0) return null;

  const allDone    = destinations.length === destCount;
  const nameCouple = nameA && nameB;

  const compat      = nameCouple ? getCompatibilityScore(nameA, nameB) : null;
  const compatEmoji = compat != null ? (compat >= 90 ? '💘' : compat >= 75 ? '💕' : compat >= 60 ? '🩷' : '💛') : null;
  const coupleFor   = nameCouple && destinations.length >= 2
    ? getCouplefortune(nameA, nameB, destinations[0].result.station)
    : null;

  // 오늘의 코스 요약 (2개 이상 완료 시)
  function CourseDesc() {
    if (!allDone || destinations.length < 2) return null;

    const stationNames = destinations.map(d => d.result.station);
    const courseText = stationNames.map((s, i) => (
      <span key={i}>
        {i > 0 && <span style={{ color: 'var(--muted)', margin: '0 4px' }}>→</span>}
        <strong style={{ color: 'var(--text)', fontFamily: "'마루 부리', 'MaruBuri', serif" }}>{s}역</strong>
      </span>
    ));

    return (
      <div style={{
        margin: '0 16px 12px',
        padding: '12px 16px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(232,87,138,0.06), rgba(168,85,247,0.06))',
        border: '1px solid rgba(232,87,138,0.15)',
        textAlign: 'center',
        animation: 'slideUp 0.4s ease',
      }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
          🗺 오늘의 데이트 코스
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          {courseText}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          {destinations.length === 2 ? '두 역에서 신나게 놀아봐요! 🌸' : '세 역 모두 정복해봐요! 🔥'}
        </div>
      </div>
    );
  }

  // 궁합 배너
  function CompatBanner() {
    if (!nameCouple || !allDone || compat == null) return null;
    return (
      <div style={{
        margin: '0 16px 12px',
        padding: '12px 18px',
        borderRadius: 16,
        background: '#fff',
        border: '1.5px solid rgba(232,87,138,0.22)',
        boxShadow: '0 4px 16px rgba(232,87,138,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideUp 0.35s ease',
      }}>
        <span style={{ fontSize: 28 }}>{compatEmoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            {nameA} ❤️ {nameB} 오늘의 궁합
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 22, fontWeight: 800,
            color: 'var(--pink)', lineHeight: 1.2,
          }}>
            {compat}%
          </div>
        </div>
        {coupleFor && (
          <div style={{ textAlign: 'right', maxWidth: 130 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>{coupleFor.text}</div>
            <div style={{
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 16, fontWeight: 800, color: 'var(--pink)',
            }}>{coupleFor.percent}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <CompatBanner />
      <CourseDesc />
      {destinations.map(({ label, labelEmoji, labelColor, result }, i) => (
        <SingleDestCard
          key={i}
          label={label}
          labelEmoji={labelEmoji}
          labelColor={labelColor}
          result={result}
          delay={i * 80}
        />
      ))}
    </div>
  );
}

function SingleDestCard({ label, labelEmoji, labelColor, result, delay }) {
  const { lineKey, lineInfo, station } = result;
  const fortune    = getFortune(station);
  const mapQuery   = encodeURIComponent(station + '역');
  const naverQuery = encodeURIComponent(station + '역 데이트');

  return (
    <div data-capture="result" style={{
      margin: '0 16px 14px',
      borderRadius: 20,
      background: '#fff',
      border: `1.5px solid ${lineInfo.color}44`,
      boxShadow: `0 6px 28px ${lineInfo.color}22, 0 2px 8px rgba(0,0,0,0.06)`,
      overflow: 'hidden',
      animation: `slideUp 0.4s ease ${delay}ms both`,
    }}>
      <div style={{ height: 5, background: `linear-gradient(90deg, ${lineInfo.color}, ${lineInfo.color}88)` }} />

      {label && (
        <div style={{ padding: '10px 20px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11, fontWeight: 700,
            color: labelColor || lineInfo.color,
            background: `${labelColor || lineInfo.color}18`,
            padding: '3px 10px',
            borderRadius: 20,
            border: `1px solid ${labelColor || lineInfo.color}33`,
          }}>
            {labelEmoji} {label}
          </div>
        </div>
      )}

      <div style={{ padding: label ? '10px 20px 0' : '18px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: `linear-gradient(135deg, ${lineInfo.color}, ${lineInfo.color}cc)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${lineInfo.color}55`,
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
          <span style={{ fontSize: 26, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", fontWeight: 800, lineHeight: 1 }}>{lineKey}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
            {lineInfo.name} · 오늘의 데이트 장소 🌸
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 28, fontWeight: 800,
            color: lineInfo.color, letterSpacing: -1, lineHeight: 1.15,
          }}>
            {station}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}>역</span>
          </div>
        </div>
      </div>

      <div style={{
        margin: '12px 20px 12px', padding: '11px 14px',
        borderRadius: 14, background: `${lineInfo.color}0d`,
        border: `1px solid ${lineInfo.color}28`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>🔮</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4 }}>
            {fortune.text}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800,
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            color: lineInfo.color, lineHeight: 1.2, marginTop: 1,
          }}>
            {fortune.percent}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 20px 10px' }}>
        <a href={`https://map.kakao.com/link/search/${mapQuery}`} target="_blank" rel="noreferrer"
          onClick={playTap} style={linkBtn(lineInfo.color, true)}>
          📍 지도 보기
        </a>
        <a href={`https://search.naver.com/search.naver?query=${naverQuery}`} target="_blank" rel="noreferrer"
          onClick={playTap} style={linkBtn(lineInfo.color, false)}>
          🔍 데이트 검색
        </a>
      </div>

      <ImageGrid station={station} lineColor={lineInfo.color} />

      <div style={{ padding: '0 20px 18px' }}>
        <button
          onClick={() => { playButtonPop(); handleImageSave(station); }}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 12, border: 'none',
            background: 'var(--pink)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📸 이미지 저장
        </button>
      </div>
    </div>
  );
}

async function handleImageSave(station) {
  const el = document.querySelector('[data-capture="result"]');
  if (!el) { alert('캡처할 영역을 찾지 못했어요.'); return; }
  try {
    const canvas = await html2canvas(el, { backgroundColor: '#fff', scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `서울랜덤데이트_${station}역.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    alert('이미지 저장 중 오류가 발생했어요.');
  }
}

const linkBtn = (color, filled) => ({
  flex: 1, padding: '9px 0', borderRadius: 12,
  border: `1.5px solid ${color}55`,
  background: filled ? color : `${color}12`,
  color: filled ? '#fff' : color,
  fontSize: 12, fontWeight: 700,
  textAlign: 'center', textDecoration: 'none',
  display: 'block', transition: 'opacity 0.15s',
});
