import './styles/global.css';
import { useState, useEffect, useRef } from 'react';
import LineSelector from './components/LineSelector';
import SubwayMap    from './components/SubwayMap';
import ResultCard   from './components/ResultCard';
import HistoryChips from './components/HistoryChips';
import { useSpinAnimation } from './hooks/useSpinAnimation';

export default function App() {
  const [selectedLine, setSelectedLine] = useState('rand');
  const [history, setHistory]           = useState([]);
  const [showOverlay, setShowOverlay]   = useState(false);
  const overlayTimer = useRef(null);

  const { spinning, highlighted, result, spin } = useSpinAnimation();

  // 히스토리 누적
  const [lastResult, setLastResult] = useState(null);
  if (result && result !== lastResult) {
    setLastResult(result);
    setHistory(prev => [result, ...prev].slice(0, 8));
  }

  // 결과가 뜨면 오버레이 표시
  useEffect(() => {
    if (result) {
      setShowOverlay(true);
      clearTimeout(overlayTimer.current);
    }
  }, [result]);

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
          호선을 고르고 SPIN — 오늘의 데이트 장소를 뽑아봐요 💕
        </p>
      </div>

      {/* 호선 선택 */}
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

      {/* 지도 (오버레이 기준점) */}
      <div style={{
        margin: '0 16px 14px',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(232,87,138,0.10)',
        background: '#fff',
        aspectRatio: '4/3',
        position: 'relative',
      }}>
        <SubwayMap selectedLine={selectedLine} highlighted={highlighted} />

        {/* 결과 오버레이: 지도 중앙에 크게 */}
        {showOverlay && result && (
          <div
            onAnimationEnd={() => setShowOverlay(false)}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.96)',
              borderRadius: 24,
              padding: '20px 32px',
              textAlign: 'center',
              boxShadow: `0 8px 40px ${result.lineInfo.color}44, 0 2px 16px rgba(0,0,0,0.12)`,
              border: `2px solid ${result.lineInfo.color}66`,
              animation: 'resultPop 1.9s ease forwards',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 160,
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: result.lineInfo.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: `0 4px 12px ${result.lineInfo.color}66`,
            }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
              <span style={{ fontSize: 22, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", lineHeight: 1 }}>{result.lineKey}</span>
            </div>
            <div style={{
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: 30,
              fontWeight: 800,
              color: result.lineInfo.color,
              letterSpacing: -1,
              lineHeight: 1.2,
            }}>
              {result.station}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>역</div>
          </div>
        )}
      </div>

      {/* SPIN 버튼 */}
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => spin(selectedLine)}
          disabled={spinning}
          style={{
            width: '100%',
            height: 58,
            borderRadius: 16,
            border: 'none',
            cursor: spinning ? 'not-allowed' : 'pointer',
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#fff',
            background: spinning
              ? 'linear-gradient(135deg, #f5b8cc, #e8a0b8)'
              : 'linear-gradient(135deg, #f06292 0%, #e8578a 50%, #c2185b 100%)',
            boxShadow: spinning ? 'none' : '0 6px 20px rgba(232,87,138,0.38)',
            transition: 'all 0.2s',
            transform: spinning ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {spinning ? '🌸 뽑는 중...' : result ? '🔄 다시 뽑기' : '🎲 지금 뽑기!'}
        </button>
      </div>

      {/* 결과 카드 */}
      {result && <ResultCard result={result} />}

      {/* 히스토리 */}
      <HistoryChips history={history} />
    </div>
  );
}
