import { useState, useRef, useEffect } from 'react';
import { playButtonPop } from '../utils/sounds';

/**
 * DualPressButton
 * 두 버튼을 동시에 누르고 있으면 (HOLD_MS 유지) onBothPressed 호출
 *
 * Props:
 *   labelA, labelB  — 버튼 라벨
 *   colorA, colorB  — 버튼 색상
 *   onBothPressed   — 동시 누르기 완료 콜백
 *   disabled        — 비활성
 */

const HOLD_MS = 600; // 몇 ms 같이 눌러야 발동

export default function DualPressButton({ labelA, labelB, colorA = '#a855f7', colorB = '#64b5f6', onBothPressed, disabled }) {
  const [pressedA, setPressedA] = useState(false);
  const [pressedB, setPressedB] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1
  const timerRef  = useRef(null);
  const startRef  = useRef(null);
  const rafRef    = useRef(null);
  const firedRef  = useRef(false);

  const bothDown = pressedA && pressedB;

  // 두 버튼 모두 눌렸을 때 타이머 시작
  useEffect(() => {
    if (disabled || firedRef.current) return;

    if (bothDown) {
      firedRef.current = false;
      startRef.current = performance.now();

      const tick = () => {
        const elapsed = performance.now() - startRef.current;
        const p = Math.min(elapsed / HOLD_MS, 1);
        setProgress(p);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          if (!firedRef.current) {
            firedRef.current = true;
            onBothPressed?.();
            playButtonPop();
          }
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      setProgress(0);
      firedRef.current = false;
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [bothDown, disabled]);

  function handleDown(which) {
    if (disabled) return;
    if (which === 'A') setPressedA(true);
    else setPressedB(true);
  }
  function handleUp(which) {
    if (which === 'A') setPressedA(false);
    else setPressedB(false);
  }

  const buttonBase = (color, pressed) => ({
    flex: 1,
    height: 64,
    borderRadius: 18,
    border: 'none',
    background: pressed
      ? `linear-gradient(135deg, ${color}dd, ${color})`
      : `linear-gradient(135deg, ${color}33, ${color}55)`,
    color: pressed ? '#fff' : color,
    fontSize: 14,
    fontWeight: 800,
    fontFamily: "'마루 부리', 'MaruBuri', serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    transform: pressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'transform 0.1s, background 0.15s, color 0.15s',
    boxShadow: pressed ? `0 4px 18px ${color}66` : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 안내 텍스트 */}
      <div style={{
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: bothDown ? 'var(--pink)' : 'var(--muted)',
        letterSpacing: 0.3,
        transition: 'color 0.2s',
      }}>
        {bothDown
          ? progress < 1 ? '🔥 조금만 더 누르세요...' : '🎲 출발!'
          : !pressedA && !pressedB
            ? '두 사람이 동시에 버튼을 꾸욱 누르세요 💕'
            : pressedA
              ? `${labelB}도 눌러요! 💙`
              : `${labelA}도 눌러요! 💗`}
      </div>

      {/* 버튼 두 개 */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          style={buttonBase(colorA, pressedA)}
          onPointerDown={e => { e.preventDefault(); handleDown('A'); }}
          onPointerUp={() => handleUp('A')}
          onPointerLeave={() => handleUp('A')}
          onPointerCancel={() => handleUp('A')}
          disabled={disabled}
        >
          <span style={{ fontSize: 18 }}>💗</span>
          <span>{labelA}</span>
        </button>

        <button
          style={buttonBase(colorB, pressedB)}
          onPointerDown={e => { e.preventDefault(); handleDown('B'); }}
          onPointerUp={() => handleUp('B')}
          onPointerLeave={() => handleUp('B')}
          onPointerCancel={() => handleUp('B')}
          disabled={disabled}
        >
          <span style={{ fontSize: 18 }}>💙</span>
          <span>{labelB}</span>
        </button>
      </div>

      {/* 프로그레스 바 */}
      {bothDown && (
        <div style={{
          height: 5,
          borderRadius: 10,
          background: 'var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${colorA}, ${colorB})`,
            transition: 'none',
            borderRadius: 10,
          }} />
        </div>
      )}
    </div>
  );
}
