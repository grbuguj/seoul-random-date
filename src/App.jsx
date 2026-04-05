import './styles/global.css';
import { useState, useEffect, useRef } from 'react';
import LineSelector      from './components/LineSelector';
import SubwayMap         from './components/SubwayMap';
import DestinationCards  from './components/DestinationCards';
import DualPressButton   from './components/DualPressButton';
import HistoryChips      from './components/HistoryChips';
import LiveFeed          from './components/LiveFeed';
import RankingCard       from './components/RankingCard';
import { useSpinAnimation } from './hooks/useSpinAnimation';
import { useFeed, useRankings, useStationCounts } from './hooks/useFeed';
import { getOrCreateNickname } from './utils/nickname';
import { playButtonPop, playCoupleReveal } from './utils/sounds';
import { getCompatibilityScore } from './data/coupleFortuneTexts';

// 주작 모드: 순서대로 결과 고정 (비워두면 랜덤)
const CHEAT_RESULTS = [
  { lineKey: '5', stationName: '오목교' },
  { lineKey: '2', stationName: '문래' },
];

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

function getSpinStages(destCount) {
  if (destCount === 1) return ['dual'];
  if (destCount === 2) return ['A', 'B'];
  return ['A', 'B', 'dual'];
}

const destDesc = {
  1: '두 사람이 동시에 버튼을 눌러 함께 뽑아요!',
  2: '각자 한 역씩 뽑아서 오늘 갈 두 곳을 정해요!',
  3: '각자 한 역씩 + 동시 누르기로 세 번째 역까지 뽑아요!',
};

export default function App() {
  const [selectedLine, setSelectedLine] = useState('rand');
  const [history, setHistory]           = useState([]);

  // 이름
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [namesSet, setNamesSet] = useState(false);
  const [nameToast, setNameToast] = useState(false);

  // 목적지 수
  const [destCount, setDestCount] = useState(1);
  const [spinDuration, setSpinDuration] = useState(10);
  const [showSlider, setShowSlider] = useState(false);

  // 스핀 진행
  const [stageIdx, setStageIdx]         = useState(0);
  const [destinations, setDestinations] = useState([]);
  const [showReveal, setShowReveal]     = useState(false);

  // 지도/오버레이
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showOverlay, setShowOverlay]         = useState(false);
  const overlayTimer = useRef(null);

  // 닉네임
  const [nickname, setNickname]       = useState(() => getOrCreateNickname());
  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput]     = useState('');

  const { spinning, highlighted, result, spin, reset } = useSpinAnimation();
  const { feed, pushSpin, pushRanking, pushCheckin } = useFeed();
  const { rankings }      = useRankings();
  const { stationCounts } = useStationCounts();

  const compat = nameA && nameB ? getCompatibilityScore(nameA, nameB) : null;
  const stages = getSpinStages(destCount);
  const currentStage = stages[stageIdx] ?? null;
  const allDone = destinations.length === destCount;
  const bothNamesEntered = nameA.trim().length > 0 && nameB.trim().length > 0;

  // 결과 처리
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

  // 완료 → reveal
  const rankingPushedRef = useRef(false);
  useEffect(() => {
    if (destinations.length === destCount && destCount > 0) {
      const t = setTimeout(() => {
        setShowReveal(true);
        if (destCount >= 2) playCoupleReveal();
      }, 600);
      if (nameA && nameB && compat != null && destinations[0] && !rankingPushedRef.current) {
        rankingPushedRef.current = true;
        pushRanking(nameA, nameB, compat, destinations[0].result.station);
      }
      return () => clearTimeout(t);
    }
  }, [destinations.length, destCount]);

  // 오버레이 자동 닫힘
  useEffect(() => {
    if (result) {
      setShowOverlay(true);
      clearTimeout(overlayTimer.current);
      overlayTimer.current = setTimeout(() => setShowOverlay(false), 3000);
    }
  }, [result]);

  useEffect(() => {
    if (result && isMapFullscreen) {
      const t = setTimeout(() => setIsMapFullscreen(false), 3000);
      return () => clearTimeout(t);
    }
  }, [result]);

  // 핸들러
  function triggerSpin() {
    setIsMapFullscreen(true);
    const cheat = CHEAT_RESULTS[stageIdx] ?? null;
    spin(selectedLine, spinDuration * 1000, cheat);
  }

  // 완전 리셋 (다시 뽑기 버튼용) — namesSet도 초기화
  function handleReset() {
    playButtonPop();
    setDestinations([]);
    setStageIdx(0);
    setShowReveal(false);
    setNamesSet(false);
    rankingPushedRef.current = false;
    reset();
  }

  // 개수 변경용 — 뽑기 진행 상태만 리셋, 이름/namesSet/피드는 유지
  function resetSpinOnly() {
    setDestinations([]);
    setStageIdx(0);
    setShowReveal(false);
    rankingPushedRef.current = false;
    reset();
  }

  function handleNamesSubmit() {
    if (!nameA.trim() || !nameB.trim()) {
      setNameToast(true);
      setTimeout(() => setNameToast(false), 2200);
      return;
    }
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

  function stageGuideText() {
    if (currentStage === 'A') return <><strong style={{ color: '#a855f7' }}>{nameA}</strong>의 역 뽑는 중</>;
    if (currentStage === 'B') return <><strong style={{ color: '#64b5f6' }}>{nameB}</strong>의 역 뽑는 중</>;
    if (currentStage === 'dual') return <strong style={{ color: 'var(--pink)' }}>마지막 역 — 동시 누르기! 💕</strong>;
    return null;
  }

  function overlayWhoLabel() {
    const prevStage = stages[stageIdx - 1];
    if (prevStage === 'A') return `${nameA}의 역 🎉`;
    if (prevStage === 'B') return `${nameB}의 역 🎉`;
    if (prevStage === 'dual') return '세 번째 역 🎉';
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', maxWidth: 520, margin: '0 auto' }}>

      {/* 풀스크린 역 결과 오버레이 */}
      {showOverlay && result && (
        <div
          onClick={() => { clearTimeout(overlayTimer.current); setShowOverlay(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: `linear-gradient(160deg, ${result.lineInfo.color}f0, ${result.lineInfo.color}bb)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'stationReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
          }}
        >
          {overlayWhoLabel() && (
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.85)', marginBottom: 28, textTransform: 'uppercase' }}>
              {overlayWhoLabel()}
            </div>
          )}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.22)',
            border: '2px solid rgba(255,255,255,0.45)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>호선</span>
            <span style={{ fontSize: 42, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", fontWeight: 800, lineHeight: 1 }}>
              {result.lineKey}
            </span>
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 'clamp(60px, 18vw, 90px)',
            fontWeight: 800, color: '#fff',
            letterSpacing: -3, lineHeight: 1.05,
            textShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}>
            {result.station}
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: 48 }}>역</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>탭하면 닫혀요</div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ textAlign: 'center', padding: '32px 20px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: 'var(--pink-mid)', marginBottom: 8, textTransform: 'uppercase' }}>
          🌸 Seoul Random Date
        </div>
        <h1 style={{
          fontFamily: "'마루 부리', 'MaruBuri', serif",
          fontSize: 'clamp(26px, 6vw, 38px)',
          fontWeight: 800, color: 'var(--text)',
          letterSpacing: -1, lineHeight: 1.15, margin: 0,
        }}>
          서울 랜덤 데이트
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
          호선을 고르고 뽑기 — 오늘의 데이트 장소를 결정해봐요 💕
        </p>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--pink-mid)', fontWeight: 600 }}>
          우리의 이름:{' '}
          {editingNick ? (
            <input
              autoFocus
              value={nickInput}
              onChange={e => setNickInput(e.target.value)}
              onBlur={() => {
                const t = nickInput.trim();
                if (t) { setNickname(t); try { localStorage.setItem('seoul-date-nickname', t); } catch {} }
                setEditingNick(false);
              }}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingNick(false); }}
              maxLength={10}
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--pink)', border: 'none', borderBottom: '1.5px solid var(--pink)', background: 'transparent', outline: 'none', width: 90, padding: '0 2px' }}
            />
          ) : (
            <span
              onClick={() => { setNickInput(nickname); setEditingNick(true); }}
              style={{ cursor: 'pointer', color: 'var(--pink)', border: '1px solid rgba(232,87,138,0.4)', borderRadius: 6, padding: '1px 7px', background: 'rgba(232,87,138,0.06)' }}
            >
              {nickname}
            </span>
          )}
          {' '}🐾
        </div>
      </div>

      {/* ── 이름 입력 패널 (단계별 공개) ──────────────────────────── */}
      <div style={{
        margin: '0 16px 14px', background: '#fff', borderRadius: 20,
        padding: '16px 18px',
        border: '1.5px solid rgba(232,87,138,0.20)',
        boxShadow: '0 4px 20px rgba(232,87,138,0.08)',
      }}>
        {/* Step 1: 이름 입력 */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', marginBottom: 12, textAlign: 'center' }}>
          💑 두 사람 이름을 입력해주세요
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: bothNamesEntered ? 16 : 0 }}>
          {[
            { val: nameA, set: setNameA, emoji: '💗', placeholder: '첫 번째 이름' },
            { val: nameB, set: setNameB, emoji: '💙', placeholder: '두 번째 이름' },
          ].map(({ val, set, emoji, placeholder }, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{emoji}</div>
              <input
                value={val}
                onChange={e => { set(e.target.value); if (namesSet) setNamesSet(false); }}
                placeholder={placeholder}
                maxLength={6}
                disabled={namesSet && destinations.length > 0}
                style={nameInputStyle}
              />
            </div>
          ))}
        </div>

        {/* Step 2: 역 개수 선택 — 두 이름 다 입력됐을 때 공개 */}
        {bothNamesEntered && (
          <div style={{ animation: 'slideUp 0.25s ease' }}>
            <div style={{ width: '100%', height: 1, background: 'rgba(232,87,138,0.10)', marginBottom: 14 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>
              역 몇 개 뽑을까요?
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              {[
                { n: 1, icon: '🎯', label: '1개' },
                { n: 2, icon: '✌️', label: '2개' },
                { n: 3, icon: '🗺', label: '3개' },
              ].map(({ n, icon, label }) => (
                <button
                  key={n}
                  onClick={() => {
                    setDestCount(n);
                    // 개수만 바꿀 때는 뽑기 상태만 리셋 — 이름/namesSet/피드 건드리지 않음
                    if (destinations.length > 0) resetSpinOnly();
                    playButtonPop();
                  }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 14,
                    border: `1.5px solid ${destCount === n ? 'var(--pink)' : 'var(--border)'}`,
                    background: destCount === n ? 'var(--pink)' : 'transparent',
                    color: destCount === n ? '#fff' : 'var(--muted)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'마루 부리', 'MaruBuri', serif",
                    transition: 'all 0.15s',
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
              {destDesc[destCount]}
            </div>

            {/* Step 3: 시작하기 */}
            {(!namesSet || destinations.length === 0) && (
              <div style={{ animation: 'slideUp 0.2s ease' }}>
                <button
                  onClick={namesSet ? handleReset : handleNamesSubmit}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #a855f7, #e8578a)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    fontFamily: "'마루 부리', 'MaruBuri', serif",
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {namesSet ? '🔄 다시 시작하기' : '시작하기 🎲'}
                </button>
                {nameToast && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px', borderRadius: 12,
                    background: '#fff0f5', border: '1.5px solid rgba(232,87,138,0.35)',
                    color: 'var(--pink)', fontSize: 12, fontWeight: 700,
                    textAlign: 'center', animation: 'slideUp 0.2s ease',
                  }}>
                    💕 두 사람 이름을 모두 입력해주세요!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 진행 상태 인디케이터 */}
      {namesSet && !allDone && (
        <div style={{
          margin: '0 16px 12px', padding: '10px 16px', borderRadius: 14,
          background: '#fff', border: '1.5px solid rgba(232,87,138,0.18)',
          display: 'flex', alignItems: 'center', gap: 10,
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{stageGuideText()}</div>
          {stageIdx > 0 && (
            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>{stageIdx}/{stages.length} 완료</div>
          )}
        </div>
      )}

      {/* 호선 선택 + 룰렛 시간 */}
      <div style={{
        margin: '0 16px 14px', background: 'var(--surface)',
        borderRadius: 20, padding: '14px 12px',
        boxShadow: '0 2px 16px rgba(232,87,138,0.08)',
        border: '1px solid var(--border)',
      }}>
        <LineSelector selected={selectedLine} onChange={setSelectedLine} />
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowSlider(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 0',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              ⏱ 룰렛 시간 <span style={{ color: 'var(--pink)', marginLeft: 4 }}>{spinDuration}초</span>
            </span>
            <span style={{
              fontSize: 10, color: 'var(--muted)',
              transform: showSlider ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s', display: 'inline-block',
            }}>▼</span>
          </button>
          {showSlider && (
            <div style={{ padding: '10px 4px 2px', animation: 'slideUp 0.2s ease' }}>
              <input
                type="range" min={3} max={30} step={1}
                value={spinDuration}
                onChange={e => setSpinDuration(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--pink)', cursor: 'pointer', height: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
                <span>3초</span><span>30초</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 지도 */}
      <div style={{
        margin: isMapFullscreen ? 0 : '0 16px 14px',
        borderRadius: isMapFullscreen ? 0 : 20,
        overflow: 'hidden',
        border: isMapFullscreen ? 'none' : '1px solid var(--border)',
        boxShadow: isMapFullscreen ? 'none' : '0 4px 24px rgba(232,87,138,0.10)',
        background: '#fff',
        ...(isMapFullscreen ? {
          position: 'fixed', inset: 0, zIndex: 200, margin: 0, borderRadius: 0,
          display: 'flex', flexDirection: 'column',
        } : { aspectRatio: '4/3' }),
        position: 'relative',
      }}>
        {isMapFullscreen && (
          <button onClick={() => { playButtonPop(); setIsMapFullscreen(false); }} style={mapCloseBtnStyle}>✕</button>
        )}
        {!isMapFullscreen && (
          <button onClick={() => { playButtonPop(); setIsMapFullscreen(true); }} style={mapExpandBtnStyle}>⛶</button>
        )}
        <SubwayMap selectedLine={selectedLine} highlighted={highlighted} onStationClick={() => {}} />
      </div>

      {/* 뽑기 버튼 */}
      <div style={{ padding: '0 16px 12px' }}>
        {allDone && (
          <button onClick={handleReset} style={{
            width: '100%', height: 58, borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #f06292, #e8578a, #c2185b)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            boxShadow: '0 6px 20px rgba(232,87,138,0.38)', cursor: 'pointer',
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
          <button onClick={triggerSpin} disabled={spinning} style={{
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
          }}>
            {spinButtonLabel()}
          </button>
        )}
        {!allDone && namesSet && isDual && !spinning && (
          <DualPressButton
            labelA={nameA || '첫 번째'} labelB={nameB || '두 번째'}
            colorA="#a855f7" colorB="#64b5f6"
            onBothPressed={triggerSpin} disabled={spinning}
          />
        )}
        {spinning && isDual && (
          <button disabled style={{
            width: '100%', height: 58, borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #f5b8cc, #e8a0b8)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            fontFamily: "'마루 부리', 'MaruBuri', serif", cursor: 'not-allowed',
          }}>
            🌸 뽑는 중...
          </button>
        )}
      </div>

      {/* 결과 */}
      {(showReveal || (destCount === 1 && destinations.length > 0)) && <RankingCard rankings={rankings} />}
      {(showReveal || (destCount === 1 && destinations.length > 0)) && (
        <DestinationCards
          destinations={destinations} nameA={nameA} nameB={nameB}
          destCount={destCount} stationCounts={stationCounts} nickname={nickname}
          onCheckin={(station, lineKey, lineColor, review) =>
            pushCheckin(nickname, station, lineKey, lineColor, review)
          }
        />
      )}

      <HistoryChips history={history} />
      <LiveFeed feed={feed} />
    </div>
  );
}

const nameInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 12,
  border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 700,
  fontFamily: "'마루 부리', 'MaruBuri', serif",
  color: 'var(--text)', background: 'var(--pink-soft)',
  outline: 'none', boxSizing: 'border-box',
};

const mapCloseBtnStyle = {
  position: 'absolute', top: 16, right: 16, zIndex: 210,
  width: 36, height: 36, borderRadius: '50%',
  border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.95)',
  fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const mapExpandBtnStyle = {
  position: 'absolute', top: 10, right: 10, zIndex: 10,
  width: 30, height: 30, borderRadius: '50%',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.9)',
  fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};
