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
  const coupleFor   = nameCouple && allDone && destinations.length >= 2
    ? getCouplefortune(nameA, nameB, destinations[0].result.station)
    : null;

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: '서울 랜덤 데이트', url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  function handleKakaoShare() {
    const stationText = destinations.map(d => d.result.station + '역').join(' → ');
    const firstResult = destinations[0]?.result;
    const url = window.location.href;

    if (window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `🌸 오늘의 서울 랜덤 데이트`,
          description: `${nameA && nameB ? `${nameA} & ${nameB}의 코스` : '오늘의 코스'}: ${stationText}`,
          imageUrl: `https://raw.githubusercontent.com/toss/toss-payments-frontend/main/apps/toss-design-system/public/og-image.png`,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          { title: '우리도 뽑으러 가기 💕', link: { mobileWebUrl: url, webUrl: url } },
        ],
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('카카오 SDK 로딩 중이에요. 링크를 복사했어요! 🔗');
    }
  }

  return (
    <div>
      {/* ── 1. 궁합 카드 ─────────────────────────── */}
      {nameCouple && allDone && compat != null && (
        <div style={{
          margin: '0 16px 12px',
          padding: '14px 18px',
          borderRadius: 18,
          background: '#fff',
          border: '1.5px solid rgba(232,87,138,0.20)',
          boxShadow: '0 4px 16px rgba(232,87,138,0.10)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'slideUp 0.35s ease',
        }}>
          <span style={{ fontSize: 30 }}>{compatEmoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
              {nameA} ❤️ {nameB} 오늘의 궁합
            </div>
            <div style={{
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 26, fontWeight: 800,
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
      )}

      {/* ── 2. 코스 카드 (2개 이상 완료 시) ─────── */}
      {allDone && destinations.length >= 2 && (
        <div style={{
          margin: '0 16px 12px',
          padding: '20px 18px',
          borderRadius: 20,
          background: '#fff',
          border: '1.5px solid rgba(232,87,138,0.18)',
          boxShadow: '0 4px 20px rgba(232,87,138,0.09)',
          animation: 'slideUp 0.4s ease',
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
            🗺 오늘의 데이트 코스
          </div>

          {/* 역 가로 배치 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 4,
            marginBottom: 16,
          }}>
            {destinations.map((d, i) => {
              const { lineKey, lineInfo, station } = d.result;
              const personName = i === 0 ? nameA : i === 1 ? nameB : null;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
                      {personName ? `${personName}의 역` : `${i + 1}번째 역`}
                    </div>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: `linear-gradient(135deg, ${lineInfo.color}, ${lineInfo.color}cc)`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 14px ${lineInfo.color}55`,
                    }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
                      <span style={{
                        fontSize: 24, color: '#fff',
                        fontFamily: "'마루 부리', 'MaruBuri', serif",
                        fontWeight: 800, lineHeight: 1,
                      }}>{lineKey}</span>
                    </div>
                    <div style={{
                      fontFamily: "'마루 부리', 'MaruBuri', serif",
                      fontSize: 24, fontWeight: 800,
                      color: lineInfo.color, letterSpacing: -0.5, lineHeight: 1.1,
                    }}>
                      {station}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>역</span>
                    </div>
                  </div>

                  {i < destinations.length - 1 && (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0 8px',
                      paddingBottom: 14,
                      gap: 2,
                    }}>
                      <span style={{ fontSize: 18, color: 'var(--muted)' }}>→</span>
                      <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>오늘의<br/>코스</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 14 }}>
            {destinations.length === 2 ? '두 역에서 신나게 놀아봐요! 🌸' : '세 역 모두 정복해봐요! 🔥'}
          </div>

          {/* 공유 버튼 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleKakaoShare}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                background: '#FEE500', color: '#3C1E1E',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              💬 카카오로 공유
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert('링크 복사됐어요! 🔗'); }}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                border: '1.5px solid rgba(232,87,138,0.25)',
                background: 'rgba(232,87,138,0.05)', color: 'var(--pink)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🔗 링크 복사
            </button>
          </div>
        </div>
      )}

      {/* ── 3. 개별 역 카드들 ────────────────────── */}
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
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700,
            color: labelColor || lineInfo.color,
            background: `${labelColor || lineInfo.color}18`,
            padding: '3px 10px', borderRadius: 20,
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
