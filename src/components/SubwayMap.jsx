import { useState } from 'react';
import { LINES } from '../data/stations';
import { LINE_COORDS, project } from '../data/mapCoords';

// ─── 실제 지리 기반 한강 경로 ────────────────────────────────────
// 북안 control points (위경도 → SVG 좌표 계산)
const R = (lat, lng) => { const p = project(lat, lng); return `${p.x},${p.y}`; };

// 북안 (west → east)
const NORTH = [
  [37.5670, 126.8150], [37.5580, 126.8420], [37.5460, 126.8750],
  [37.5400, 126.9000], [37.5340, 126.9200], [37.5270, 126.9430],
  [37.5220, 126.9680], [37.5200, 126.9920], [37.5200, 127.0120],
  [37.5210, 127.0350], [37.5280, 127.0600], [37.5320, 127.0900],
  [37.5360, 127.1250], [37.5430, 127.1600],
];
// 남안 (east → west)
const SOUTH = [
  [37.5300, 127.1600], [37.5230, 127.1250], [37.5190, 127.0900],
  [37.5150, 127.0600], [37.5110, 127.0350], [37.5100, 127.0120],
  [37.5080, 126.9920], [37.5060, 126.9680], [37.5140, 126.9430],
  [37.5240, 126.9200], [37.5360, 126.9000], [37.5330, 126.8750],
  [37.5460, 126.8420], [37.5560, 126.8150],
];

const HAN_FILL = `M ${NORTH.map(([la,ln]) => R(la,ln)).join(' L ')} L ${SOUTH.map(([la,ln]) => R(la,ln)).join(' L ')} Z`;
const HAN_NORTH_PATH = `M ${NORTH.map(([la,ln]) => R(la,ln)).join(' L ')}`;
const HAN_SOUTH_PATH = `M ${SOUTH.map(([la,ln]) => R(la,ln)).join(' L ')}`;

// 여의도 섬 (위경도 기반)
const YEOUIDO = [
  [37.5310, 126.9170], [37.5290, 126.9230], [37.5250, 126.9310],
  [37.5210, 126.9370], [37.5195, 126.9340], [37.5210, 126.9230],
  [37.5250, 126.9140], [37.5290, 126.9120],
];
const YEOUIDO_PATH = `M ${YEOUIDO.map(([la,ln]) => R(la,ln)).join(' L ')} Z`;

// 서울 시 경계 (위경도 기반, 러프)
const BORDER_PTS = [
  [37.7017, 127.0321], [37.6853, 127.1123], [37.6394, 127.1794],
  [37.5600, 127.1862], [37.4775, 127.1797], [37.4265, 127.1028],
  [37.4249, 126.9991], [37.4460, 126.8797], [37.5180, 126.7906],
  [37.5956, 126.7904], [37.6556, 126.8325], [37.6989, 126.8873],
];
const SEOUL_PATH = `M ${BORDER_PTS.map(([la,ln]) => R(la,ln)).join(' L ')} Z`;

// 노선별 연결 순서 (segments per line)
const LINE_SEGMENTS = {
  '1': [
    // 경부선: 금천구청 ↔ 도봉산
    ['금천구청','독산','가산디지털단지','구로','신도림','영등포','신길','대방','노량진','용산','남영','서울역','시청','종각','종로3가','종로5가','동대문','동묘앞','신설동','제기동','청량리','회기','외대앞','신이문','석계','광운대','월계','녹천','창동','방학','도봉','도봉산'],
    // 경인선 서울 구간: 구로 ↔ 온수
    ['구로','구일','개봉','오류동','온수'],
  ],
  '2': [
    ['시청','을지로입구','을지로3가','을지로4가','동대문역사문화공원','신당','상왕십리','왕십리','한양대','뚝섬','성수','건대입구','구의','강변','잠실나루','잠실','잠실새내','종합운동장','삼성','선릉','역삼','강남','교대','서초','방배','사당','낙성대','서울대입구','봉천','신림','신대방','구로디지털단지','대림','신도림','문래','영등포구청','당산','합정','홍대입구','신촌','이대','아현','충정로','시청'],
    ['성수','용답','신답','용두','신설동'],
    ['신도림','도림천','양천구청','신정네거리','까치산'],
  ],
  '3': [['구파발','연신내','불광','녹번','홍제','무악재','독립문','경복궁','안국','종로3가','을지로3가','충무로','동대입구','약수','금호','옥수','압구정','신사','잠원','고속터미널','교대','남부터미널','양재','매봉','도곡','대치','학여울','대청','일원','수서','가락시장','오금']],
  '4': [['당고개','상계','노원','창동','쌍문','수유','미아','미아사거리','길음','성신여대입구','한성대입구','혜화','동대문','동대문역사문화공원','충무로','명동','회현','서울역','숙대입구','삼각지','신용산','이촌','동작','총신대입구','사당','남태령']],
  '5': [
    ['방화','개화산','김포공항','송정','마곡','발산','우장산','화곡','까치산','신정','목동','오목교','양평','영등포구청','영등포시장','신길','여의도','여의나루','마포','공덕','애오개','충정로','서대문','광화문','종로3가','을지로4가','동대문역사문화공원','청구','신금호','행당','왕십리','마장','답십리','장한평','군자','아차산','광나루','천호','강동'],
    ['강동','길동','굽은다리','명일','고덕','상일동'],
    ['강동','둔촌','올림픽공원','방이','오금','개롱','거여','마천'],
  ],
  '6': [['응암','역촌','불광','독바위','연신내','구산','새절','증산','디지털미디어시티','월드컵경기장','마포구청','망원','합정','상수','광흥창','대흥','공덕','효창공원앞','삼각지','녹사평','이태원','한강진','버티고개','약수','청구','신당','동묘앞','창신','보문','안암','고려대','월곡','상월곡','돌곶이','석계','태릉입구','화랑대','봉화산','신내']],
  '7': [['도봉산','수락산','마들','노원','중계','하계','공릉','태릉입구','먹골','중화','상봉','면목','사가정','용마산','중곡','군자','어린이대공원','건대입구','뚝섬유원지','청담','강남구청','학동','논현','반포','고속터미널','내방','이수','남성','숭실대입구','상도','장승배기','신대방삼거리','보라매','신풍','대림','남구로','가산디지털단지','천왕','온수']],
  '8': [['암사','천호','강동구청','몽촌토성','잠실','석촌','송파','가락시장','문정','장지','복정']],
  '9': [['개화','김포공항','공항시장','신방화','마곡나루','양천향교','가양','증미','등촌','염창','신목동','선유도','당산','국회의사당','여의도','샛강','노량진','노들','흑석','동작','구반포','신반포','고속터미널','사평','신논현','언주','선정릉','삼성중앙','봉은사','종합운동장','삼전','석촌고분','석촌','송파나루','한성백제','올림픽공원','둔촌오륜','중앙보훈병원']],
};

function getCoord(lk, name) {
  return LINE_COORDS[lk]?.find(s => s.name === name);
}
function buildPoints(lk, seg) {
  return seg.map(n => getCoord(lk, n)).filter(Boolean).map(s => `${s.x},${s.y}`).join(' ');
}

export default function SubwayMap({ selectedLine, highlighted, onStationClick }) {
  const activeLine = selectedLine === 'rand' ? null : selectedLine;
  // 터치/클릭으로 선택한 역 (스핀 애니메이션과 별개)
  const [touchedStation, setTouchedStation] = useState(null); // { lk, idx }

  function handleStationTouch(lk, idx, name) {
    setTouchedStation({ lk, idx });
    onStationClick?.(name, lk);
    // 2.5초 후 툴팁 사라짐
    setTimeout(() => setTouchedStation(null), 2500);
  }

  return (
    <svg
      viewBox="80 48 880 650"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="riverG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#90caf9" stopOpacity="0.55" />
          <stop offset="50%"  stopColor="#64b5f6" stopOpacity="0.70" />
          <stop offset="100%" stopColor="#90caf9" stopOpacity="0.50" />
        </linearGradient>
        <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#fff8fa" />
          <stop offset="100%" stopColor="#fef0f4" />
        </linearGradient>
        <filter id="stGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* 배경 */}
      <rect x="60" y="40" width="920" height="680" fill="url(#bgG)" />

      {/* 서울 시 경계 */}
      <path d={SEOUL_PATH}
        fill="rgba(252,232,240,0.55)"
        stroke="rgba(232,87,138,0.18)"
        strokeWidth="1.5"
      />

      {/* 한강 */}
      <path d={HAN_FILL}       fill="url(#riverG)" />
      <path d={HAN_NORTH_PATH} fill="none" stroke="rgba(100,181,246,0.60)" strokeWidth="1" />
      <path d={HAN_SOUTH_PATH} fill="none" stroke="rgba(100,181,246,0.40)" strokeWidth="0.7" />
      {/* 여의도 */}
      <path d={YEOUIDO_PATH}
        fill="rgba(165,214,167,0.50)"
        stroke="rgba(102,187,106,0.50)"
        strokeWidth="1"
      />
      {/* 한강 레이블 */}
      {(() => { const p = project(37.521, 126.970); return (
        <text x={p.x} y={p.y}
          fill="rgba(100,181,246,0.80)" fontSize="10"
          fontFamily="'마루 부리', 'MaruBuri', serif"
          fontWeight="700" letterSpacing="4">한 강</text>
      ); })()}

      {/* 노선 선 */}
      {Object.entries(LINE_SEGMENTS).map(([lk, segs]) => {
        const color  = LINES[lk].color;
        const active = !activeLine || activeLine === lk;
        return segs.map((seg, si) => (
          <polyline key={`${lk}-${si}`}
            points={buildPoints(lk, seg)}
            fill="none" stroke={color}
            strokeWidth={active ? 2.8 : 0.9}
            opacity={active ? 0.92 : 0.10}
            strokeLinecap="round" strokeLinejoin="round"
          />
        ));
      })}

      {/* 역 dot */}
      {Object.entries(LINE_COORDS).map(([lk, stations]) => {
        const color  = LINES[lk].color;
        const active = !activeLine || activeLine === lk;
        return stations.map((s, idx) => {
          const hit     = highlighted?.lineKey === lk && highlighted?.stationIdx === idx;
          const touched = touchedStation?.lk === lk && touchedStation?.idx === idx;
          return (
            <circle key={`${lk}-${idx}`}
              cx={s.x} cy={s.y}
              r={hit ? 9 : touched ? 7 : active ? 3.2 : 1.6}
              fill={hit || touched ? color : active ? '#fff' : '#e8c4cc'}
              stroke={hit || touched ? '#fff' : active ? color : '#d4a0b0'}
              strokeWidth={hit ? 2.5 : touched ? 2 : active ? 1.2 : 0.5}
              opacity={active ? 1 : 0.22}
              style={{
                cursor: active ? 'pointer' : 'default',
                ...(hit ? { filter: `drop-shadow(0 0 8px ${color}bb) drop-shadow(0 0 18px ${color}66)` } : {}),
                ...(touched ? { filter: `drop-shadow(0 0 6px ${color}99)` } : {}),
              }}
              onClick={() => active && handleStationTouch(lk, idx, s.name)}
              onTouchStart={(e) => { e.preventDefault(); active && handleStationTouch(lk, idx, s.name); }}
            />
          );
        });
      })}

      {/* 터치 선택 역 툴팁 */}
      {touchedStation && (() => {
        const s     = LINE_COORDS[touchedStation.lk]?.[touchedStation.idx];
        const color = LINES[touchedStation.lk]?.color;
        if (!s) return null;
        const lw = s.name.length * 13 + 20;
        const tx = s.x > 820 ? s.x - lw - 10 : s.x + 14;
        const ty = s.y < 80 ? s.y + 28 : s.y - 14;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={tx - 6} y={ty - 17} width={lw} height={23}
              rx={8} ry={8} fill={color} />
            <text x={tx} y={ty} fill="#fff" fontSize="13"
              fontFamily="'마루 부리', 'MaruBuri', serif" fontWeight="700">
              {s.name}역
            </text>
          </g>
        );
      })()}

      {/* 하이라이트 역명 레이블 */}
      {highlighted && (() => {
        const s     = LINE_COORDS[highlighted.lineKey]?.[highlighted.stationIdx];
        const color = LINES[highlighted.lineKey]?.color;
        if (!s) return null;
        const lw = s.name.length * 13 + 20;
        const tx = s.x > 820 ? s.x - lw - 10 : s.x + 14;
        const ty = s.y > 670 ? s.y - 18 : s.y - 14;
        return (
          <g>
            <rect x={tx - 6} y={ty - 17} width={lw} height={23}
              rx={8} ry={8}
              fill="#fff"
              stroke={color} strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }}
            />
            <text x={tx} y={ty} fill={color} fontSize="13"
              fontFamily="'마루 부리', 'MaruBuri', serif" fontWeight="700">
              {s.name}역
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
