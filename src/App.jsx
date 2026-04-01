import './styles/global.css';
import { useState } from 'react';
import LineSelector   from './components/LineSelector';
import SubwayMap      from './components/SubwayMap';
import ResultCard     from './components/ResultCard';
import HistoryChips   from './components/HistoryChips';
import { useSpinAnimation } from './hooks/useSpinAnimation';

export default function App() {
  const [selectedLine, setSelectedLine] = useState('rand');
  const [history, setHistory]           = useState([]);
  const { spinning, highlighted, result, spin } = useSpinAnimation();

  function handleSpin() {
    spin(selectedLine);
  }

  // 결과 나오면 히스토리 추가 (result 변경 시)
  const [lastResult, setLastResult] = useState(null);
  if (result && result !== lastResult) {
    setLastResult(result);
    setHistory(prev => [result, ...prev].slice(0, 8));
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
        <h1 style={{
          fontFamily: "'Black Han Sans', sans-serif",
          fontSize: 'clamp(24px,5vw,40px)',
          background: 'linear-gradient(135deg, #ff7eb3 0%, #f0f4f8 55%, #4dabf7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: -1,
          margin: 0,
        }}>
          🎰 서울 랜덤 데이트
        </h1>
        <p style={{ color: '#7070a0', fontSize: 13, margin: '4px 0 0' }}>
          호선 고르고 SPIN — 오늘의 데이트 장소
        </p>
      </div>

      {/* 호선 선택 */}
      <LineSelector selected={selectedLine} onChange={setSelectedLine} />

      {/* 지도 */}
      <div style={{
        flex: '1 1 0',
        minHeight: 320,
        maxHeight: '55vh',
        margin: '0 8px',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1.5px solid #2a2a40',
        position: 'relative',
      }}>
        <SubwayMap selectedLine={selectedLine} highlighted={highlighted} />
      </div>

      {/* SPIN 버튼 */}
      <div style={{ padding: '16px 16px 12px' }}>
        <button
          onClick={handleSpin}
          disabled={spinning}
          style={{
            width: '100%',
            height: 60,
            borderRadius: 16,
            border: 'none',
            cursor: spinning ? 'not-allowed' : 'pointer',
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 22,
            letterSpacing: 3,
            color: '#fff',
            background: spinning ? '#2a3545' : 'linear-gradient(135deg, #ff7eb3, #e63950)',
            transition: 'background 0.2s, transform 0.1s',
            transform: spinning ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {spinning ? 'SPINNING...' : result ? '다시 뽑기 !' : 'SPIN !'}
        </button>
      </div>

      {/* 결과 카드 */}
      {result && <ResultCard result={result} />}

      {/* 히스토리 */}
      <HistoryChips history={history} />
    </div>
  );
}
