import './styles/global.css';
import { useState, useEffect, useRef } from 'react';
import LineSelector      from './components/LineSelector';
import SubwayMap         from './components/SubwayMap';
import DestinationCards  from './components/DestinationCards';
import DualPressButton   from './components/DualPressButton';
import HistoryChips      from './components/HistoryChips';
import LiveFeed          from './components/LiveFeed';
import { useSpinAnimation } from './hooks/useSpinAnimation';
import { useFeed }       from './hooks/useFeed';
import { getOrCreateNickname } from './utils/nickname';
import { playButtonPop, playCoupleToggle, playCoupleReveal } from './utils/sounds';

// ─── 목적지 수별 라벨 설정 ────────────────────────────────────────
const DEST_CONFIG = {
  1: [{ label: null, labelEmoji: null, labelColor: null }],
  2: [
    { label: '첫 번째 역', labelEmoji: '💗', labelColor: '#a855f7' },
    { label: '두 번째 역', labelEmoji: '💙', labelColor: '#64b5f6' },
  ],
  3: [
    { label: '첫 번째 역', labelEmoji: '🟣', labelColor: '#a855f7' },
    { label: '두 번째 역', labelEmoji: '💗', labelColor: '#e8578a' },
    { label: '세 번째 역', labelEmoji: '🔵', labelColor: '#64b5f6' },
  ],
};

// destCount별 스핀 순서
// 1개: 동시 누르기 한 번
// 2개: A 단독 → B 단독
// 3개: A 단독 → B 단독 → 동시 누르기

function getSpinStages(destCount) {
  if (destCount === 1) return ['dual'];
  if (destCount === 2) return ['A', 'B'];
  return ['A', 'B', 'dual'];
}

export default function App() {
  const [selectedLine, setSelectedLine] = useState('rand');
  const [history, setHistory]           = useState([]);

  // ── 이름 ──────────────────────────────────────────────────────
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [namesSet, setNamesSet] = useState(false);

  // ── 목적지 수 ──────────────────────────────────────────────────
  const [destCount, setDestCount] = useState(1);

  // ── 스핀 진행 ─────────────────────────────────────────────────
  const [stageIdx, setStageIdx]       = useState(0);
  const [destinations, setDestinations] = useState([]);
  const [showReveal, setShowReveal]   = useState(false);

  // ── 지도/오버레이 ─────────────────────────────────────────────
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showOverlay, setShowOverlay]         = useState(false);
  const overlayTimer = useRef(null);

  const [nickname] = useState(() => getOrCreateNickname());

  const { spinning, highlighted, result, spin, reset } = useSpinAnimation();
  const { feed, pushSpin } = useFeed();

  const stages = getSpinStages(destCount);
  const currentStage = stages[stageIdx] ?? null;
  const allDone = destinations.length === destCount;

  // ── 결과 처리 ─────────────────────────────────────────────────
  const lastResultRef = useRef(null);
  if (result && result !== lastResultRef.current) {
    lastResultRef.current = result;
    setHistory(prev => [result, ...prev].slice(0, 8));
    pushSpin(nickname, result.station, result.lineKey, result.lineInfo.color);

    const cfgList = DEST_CONFIG[destCount];
    const cfg = cfgList[stageIdx] ?? cfgList[cfgList.length - 1];
    setDestinations(prev => [...prev, { ...cfg, result }]);
    setStageIdx(prev => prev + 1);
  }

  // 모든 목적지 완료 → reveal
  useEffect(() => {
    if (destinations.length === destCount && destCount > 0) {
      const t = setTimeout(() => {
        setShowReveal(true);
        if (destCount >= 2) playCoupleReveal();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [destinations.length, destCount]);

  // 오버레이
  useEffect(() => {
    if (result) {
      setShowOverlay(true);
      clearTimeout(overlayTimer.current);
    }
  }, [result]);

  useEffect(() => {
    if (result && isMapFullscreen) {
      const t = setTimeout(() => setIsMapFullscreen(false), 3000);
      return () => clearTimeout(t);
    }
  }, [result]);

  // ── 핸들러 ────────────────────────────────────────────────────
  function triggerSpin() {
    setIsMapFullscreen(true);
    spin(selectedLine);
  }

  function handleReset() {
    playButtonPop();
    setDestinations([]);
    setStageIdx(0);
    setShowReveal(false);
    reset();
  }

  function handleNamesSubmit() {
    if (!nameA.trim() || !nameB.trim()) return;
    playButtonPop();
    setNamesSet(true);
  }

  function currentSpinner() {
    if (currentStage === 'A') return nameA || '첫 번째';
    if (currentStage === 'B') return nameB || '두 번째';
    return null;
  }

  const isDual   = currentStage === 'dual';
  const isSingle = currentStage === 'A' || currentStage === 'B';

  function spinButtonLabel() {
    if (spinning) return '🌸 뽑는 중...';
    if (allDone)  return '🔄 다시 뽑기';
    if (isDual)   return '두 사람 동시 누르기 💕';
    if (isSingle) return `🎲 ${currentSpinner()}의 역 뽑기!`;
    return '🎲 지금 뽑기!';
  }

  // ── 목적지 수별 설명 텍스트 ───────────────────────────────────
  const destDesc = {
    1: '두 사람이 동시에 버튼을 눌러 함께 뽑아요!',
    2: '각자 한 역씩 뽑아서 오늘 갈 두 곳을 정해요!',
    3: '각자 한 역씩 + 동시 누르기로 세 번째 역까지 뽑아요!',
  };

  // ── 진행 중 안내 텍스트 ───────────────────────────────────────
  function stageGuideText() {
    if (currentStage === 'A') return <><strong style={{ color: '#a855f7' }}>{nameA}</strong>의 역 뽑는 중</>;
    if (currentStage === 'B') return <><strong style={{ color: '#64b5f6' }}>{nameB}</strong>의 역 뽑는 중</>;
    if (currentStage === 'dual') return <strong style={{ color: 'var(--pink)' }}>마지막 역 — 동시 누르기! 💕</strong>;
    return null;
  }

  // ── 오버레이 누구 역인지 라벨 ─────────────────────────────────
  function overlayWhoLabel() {
    const prevStage = stages[stageIdx - 1];
    if (prevStage === 'A') return `${nameA}의 역 🎉`;
    if (prevStage === 'B') return `${nameB}의 역 🎉`;
    if (prevStage === 'dual') return '세 번째 역 🎉';
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: 520, margin: '0 auto' }}>

      {/* 헤더 */}
      <div style={{ textAlign: 'center', padding: '32px 20px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: 'var(--pink-mid)', marginBottom: 8, textTransform: 'uppercase' }}>
          🌸 Seoul Random Date
        </div>
        <h1 style={{
          fontFamily: "'마루 부리', 'MaruBuri', serif",
          fontSize: 'clamp(26px, 6vw, 38px)',
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: -1,
          lineHeight: 1.15,
          margin: 0,
        }}>
          서울 랜덤 데이트
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
          호선을 고르고 뽑기 — 오늘의 데이트 장소를 결정해봐요 💕
        </p>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--pink-mid)', fontWeight: 600 }}>
          우리의 이름: {nickname} 🐾
        </div>
      </div>

      {/* ── 이름 입력 + 목적지 수 ─────────────────────────────────── */}
      <div style={{
        margin: '0 16px 14px',
        background: '#fff',
        borderRadius: 20,
        padding: '16px 18px',
        border: '1.5px solid rgba(232,87,138,0.20)',
        boxShadow: '0 4px 20px rgba(232,87,138,0.08)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', marginBottom: 12, textAlign: 'center' }}>
          💑 두 사람 이름을 입력해주세요
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { val: nameA, set: setNameA, emoji: '💗', placeholder: '첫 번째 이름' },
            { val: nameB, set: setNameB, emoji: '💙', placeholder: '두 번째 이름' },
          ].map(({ val, set, emoji, placeholder }, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{emoji}</div>
              <input
                value={val}
                onChange={e => { set(e.target.value); setNamesSet(false); }}
                placeholder={placeholder}
                maxLength={6}
                disabled={namesSet && destinations.length > 0}
                style={nameInputStyle}
              />
            </div>
          ))}
        </div>

        {/* 목적지 수 선택 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>
            역 몇 개 뽑을까요?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { n: 1, icon: '🎯', label: '1개' },
              { n: 2, icon: '✌️', label: '2개' },
              { n: 3, icon: '🗺', label: '3개' },
            ].map(({ n, icon, label }) => (
              <button
                key={n}
                onClick={() => { setDestCount(n); handleReset(); playButtonPop(); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 14,
                  border: `1.5px solid ${destCount === n ? 'var(--pink)' : 'var(--border)'}`,
                  background: destCount === n ? 'var(--pink)' : 'transparent',
                  color: destCount === n ? '#fff' : 'var(--muted)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'마루 부리', 'MaruBuri', serif",
                  transition: 'all 0.15s',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
            {destDesc[destCount]}
          </div>
        </div>

        {/* 시작 버튼 */}
        {(!namesSet || destinations.length === 0) && (
          <button
            onClick={namesSet ? handleReset : handleNamesSubmit}
            disabled={!nameA.trim() || !nameB.trim()}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 14, border: 'none',
              background: nameA.trim() && nameB.trim()
                ? 'linear-gradient(135deg, #a855f7, #e8578a)'
                : '#f0dde5',
              color: nameA.trim() && nameB.trim() ? '#fff' : 'var(--muted)',
              fontSize: 13, fontWeight: 700,
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              cursor: nameA.trim() && nameB.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            {namesSet ? '🔄 다시 시작하기' : '시작하기 🎲'}
          </button>
        )}
      </div>

      {/* ── 진행 상태 인디케이터 ─────────────────────────────────── */}
      {namesSet && !allDone && (
        <div style={{
          margin: '0 16px 12px',
          padding: '10px 16px',
          borderRadius: 14,
          background: '#fff',
          border: '1.5px solid rgba(232,87,138,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {stages.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < stageIdx ? 'var(--pink)' : i === stageIdx ? '#f5b8cc' : '#f0dde5',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            {stageGuideText()}
          </div>
          {stageIdx > 0 && (
            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>
              {stageIdx}/{stages.length} 완료
            </div>
          )}
        </div>
      )}

      {/* ── 호선 선택 ────────────────────────────────────────────── */}
      <div style={{
        margin: '0 16px 14px',
        background: 'var(--surface)',
        borderRadius: 20,
        padding: '14px 12px',
        boxShadow: '0 2px 16px rgba(232,87,138,0.08)',
        border: '1px solid var(--border)',
      }}>
        <LineSelector selected={selectedLine} onChange={setSelectedLine} />
      </div>

      {/* ── 지도 ─────────────────────────────────────────────────── */}
      <div style={{
        margin: isMapFullscreen ? 0 : '0 16px 14px',
        borderRadius: isMapFullscreen ? 0 : 20,
        overflow: 'hidden',
        border: isMapFullscreen ? 'none' : '1px solid var(--border)',
        boxShadow: isMapFullscreen ? 'none' : '0 4px 24px rgba(232,87,138,0.10)',
        background: '#fff',
        ...(isMapFullscreen ? {
          position: 'fixed', inset: 0,
          zIndex: 200, margin: 0, borderRadius: 0,
          display: 'flex', flexDirection: 'column',
        } : { aspectRatio: '4/3' }),
        position: 'relative',
      }}>
        {isMapFullscreen && (
          <button onClick={() => { playButtonPop(); setIsMapFullscreen(false); }}
            style={mapCloseBtnStyle}>✕</button>
        )}
        {!isMapFullscreen && (
          <button onClick={() => { playButtonPop(); setIsMapFullscreen(true); }}
            style={mapExpandBtnStyle}>⛶</button>
        )}

        <SubwayMap selectedLine={selectedLine} highlighted={highlighted} onStationClick={() => {}} />

        {/* 결과 오버레이 */}
        {showOverlay && result && (
          <div onAnimationEnd={() => setShowOverlay(false)} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.96)',
            borderRadius: 24, padding: '20px 32px',
            textAlign: 'center',
            boxShadow: `0 8px 40px ${result.lineInfo.color}44, 0 2px 16px rgba(0,0,0,0.12)`,
            border: `2px solid ${result.lineInfo.color}66`,
            animation: 'resultPop 1.9s ease forwards',
            pointerEvents: 'none', zIndex: 220, minWidth: 160,
          }}>
            {overlayWhoLabel() && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pink-mid)', marginBottom: 6 }}>
                {overlayWhoLabel()}
              </div>
            )}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: result.lineInfo.color,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: `0 4px 12px ${result.lineInfo.color}66`,
            }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
              <span style={{ fontSize: 22, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", lineHeight: 1 }}>{result.lineKey}</span>
            </div>
            <div style={{
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 30, fontWeight: 800,
              color: result.lineInfo.color, letterSpacing: -1, lineHeight: 1.2,
            }}>
              {result.station}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>역</div>
          </div>
        )}
      </div>

      {/* ── 뽑기 버튼 영역 ───────────────────────────────────────── */}
      <div style={{ padding: '0 16px 12px' }}>
        {allDone && (
          <button onClick={handleReset} style={{
            width: '100%', height: 58, borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #f06292, #e8578a, #c2185b)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            boxShadow: '0 6px 20px rgba(232,87,138,0.38)',
            cursor: 'pointer',
          }}>
            🔄 다시 뽑기
          </button>
        )}

        {!allDone && !namesSet && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '14px 0' }}>
            위에서 이름을 입력하고 시작하세요 💕
          </div>
        )}

        {!allDone && namesSet && isSingle && (
          <button
            onClick={triggerSpin}
            disabled={spinning}
            style={{
              width: '100%', height: 58, borderRadius: 16, border: 'none',
              cursor: spinning ? 'not-allowed' : 'pointer',
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 17, fontWeight: 700, color: '#fff',
              background: spinning
                ? 'linear-gradient(135deg, #f5b8cc, #e8a0b8)'
                : currentStage === 'A'
                  ? 'linear-gradient(135deg, #a855f7, #c084fc)'
                  : 'linear-gradient(135deg, #64b5f6, #42a5f5)',
              boxShadow: spinning ? 'none' : '0 6px 20px rgba(232,87,138,0.30)',
              transition: 'all 0.2s',
              transform: spinning ? 'scale(0.98)' : 'scale(1)',
            }}
          >
            {spinButtonLabel()}
          </button>
        )}

        {!allDone && namesSet && isDual && !spinning && (
          <DualPressButton
            labelA={nameA || '첫 번째'}
            labelB={nameB || '두 번째'}
            colorA="#a855f7"
            colorB="#64b5f6"
            onBothPressed={triggerSpin}
            disabled={spinning}
          />
        )}

        {spinning && isDual && (
          <button disabled style={{
            width: '100%', height: 58, borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #f5b8cc, #e8a0b8)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            cursor: 'not-allowed',
          }}>
            🌸 뽑는 중...
          </button>
        )}
      </div>

      {/* ── 결과 카드들 ──────────────────────────────────────────── */}
      {destinations.length > 0 && (
        <DestinationCards
          destinations={destinations}
          nameA={nameA}
          nameB={nameB}
          destCount={destCount}
        />
      )}

      <HistoryChips history={history} />
      <LiveFeed feed={feed} />
    </div>
  );
}

const nameInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 12,
  border: '1.5px solid var(--border)',
  fontSize: 14, fontWeight: 700,
  fontFamily: "'마루 부리', 'MaruBuri', serif",
  color: 'var(--text)', background: 'var(--pink-soft)',
  outline: 'none', boxSizing: 'border-box',
};

const mapCloseBtnStyle = {
  position: 'absolute', top: 16, right: 16, zIndex: 210,
  width: 36, height: 36, borderRadius: '50%',
  border: '1.5px solid var(--border)',
  background: 'rgba(255,255,255,0.95)',
  fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const mapExpandBtnStyle = {
  position: 'absolute', top: 10, right: 10, zIndex: 10,
  width: 30, height: 30, borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.9)',
  fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};
