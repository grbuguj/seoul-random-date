import { useState, useRef, useCallback } from 'react';
import { LINES } from '../data/stations';
import { LINE_COORDS } from '../data/mapCoords';

export function useSpinAnimation() {
  const [spinning, setSpinning]     = useState(false);
  const [highlighted, setHighlighted] = useState(null); // { lineKey, stationIdx }
  const [result, setResult]         = useState(null);
  const timerRef = useRef(null);

  const spin = useCallback((selectedLine) => {
    if (spinning) return;

    // 호선 결정
    const lineKey = selectedLine === 'rand'
      ? Object.keys(LINES)[Math.floor(Math.random() * 9)]
      : selectedLine;

    const coords   = LINE_COORDS[lineKey];
    const targetIdx = Math.floor(Math.random() * coords.length);

    setSpinning(true);
    setResult(null);

    // 시작 인덱스 랜덤, 3바퀴 돌고 targetIdx 에 착지
    const LOOPS    = 3;
    const startIdx = Math.floor(Math.random() * coords.length);
    const totalSteps =
      LOOPS * coords.length +
      ((targetIdx - startIdx + coords.length) % coords.length);

    let step = 0;

    const tick = () => {
      const idx = (startIdx + step) % coords.length;
      setHighlighted({ lineKey, stationIdx: idx });

      if (step === totalSteps) {
        setSpinning(false);
        setResult({
          lineKey,
          lineInfo: LINES[lineKey],
          station: coords[targetIdx].name,
        });
        return;
      }

      step++;
      const progress = step / totalSteps;
      // 60ms(빠름) → 550ms(느림) 지수 감속
      const delay = 60 + Math.pow(progress, 2.5) * 490;
      timerRef.current = setTimeout(tick, delay);
    };

    tick();
  }, [spinning]);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setSpinning(false);
    setHighlighted(null);
    setResult(null);
  }, []);

  return { spinning, highlighted, result, spin, reset };
}
