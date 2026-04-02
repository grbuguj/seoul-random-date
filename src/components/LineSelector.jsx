import { LINES } from '../data/stations';
import { playLineSelect } from '../utils/sounds';

const BUTTONS = [
  { key: 'rand', label: '🎲', title: '완전 랜덤', color: null },
  ...Object.entries(LINES).map(([k, v]) => ({ key: k, label: k, title: v.name, color: v.color })),
];

export default function LineSelector({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {BUTTONS.map(({ key, label, title, color }) => {
        const isSelected = selected === key;
        const isRand = key === 'rand';

        return (
          <button
            key={key}
            title={title}
            onClick={() => { playLineSelect(key); onChange(key); }}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: isSelected
                ? `2.5px solid ${isRand ? '#e8578a' : color}`
                : '2.5px solid transparent',
              cursor: 'pointer',
              fontFamily: "'마루 부리', 'MaruBuri', serif",
              fontSize: isRand ? 16 : 13,
              fontWeight: 800,
              color: isSelected ? '#fff' : isRand ? 'var(--pink)' : color,
              background: isSelected
                ? (isRand ? 'linear-gradient(135deg,#f06292,#e8578a)' : color)
                : (isRand ? 'var(--pink-light)' : `${color}18`),
              transform: isSelected ? 'scale(1.18)' : 'scale(1)',
              boxShadow: isSelected
                ? `0 4px 12px ${isRand ? 'rgba(232,87,138,0.45)' : color + '66'}`
                : 'none',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
