import html2canvas from 'html2canvas';
import { getFortune } from '../data/fortuneTexts';
import ImageGrid from './ImageGrid';
import { playTap, playButtonPop } from '../utils/sounds';

export default function ResultCard({ result, nickname }) {
  if (!result) return null;
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
      animation: 'slideUp 0.35s ease',
    }}>
      {/* 컬러 상단 바 */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${lineInfo.color}, ${lineInfo.color}88)` }} />

      <div style={{ padding: '18px 20px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 배지 */}
        <div style={{
          width: 56, height: 56,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${lineInfo.color}, ${lineInfo.color}cc)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${lineInfo.color}55`,
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
          <span style={{ fontSize: 26, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", fontWeight: 800, lineHeight: 1 }}>{lineKey}</span>
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
            {lineInfo.name} · 오늘의 데이트 장소 🌸
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 28,
            fontWeight: 800,
            color: lineInfo.color,
            letterSpacing: -1,
            lineHeight: 1.15,
          }}>
            {station}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}>역</span>
          </div>
        </div>
      </div>

      {/* 운세 텍스트 */}
      <div style={{
        margin: '0 20px 14px',
        padding: '11px 14px',
        borderRadius: 14,
        background: `${lineInfo.color}0d`,
        border: `1px solid ${lineInfo.color}28`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>🔮</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4 }}>
            {fortune.text}
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            color: lineInfo.color,
            lineHeight: 1.2,
            marginTop: 1,
          }}>
            {fortune.percent}
          </div>
        </div>
      </div>

      {/* 링크 버튼 */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 10px' }}>
        <a
          href={`https://map.kakao.com/link/search/${mapQuery}`}
          target="_blank" rel="noreferrer"
          onClick={playTap}
          style={linkBtn(lineInfo.color, true)}
        >
          📍 지도 보기
        </a>
        <a
          href={`https://search.naver.com/search.naver?query=${naverQuery}`}
          target="_blank" rel="noreferrer"
          onClick={playTap}
          style={linkBtn(lineInfo.color, false)}
        >
          🔍 데이트 검색
        </a>
      </div>

      {/* 이미지 그리드 */}
      <ImageGrid station={station} lineColor={lineInfo.color} />

      {/* 공유 버튼 */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
        <button
          onClick={() => { playButtonPop(); handleKakaoShare({ station, lineKey, lineInfo, fortune, nickname }); }}
          style={shareBtn('#FEE500', '#3C1E1E')}
        >
          💬 카카오 공유
        </button>
        <button
          onClick={() => { playButtonPop(); handleImageSave(station); }}
          style={shareBtn('var(--pink)', '#fff')}
        >
          📸 이미지 저장
        </button>
      </div>
    </div>
  );
}

// ─── 카카오톡 공유 ──────────────────────────────────────────────────
function handleKakaoShare({ station, lineKey, lineInfo, fortune, nickname }) {
  const text = `${nickname || '누군가'}님의 오늘 데이트 장소 🌸\n${lineInfo.name} ${station}역\n\n${fortune.text} ${fortune.percent}`;
  const url  = 'https://seoul-random-date.vercel.app';

  // Kakao SDK가 로드됐으면 SDK 공유, 없으면 URL 복사
  if (window.Kakao?.Share) {
    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text,
      link: { mobileWebUrl: url, webUrl: url },
      buttonTitle: '나도 뽑아보기 🎲',
    });
  } else {
    // fallback: 텍스트 클립보드 복사
    navigator.clipboard?.writeText(`${text}\n${url}`)
      .then(() => alert('링크가 복사됐어요! 카카오톡에 붙여넣기 하세요 💕'))
      .catch(() => alert(`${text}\n\n${url}`));
  }
}

// ─── 이미지 저장 (html2canvas 캡처) ───────────────────────────────
async function handleImageSave(station) {
  const el = document.querySelector('[data-capture="result"]');
  if (!el) { alert('캡처할 영역을 찾지 못했어요.'); return; }

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: '#fff',
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `서울랜덤데이트_${station}역.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    alert('이미지 저장 중 오류가 발생했어요.');
    console.error(e);
  }
}

// ─── 스타일 헬퍼 ────────────────────────────────────────────────────
const linkBtn = (color, filled) => ({
  flex: 1,
  padding: '9px 0',
  borderRadius: 12,
  border: `1.5px solid ${color}55`,
  background: filled ? color : `${color}12`,
  color: filled ? '#fff' : color,
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block',
  transition: 'opacity 0.15s',
});

const shareBtn = (bg, color) => ({
  flex: 1,
  padding: '9px 0',
  borderRadius: 12,
  border: 'none',
  background: bg,
  color,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.15s',
});
