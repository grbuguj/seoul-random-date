import { useState, useRef, useCallback } from 'react';
import { LINES } from '../data/stations';
import { LINE_COORDS } from '../data/mapCoords';
import { playSpinTick, playSpinStart, playResultFanfare } from '../utils/sounds';

// 전체 역 flat 배열 (rand 모드용)
const ALL_STATIONS = Object.entries(LINE_COORDS).flatMap(([lk, stations]) =>
  stations.map((s, idx) => ({ lineKey: lk, stationIdx: idx, name: s.name }))
);

export function useSpinAnimation() {
  const [spinning, setSpinning]       = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [result, setResult]           = useState(null);
  const timerRef = useRef(null);

  const spin = useCallback((selectedLine, durationMs = 10000) => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    playSpinStart();

    if (selectedLine === 'rand') {
      const target = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
      const TOTAL  = 36;
      // rand 모드 자연 길이 ≈ 7000ms → 사용자 지정 duration으로 스케일
      const scale  = durationMs / 7000;
      let step     = 0;

      const tick = () => {
        if (step < TOTAL) {
          const rand = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
          setHighlighted({ lineKey: rand.lineKey, stationIdx: rand.stationIdx });
          const progress = step / TOTAL;
          playSpinTick(progress);
          step++;
          const delay = (55 + Math.pow(progress, 2.4) * 480) * scale;
          timerRef.current = setTimeout(tick, delay);
        } else {
          setHighlighted({ lineKey: target.lineKey, stationIdx: target.stationIdx });
          setSpinning(false);
          setResult({ lineKey: target.lineKey, lineInfo: LINES[target.lineKey], station: target.name });
          playResultFanfare();
        }
      };
      tick();
      return;
    }

    const lineKey   = selectedLine;
    const coords    = LINE_COORDS[lineKey];
    const targetIdx = Math.floor(Math.random() * coords.length);
    const startIdx  = Math.floor(Math.random() * coords.length);
    const LOOPS     = 3;
    const totalSteps =
      LOOPS * coords.length +
      ((targetIdx - startIdx + coords.length) % coords.length);

    // 특정 호선: 평균 딜레이 ≈ 200ms/step → 사용자 지정 duration으로 스케일
    const scale = durationMs / (totalSteps * 200);

    let step = 0;
    const tick = () => {
      const idx = (startIdx + step) % coords.length;
      setHighlighted({ lineKey, stationIdx: idx });

      if (step === totalSteps) {
        setSpinning(false);
        setResult({ lineKey, lineInfo: LINES[lineKey], station: coords[targetIdx].name });
        playResultFanfare();
        return;
      }

      const progress = step / totalSteps;
      playSpinTick(progress);
      step++;
      const delay = (60 + Math.pow(progress, 2.5) * 490) * scale;
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
