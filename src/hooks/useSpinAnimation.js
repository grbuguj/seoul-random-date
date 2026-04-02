import { useState, useRef, useCallback } from 'react';
import { LINES } from '../data/stations';
import { LINE_COORDS } from '../data/mapCoords';

// 전체 역 flat 배열 (rand 모드용)
const ALL_STATIONS = Object.entries(LINE_COORDS).flatMap(([lk, stations]) =>
  stations.map((s, idx) => ({ lineKey: lk, stationIdx: idx, name: s.name }))
);

export function useSpinAnimation() {
  const [spinning, setSpinning]       = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [result, setResult]           = useState(null);
  const timerRef = useRef(null);

  const spin = useCallback((selectedLine) => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    if (selectedLine === 'rand') {
      // 전체 노선 랜덤: 도트가 온 지도를 날아다님
      const target     = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
      const TOTAL      = 36; // 고정 스텝 수
      let step         = 0;

      const tick = () => {
        if (step < TOTAL) {
          const rand = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
          setHighlighted({ lineKey: rand.lineKey, stationIdx: rand.stationIdx });
          step++;
          const progress = step / TOTAL;
          const delay = 55 + Math.pow(progress, 2.4) * 480;
          timerRef.current = setTimeout(tick, delay);
        } else {
          setHighlighted({ lineKey: target.lineKey, stationIdx: target.stationIdx });
          setSpinning(false);
          setResult({ lineKey: target.lineKey, lineInfo: LINES[target.lineKey], station: target.name });
        }
      };
      tick();
      return;
    }

    // 특정 호선 선택: 해당 호선 내에서 3바퀴 후 착지
    const lineKey   = selectedLine;
    const coords    = LINE_COORDS[lineKey];
    const targetIdx = Math.floor(Math.random() * coords.length);
    const startIdx  = Math.floor(Math.random() * coords.length);
    const LOOPS     = 3;
    const totalSteps =
      LOOPS * coords.length +
      ((targetIdx - startIdx + coords.length) % coords.length);

    let step = 0;
    const tick = () => {
      const idx = (startIdx + step) % coords.length;
      setHighlighted({ lineKey, stationIdx: idx });

      if (step === totalSteps) {
        setSpinning(false);
        setResult({ lineKey, lineInfo: LINES[lineKey], station: coords[targetIdx].name });
        return;
      }

      step++;
      const progress = step / totalSteps;
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
