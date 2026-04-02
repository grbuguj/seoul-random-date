export default function ResultCard({ result }) {
  if (!result) return null;
  const { lineKey, lineInfo, station } = result;
  const mapQuery   = encodeURIComponent(station + '역');
  const naverQuery = encodeURIComponent(station + '역 데이트');

  return (
    <div style={{
      margin: '0 16px 14px',
      borderRadius: 20,
      background: '#fff',
      border: `1.5px solid ${lineInfo.color}44`,
      boxShadow: `0 6px 28px ${lineInfo.color}22, 0 2px 8px rgba(0,0,0,0.06)`,
      overflow: 'hidden',
      animation: 'slideUp 0.35s ease',
    }}>
      {/* 컬러 상단 바 */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${lineInfo.color}, ${lineInfo.color}88)` }} />

      <div style={{ padding: '18px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 배지 */}
        <div style={{
          width: 56, height: 56,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${lineInfo.color}, ${lineInfo.color}cc)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${lineInfo.color}55`,
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>호선</span>
          <span style={{ fontSize: 26, color: '#fff', fontFamily: "'마루 부리', 'MaruBuri', serif", fontWeight: 800, lineHeight: 1 }}>{lineKey}</span>
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
            {lineInfo.name} · 오늘의 데이트 장소 🌸
          </div>
          <div style={{
            fontFamily: "'마루 부리', 'MaruBuri', serif",
            fontSize: 28,
            fontWeight: 800,
            color: lineInfo.color,
            letterSpacing: -1,
            lineHeight: 1.15,
          }}>
            {station}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}>역</span>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
        <a
          href={`https://map.kakao.com/link/search/${mapQuery}`}
          target="_blank" rel="noreferrer"
          style={linkBtn(lineInfo.color, true)}
        >
          📍 지도 보기
        </a>
        <a
          href={`https://search.naver.com/search.naver?query=${naverQuery}`}
          target="_blank" rel="noreferrer"
          style={linkBtn(lineInfo.color, false)}
        >
          🔍 데이트 검색
        </a>
      </div>
    </div>
  );
}

const linkBtn = (color, filled) => ({
  flex: 1,
  padding: '9px 0',
  borderRadius: 12,
  border: `1.5px solid ${color}55`,
  background: filled ? color : `${color}12`,
  color: filled ? '#fff' : color,
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block',
  transition: 'opacity 0.15s',
});
