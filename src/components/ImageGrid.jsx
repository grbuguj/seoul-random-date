import { useEffect, useState } from 'react';

const ROWS = [
  { emoji: '📍', label: '역 분위기', suffix: '역' },
  { emoji: '☕', label: '카페',      suffix: '역 카페' },
  { emoji: '🍽',  label: '맛집',      suffix: '역 맛집' },
];

async function fetchImages(query) {
  try {
    const res = await fetch(`/api/images?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return [];
  }
}

export default function ImageGrid({ station, lineColor }) {
  const [rows, setRows] = useState(ROWS.map(() => []));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!station) return;
    setLoading(true);
    Promise.all(
      ROWS.map(r => fetchImages(station + r.suffix))
    ).then(results => {
      setRows(results);
      setLoading(false);
    });
  }, [station]);

  return (
    <div style={{ padding: '0 20px 10px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 14 }}>
        📸 {station}역 주변 둘러보기
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ROWS.map((row, ri) => {
          const naverUrl = `https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(station + row.suffix)}`;
          return (
            <div key={ri}>
              <div style={{ fontSize: 11, fontWeight: 700, color: lineColor, marginBottom: 6 }}>
                {row.emoji} {row.label}
              </div>

              {loading ? (
                <Grid3Skeleton />
              ) : rows[ri].length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>이미지를 불러오지 못했어요</div>
              ) : (
                <Grid3 images={rows[ri].slice(0, 3)} label={row.label} lineColor={lineColor} naverUrl={naverUrl} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Grid3({ images, label, lineColor, naverUrl }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 3,
    }}>
      {Array.from({ length: 3 }).map((_, i) => {
        const img = images[i];
        if (!img) return <div key={i} style={{ aspectRatio: '1', background: `${lineColor}10` }} />;
        return (
          <a
            key={i}
            href={naverUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', aspectRatio: '1', overflow: 'hidden', background: `${lineColor}10` }}
          >
            <img
              src={img.thumbnail}
              alt={img.title?.replace(/<[^>]+>/g, '') || label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          </a>
        );
      })}
    </div>
  );
}

function Grid3Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{
          aspectRatio: '1',
          background: 'linear-gradient(90deg, #f5e4ea 25%, #fceef2 50%, #f5e4ea 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
    </div>
  );
}
