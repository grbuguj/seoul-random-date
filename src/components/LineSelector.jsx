import { LINES } from '../data/stations';

const BUTTONS = [
  { key: 'rand', label: '🎲', title: '완전 랜덤', style: { background: 'linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)', borderRadius: '14px', width: '52px' } },
  ...Object.entries(LINES).map(([k, v]) => ({ key: k, label: k, title: v.name, style: { background: v.color } })),
];

export default function LineSelector({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '12px 16px' }}>
      {BUTTONS.map(({ key, label, title, style }) => (
        <button
          key={key}
          title={title}
          onClick={() => onChange(key)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: selected === key ? '3px solid #fff' : '3px solid transparent',
            cursor: 'pointer',
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: 15,
            color: '#fff',
            transform: selected === key ? 'scale(1.18)' : 'scale(1)',
            boxShadow: selected === key ? '0 0 0 4px rgba(255,255,255,0.2)' : 'none',
            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
            ...style,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
