export default function HistoryChips({ history }) {
  if (!history.length) return null;
  return (
    <div style={{ padding: '4px 16px 32px' }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        color: 'var(--pink-mid)',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
      }}>
        히스토리
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
        {history.map((h, i) => (
          <div key={i} style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: '1.5px solid var(--border)',
            background: '#fff',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: h.lineInfo.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {h.station}역
          </div>
        ))}
      </div>
    </div>
  );
}
