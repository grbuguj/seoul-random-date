/**
 * 효과음 유틸 — Web Audio API 기반 (외부 파일 불필요)
 * 브라우저 AudioContext는 사용자 인터랙션 이후 resume 필요
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ─── 기본 helpers ────────────────────────────────────────────────

function playOsc({ freq = 440, type = 'sine', gainVal = 0.18, duration = 0.08, delay = 0, fadeOut = true } = {}) {
  try {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    g.gain.setValueAtTime(gainVal, ac.currentTime + delay);
    if (fadeOut) g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime  + delay + duration + 0.01);
  } catch { /* 사운드 실패 무시 */ }
}

function playNoise({ gainVal = 0.04, duration = 0.04, delay = 0 } = {}) {
  try {
    const ac     = getCtx();
    const size   = ac.sampleRate * duration;
    const buffer = ac.createBuffer(1, size, ac.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

    const source = ac.createBufferSource();
    const g      = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type      = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value   = 0.8;

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(g);
    g.connect(ac.destination);

    g.gain.setValueAtTime(gainVal, ac.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

    source.start(ac.currentTime + delay);
    source.stop(ac.currentTime  + delay + duration + 0.01);
  } catch { /* 사운드 실패 무시 */ }
}

// ─── 공개 사운드 함수 ────────────────────────────────────────────

/**
 * 스핀 틱 (역이 바뀔 때마다) — 짧은 딸깍 소리
 * speed: 0(빠름) ~ 1(느림)
 */
export function playSpinTick(speed = 0) {
  const freq = 900 + speed * 300; // 빠를 때 높고, 느려질 때 낮아짐
  playOsc({ freq, type: 'square', gainVal: 0.06, duration: 0.025 });
  playNoise({ gainVal: 0.025, duration: 0.018 });
}

/**
 * 결과 팡파레 🎉 — 짜라랑~
 */
export function playResultFanfare() {
  // 상승하는 화음 시퀀스
  const notes = [
    { freq: 523.25, delay: 0.00 },   // C5
    { freq: 659.25, delay: 0.10 },   // E5
    { freq: 783.99, delay: 0.20 },   // G5
    { freq: 1046.5, delay: 0.32 },   // C6 (high)
    { freq: 783.99, delay: 0.44 },   // G5
    { freq: 1046.5, delay: 0.52 },   // C6
  ];
  notes.forEach(({ freq, delay }) => {
    playOsc({ freq, type: 'triangle', gainVal: 0.22, duration: 0.18, delay, fadeOut: true });
  });
  // 반짝 노이즈 추가
  playNoise({ gainVal: 0.08, duration: 0.12, delay: 0.32 });
}

/**
 * 버튼 클릭 뾱 — 짧고 통통
 */
export function playButtonPop() {
  playOsc({ freq: 680, type: 'sine', gainVal: 0.12, duration: 0.055 });
  playOsc({ freq: 440, type: 'sine', gainVal: 0.06, duration: 0.04, delay: 0.02 });
}

/**
 * 호선 선택 뾱 — 색깔 느낌 다르게
 */
export function playLineSelect(lineKey) {
  const freqMap = {
    'rand': 520,
    '1': 480, '2': 560, '3': 610,
    '4': 540, '5': 490, '6': 580,
    '7': 460, '8': 620, '9': 500,
  };
  const freq = freqMap[lineKey] ?? 520;
  playOsc({ freq, type: 'sine', gainVal: 0.10, duration: 0.07 });
  playOsc({ freq: freq * 1.5, type: 'sine', gainVal: 0.05, duration: 0.05, delay: 0.03 });
}

/**
 * 커플 모드 ON 사운드 💑
 */
export function playCoupleToggle(on) {
  if (on) {
    // 하트 두근두근
    playOsc({ freq: 440, type: 'sine', gainVal: 0.14, duration: 0.08, delay: 0 });
    playOsc({ freq: 550, type: 'sine', gainVal: 0.14, duration: 0.08, delay: 0.12 });
    playOsc({ freq: 660, type: 'sine', gainVal: 0.18, duration: 0.15, delay: 0.22 });
  } else {
    // OFF: 내려가는 음
    playOsc({ freq: 660, type: 'sine', gainVal: 0.10, duration: 0.08, delay: 0 });
    playOsc({ freq: 440, type: 'sine', gainVal: 0.08, duration: 0.07, delay: 0.09 });
  }
}

/**
 * 커플 최종 공개 fanfare 🎊 — 더 화려하게
 */
export function playCoupleReveal() {
  const melody = [
    { freq: 523.25, delay: 0.00 },
    { freq: 659.25, delay: 0.08 },
    { freq: 783.99, delay: 0.16 },
    { freq: 1046.5, delay: 0.26 },
    { freq: 659.25, delay: 0.36 },
    { freq: 783.99, delay: 0.44 },
    { freq: 1046.5, delay: 0.52 },
    { freq: 1318.5, delay: 0.62 },
  ];
  melody.forEach(({ freq, delay }) => {
    playOsc({ freq, type: 'triangle', gainVal: 0.20, duration: 0.16, delay });
  });
  // 반짝 노이즈 2번
  playNoise({ gainVal: 0.09, duration: 0.10, delay: 0.26 });
  playNoise({ gainVal: 0.12, duration: 0.14, delay: 0.62 });
}

/**
 * 스핀 시작 "붕~" 소리
 */
export function playSpinStart() {
  playOsc({ freq: 200, type: 'sawtooth', gainVal: 0.10, duration: 0.15, delay: 0 });
  playOsc({ freq: 400, type: 'sawtooth', gainVal: 0.08, duration: 0.12, delay: 0.05 });
}

/**
 * 이미지/링크 버튼 클릭 — 가벼운 탭
 */
export function playTap() {
  playNoise({ gainVal: 0.05, duration: 0.025 });
  playOsc({ freq: 820, type: 'sine', gainVal: 0.07, duration: 0.035 });
}
