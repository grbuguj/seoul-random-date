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
    return await res.json(); // [{ thumbnail, link, title }]
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
    <div style={{ padding: '0 20px 6px' }}>
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: 'var(--muted)', letterSpacing: 1,
        marginBottom: 10, textTransform: 'uppercase',
      }}>
        📸 {station}역 주변 둘러보기
      </div>

      {ROWS.map((row, ri) => (
        <div key={ri} style={{ marginBottom: 12 }}>
          {/* 행 레이블 */}
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: lineColor,
            marginBottom: 5,
          }}>
            {row.emoji} {row.label}
          </div>

          {/* 이미지 가로 스크롤 */}
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {loading ? (
              // 스켈레톤
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={skeletonStyle} />
              ))
            ) : rows[ri].length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0' }}>
                이미지를 불러오지 못했어요
              </div>
            ) : (
              rows[ri].slice(0, 4).map((img, i) => (
                <a
                  key={i}
                  href={img.link}
                  target="_blank"
                  rel="noreferrer"
                  style={imgWrapStyle}
                >
                  <img
                    src={img.thumbnail}
                    alt={img.title?.replace(/<[^>]+>/g, '') || row.label}
                    style={imgStyle}
                    loading="lazy"
                  />
                </a>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const skeletonStyle = {
  width: 86, height: 86,
  borderRadius: 12,
  background: 'linear-gradient(90deg, #f5e4ea 25%, #fceef2 50%, #f5e4ea 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  flexShrink: 0,
};

const imgWrapStyle = {
  flexShrink: 0,
  width: 86, height: 86,
  borderRadius: 12,
  overflow: 'hidden',
  display: 'block',
  border: '1px solid rgba(232,87,138,0.12)',
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};
