export default function HistoryChips({ history }) {
  if (!history.length) return null;
  return (
    <div style={{ padding: '0 16px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#7070a0', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', fontWeight: 700 }}>
        히스토리
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {history.map((h, i) => (
          <div key={i} style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: '1.5px solid #2a2a40',
            background: '#14141c',
            fontSize: 13,
            fontFamily: "'Black Han Sans', sans-serif",
            color: '#f0f0f8',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.lineInfo.color, display: 'inline-block' }} />
            {h.station}역
          </div>
        ))}
      </div>
    </div>
  );
}
