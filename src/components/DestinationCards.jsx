import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getFortune } from '../data/fortuneTexts';
import { getCouplefortune, getCompatibilityScore } from '../data/coupleFortuneTexts';
import ImageGrid from './ImageGrid';
import { playTap, playButtonPop } from '../utils/sounds';

export default function DestinationCards({ destinations, nameA, nameB, destCount, stationCounts, onCheckin, nickname }) {
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
    // 카카오 링크는 등록된 도메인이어야 함 — 배포 URL 고정
    const url = 'https://seoul-random-date.vercel.app';

    if (window.Kakao?.isInitialized()) {
      const shareText = nameA && nameB
        ? `💑 ${nameA} & ${nameB}의 오늘 데이트 코스 🌸\n${stationText}\n\n우리도 서울 랜덤 데이트 해봐요!`
        : `🌸 오늘의 서울 랜덤 데이트\n${stationText}`;
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: shareText,
        link: { mobileWebUrl: url, webUrl: url },
        buttonTitle: '나도 뽑아보기 🎲',
      });
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => alert('링크가 복사됐어요! 카카오톡에 붙여넣기 하세요 💕'))
        .catch(() => alert(url));
    }
  }

  return (
    <div>
      {/* ── 1+2. 합쳐진 코스 카드 (2개 이상 완료 시) ─────── */}
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
          {/* 헤더 */}
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
            🗺 오늘의 데이트 코스
          </div>

          {/* 궁합 뱃지 */}
          {nameCouple && compat != null && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(232,87,138,0.10)',
                border: '1.5px solid rgba(232,87,138,0.25)',
                borderRadius: 50, padding: '6px 18px',
                fontSize: 14, fontWeight: 800,
                color: 'var(--pink)',
                fontFamily: "'마루 부리', 'MaruBuri', serif",
              }}>
                {compatEmoji} 오늘의 궁합 {compat}%
              </span>
            </div>
          )}

          {/* 역 가로 배치 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 4,
            marginBottom: 14,
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

          {/* 코스 설명 */}
          <div style={{
            padding: '10px 14px', borderRadius: 12, marginBottom: 10,
            background: 'rgba(232,87,138,0.05)',
            border: '1px solid rgba(232,87,138,0.15)',
            fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6,
          }}>
            🗺 <strong>{destinations[0].result.station}역</strong>에서 출발해서 <strong>{destinations[destinations.length - 1].result.station}역</strong>까지!<br/>
            {destinations.length === 2 ? '두 역 사이 골목골목이 오늘의 데이트 구역이에요 🌸' : '세 역 모두 정복해봐요 🔥'}
          </div>

          {/* 커플 운세 */}
          {coupleFor && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 14,
              background: 'rgba(232,87,138,0.05)',
              border: '1px solid rgba(232,87,138,0.15)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>🔮</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4 }}>{coupleFor.text}</div>
                <div style={{
                  fontFamily: "'마루 부리', 'MaruBuri', serif",
                  fontSize: 22, fontWeight: 800, color: 'var(--pink)', lineHeight: 1.2,
                }}>{coupleFor.percent}</div>
              </div>
            </div>
          )}

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
              onClick={() => { navigator.clipboard.writeText('https://seoul-random-date.vercel.app'); alert('링크 복사됐어요! 🔗'); }}
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
          nameA={nameA}
          nameB={nameB}
          delay={i * 80}
          stationCount={stationCounts ? (stationCounts[result.station] || 0) : 0}
          onCheckin={onCheckin}
          nickname={nickname}
        />
      ))}
    </div>
  );
}

function SingleDestCard({ label, labelEmoji, labelColor, result, nameA, nameB, delay, stationCount, onCheckin, nickname }) {
  const { lineKey, lineInfo, station } = result;
  const fortune = nameA && nameB
    ? getCouplefortune(nameA, nameB, station)
    : getFortune(station);
  const mapQuery   = encodeURIComponent(station + '역');
  const naverQuery = encodeURIComponent(station + '역 데이트');

  // 체크인 상태
  const [checkinOpen, setCheckinOpen]   = useState(false);
  const [reviewText, setReviewText]     = useState('');
  const [checkinDone, setCheckinDone]   = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // 스토리 저장용 ref
  const storyRef = useRef(null);

  async function handleCheckinSubmit() {
    if (!reviewText.trim()) return;
    setCheckinLoading(true);
    try {
      if (onCheckin) {
        await onCheckin(station, lineKey, lineInfo.color, reviewText.trim());
      }
      setCheckinDone(true);
      setCheckinOpen(false);
      setReviewText('');
    } catch (e) {
      console.warn('체크인 실패:', e);
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleStorySave() {
    playButtonPop();
    if (!storyRef.current) return;
    try {
      const canvas = await html2canvas(storyRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `서울랜덤데이트_스토리_${station}역.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('스토리 저장 중 오류가 발생했어요.');
    }
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 28, fontWeight: 800,
              color: lineInfo.color, letterSpacing: -1, lineHeight: 1.15,
            }}>
              {station}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}>역</span>
            </div>
            {/* 🔥 인기도 뱃지 */}
            {stationCount > 1 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                background: 'rgba(255,87,34,0.10)',
                border: '1px solid rgba(255,87,34,0.25)',
                borderRadius: 20, padding: '2px 8px',
                fontSize: 10, fontWeight: 700,
                color: '#e64a19',
              }}>
                🔥 오늘 {stationCount}명 뽑았어요
              </span>
            )}
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

      {/* 이미지 저장 + 스토리 저장 버튼 */}
      <div style={{ padding: '0 20px 10px', display: 'flex', gap: 8 }}>
        <button
          onClick={() => { playButtonPop(); handleImageSave(station); }}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
            background: 'var(--pink)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📸 이미지 저장
        </button>
        <button
          onClick={handleStorySave}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12,
            border: '1.5px solid rgba(168,85,247,0.40)',
            background: 'rgba(168,85,247,0.08)', color: '#a855f7',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📱 스토리 저장
        </button>
      </div>

      {/* ✅ 다녀왔어요 인증 */}
      <div style={{ padding: '0 20px 16px' }}>
        {checkinDone ? (
          <div style={{
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(76,175,80,0.08)',
            border: '1px solid rgba(76,175,80,0.25)',
            fontSize: 12, fontWeight: 700, color: '#388e3c',
            textAlign: 'center',
          }}>
            ✅ 인증 완료! 피드에 올라갔어요 🎉
          </div>
        ) : (
          <>
            <button
              onClick={() => { playButtonPop(); setCheckinOpen(prev => !prev); }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 12,
                border: '1.5px solid rgba(76,175,80,0.35)',
                background: checkinOpen ? 'rgba(76,175,80,0.10)' : 'transparent',
                color: '#388e3c', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ✅ 다녀왔어요 인증하기
            </button>

            {checkinOpen && (
              <div style={{ marginTop: 8 }}>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="한 줄 후기를 남겨주세요! (예: 카페 분위기 최고였어요 💕)"
                  maxLength={60}
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(76,175,80,0.35)',
                    fontSize: 12, fontWeight: 500,
                    color: 'var(--text)', background: 'rgba(76,175,80,0.04)',
                    outline: 'none', resize: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => { setCheckinOpen(false); setReviewText(''); }}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--muted)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCheckinSubmit}
                    disabled={!reviewText.trim() || checkinLoading}
                    style={{
                      flex: 2, padding: '8px 0', borderRadius: 10, border: 'none',
                      background: reviewText.trim() ? '#4caf50' : '#c8e6c9',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      cursor: reviewText.trim() ? 'pointer' : 'default',
                    }}
                  >
                    {checkinLoading ? '저장 중...' : '✅ 인증하기'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 스토리용 hidden div (화면 밖 렌더링) */}
      <div
        ref={storyRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: 540,
          height: 960,
          background: `linear-gradient(160deg, ${lineInfo.color}, ${lineInfo.color}bb, #1a0a10)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          boxSizing: 'border-box',
          zIndex: -1,
        }}
      >
        {/* 호선 뱃지 */}
        <div style={{
          width: 90, height: 90, borderRadius: 28,
          background: 'rgba(255,255,255,0.20)',
          border: '2px solid rgba(255,255,255,0.45)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
          <span style={{
            fontSize: 46, color: '#fff',
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontWeight: 800, lineHeight: 1,
          }}>{lineKey}</span>
        </div>

        {/* 역 이름 */}
        <div style={{
          fontFamily: "'마루 부리', 'MaruBuri', serif",
          fontSize: 88,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -3,
          lineHeight: 1.05,
          textShadow: '0 4px 24px rgba(0,0,0,0.20)',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {station}
        </div>
        <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.80)', fontWeight: 700, marginBottom: 48 }}>
          역
        </div>

        {/* 운세 텍스트 */}
        <div style={{
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 18,
          padding: '18px 28px',
          textAlign: 'center',
          marginBottom: 60,
          maxWidth: 420,
        }}>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 500, lineHeight: 1.6 }}>
            {fortune.text}
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 28, fontWeight: 800,
            color: '#fff', marginTop: 8,
          }}>
            {fortune.percent}
          </div>
        </div>

        {/* 브랜드 */}
        <div style={{
          position: 'absolute',
          bottom: 60,
          fontSize: 18,
          color: 'rgba(255,255,255,0.70)',
          fontWeight: 700,
          letterSpacing: 1,
        }}>
          서울 랜덤 데이트 💕
        </div>
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
