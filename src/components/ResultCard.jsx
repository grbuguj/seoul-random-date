export default function ResultCard({ result }) {
  if (!result) return null;
  const { lineKey, lineInfo, station } = result;
  const mapQuery   = encodeURIComponent(station + '역');
  const naverQuery = encodeURIComponent(station + '역 데이트 카페');

  return (
    <div style={{
      margin: '0 16px 16px',
      padding: '18px 20px',
      borderRadius: 20,
      background: '#1c1c28',
      border: `2px solid ${lineInfo.color}44`,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      animation: 'slideUp 0.35s ease',
    }}>
      {/* 배지 */}
      <div style={{
        width: 56, height: 56,
        borderRadius: 16,
        background: lineInfo.color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: 'sans-serif' }}>호선</span>
        <span style={{ fontSize: 26, color: '#fff', fontFamily: "'Black Han Sans', sans-serif", lineHeight: 1 }}>{lineKey}</span>
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Black Han Sans', sans-serif",
          fontSize: 30,
          color: lineInfo.color,
          letterSpacing: -1,
          lineHeight: 1.1,
          marginBottom: 4,
          filter: `drop-shadow(0 0 8px ${lineInfo.color}88)`,
        }}>
          {station}역
        </div>
        <div style={{ fontSize: 12, color: '#7070a0' }}>{lineInfo.name} · 오늘의 데이트 장소</div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <a
            href={`https://map.kakao.com/link/search/${mapQuery}`}
            target="_blank" rel="noreferrer"
            style={btnStyle}
          >
            📍 지도 보기
          </a>
          <a
            href={`https://search.naver.com/search.naver?query=${naverQuery}`}
            target="_blank" rel="noreferrer"
            style={btnStyle}
          >
            🔍 데이트 검색
          </a>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  flex: 1,
  padding: '8px 0',
  borderRadius: 10,
  border: '1.5px solid #2a2a40',
  background: 'transparent',
  color: '#f0f0f8',
  fontSize: 12,
  textAlign: 'center',
  textDecoration: 'none',
  display: 'block',
};
