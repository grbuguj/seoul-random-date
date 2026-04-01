import { LINES } from '../data/stations';
import { LINE_COORDS } from '../data/mapCoords';

// ─── 한강 실제 S커브 경로 ─────────────────────────────────────────
const HAN_FILL =
  'M 82,416 C 155,411 228,416 298,424 C 348,429 380,433 418,432 ' +
  'C 472,430 538,426 614,422 C 688,418 745,415 878,408 ' +
  'L 878,452 C 745,459 688,462 614,464 C 538,466 472,468 418,466 ' +
  'C 380,465 348,463 298,457 C 228,450 155,445 82,450 Z';
const HAN_NORTH =
  'M 82,416 C 155,411 228,416 298,424 C 348,429 380,433 418,432 ' +
  'C 472,430 538,426 614,422 C 688,418 745,415 878,408';
const HAN_SOUTH =
  'M 82,450 C 155,445 228,450 298,457 C 348,463 380,465 418,466 ' +
  'C 472,468 538,466 614,464 C 688,462 745,459 878,452';

// 여의도 섬
const YEOUIDO_ISLAND =
  'M 337,434 C 348,429 370,429 385,434 C 394,438 396,447 389,453 ' +
  'C 378,459 352,459 340,453 C 333,448 332,438 337,434 Z';

// 서울 시 경계
const SEOUL_BOUNDARY =
  'M 150,80 L 435,60 L 600,66 L 752,86 L 875,182 L 888,330 ' +
  'L 868,484 L 815,604 L 675,644 L 500,650 L 345,640 ' +
  'L 192,594 L 136,464 L 115,316 L 136,180 Z';

// 북한산/산 영역 (북쪽)
const MOUNTAIN_N = 'M 300,62 C 380,55 480,58 560,65 C 610,68 640,78 600,85 C 560,92 460,90 380,88 C 330,86 285,78 300,62 Z';

// 청계산/남쪽 산
const MOUNTAIN_S = 'M 520,635 C 560,630 620,632 660,638 C 680,641 688,648 660,650 C 630,652 575,652 540,648 C 522,645 515,638 520,635 Z';

// 노선별 연결 순서
const LINE_SEGMENTS = {
  '1': [['서울역','시청','종각','종로3가','종로5가','동대문','동묘앞','신설동','제기동','청량리','회기','외대앞','신이문','석계','광운대','월계','녹천','창동','방학','도봉','도봉산']],
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

function getCoord(lineKey, name) {
  return LINE_COORDS[lineKey]?.find(s => s.name === name);
}
function buildPoints(lineKey, seg) {
  return seg.map(n => getCoord(lineKey, n)).filter(Boolean).map(s => `${s.x},${s.y}`).join(' ');
}

// 벚꽃 컴포넌트
function Blossom({ x, y, size = 12, rotate = 0, opacity = 1 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`} opacity={opacity} style={{ pointerEvents: 'none' }}>
      {[0, 72, 144, 216, 288].map(a => {
        const r = (a * Math.PI) / 180;
        return (
          <ellipse key={a}
            cx={Math.sin(r) * size * 0.52}
            cy={-Math.cos(r) * size * 0.52 - size * 0.35}
            rx={size * 0.34} ry={size * 0.48}
            transform={`rotate(${a})`}
            fill="#ff8fc4"
          />
        );
      })}
      <circle r={size * 0.2} fill="#ffd966" />
    </g>
  );
}

// 벚꽃 위치 (한강변 + 공원 + 랜드마크)
const BLOSSOMS = [
  // 한강 북쪽 강변
  { x: 258, y: 404, s: 13, r: 20,  o: 0.75 },
  { x: 348, y: 420, s: 10, r: -15, o: 0.65 },
  { x: 440, y: 420, s: 12, r: 30,  o: 0.70 },
  { x: 560, y: 414, s: 10, r: -20, o: 0.60 },
  { x: 680, y: 408, s: 11, r: 15,  o: 0.65 },
  { x: 790, y: 404, s: 9,  r: -10, o: 0.55 },
  // 한강 남쪽
  { x: 320, y: 466, s: 11, r: 25,  o: 0.65 },
  { x: 465, y: 472, s: 10, r: -18, o: 0.60 },
  { x: 610, y: 468, s: 11, r: 12,  o: 0.65 },
  { x: 740, y: 460, s: 9,  r: -25, o: 0.55 },
  // 북쪽 산/공원
  { x: 390, y: 270, s: 11, r: 18,  o: 0.55 },
  { x: 162, y: 174, s: 12, r: -22, o: 0.60 },
  { x: 550, y: 86,  s: 10, r: 10,  o: 0.50 },
  { x: 670, y: 140, s: 11, r: -15, o: 0.55 },
  // 남쪽 공원
  { x: 760, y: 582, s: 10, r: 22,  o: 0.55 },
  { x: 495, y: 612, s: 9,  r: -18, o: 0.50 },
  { x: 310, y: 555, s: 9,  r: 10,  o: 0.48 },
];

export default function SubwayMap({ selectedLine, highlighted }) {
  const activeLine = selectedLine === 'rand' ? null : selectedLine;

  return (
    <svg
      viewBox="80 48 880 650"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 한강 그라디언트 */}
        <linearGradient id="riverG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7dc8f0" stopOpacity="0.55" />
          <stop offset="45%"  stopColor="#5ab8ee" stopOpacity="0.70" />
          <stop offset="100%" stopColor="#7dc8f0" stopOpacity="0.50" />
        </linearGradient>
        {/* 지도 기본 배경 */}
        <linearGradient id="mapBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#18263a" />
          <stop offset="100%" stopColor="#0e1824" />
        </linearGradient>
        {/* 강북 색조 */}
        <linearGradient id="gangbukG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#223048" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a2840" stopOpacity="0.7" />
        </linearGradient>
        {/* 강남 색조 */}
        <linearGradient id="gangnamG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#1e2e44" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#162236" stopOpacity="0.5" />
        </linearGradient>
        {/* 역 글로우 */}
        <filter id="stGlow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* 한강 글로우 */}
        <filter id="rivGlow" x="-5%" y="-50%" width="110%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── 지도 배경 ── */}
      <rect x="60" y="44" width="900" height="668" fill="url(#mapBg)" />

      {/* ── 서울 영역 ── */}
      <path d={SEOUL_BOUNDARY} fill="url(#gangbukG)" />

      {/* ── 강남 영역 (한강 이남, 약간 다른 톤) ── */}
      <path
        d={`M 82,450 C 155,445 228,450 298,457 C 348,463 380,465 418,466 C 472,468 538,466 614,464 C 688,462 745,459 878,452 L 878,655 L 82,655 Z`}
        fill="url(#gangnamG)"
      />

      {/* ── 산/녹지 ── */}
      <path d={MOUNTAIN_N} fill="rgba(45,90,50,0.28)" />
      <path d={MOUNTAIN_S} fill="rgba(45,90,50,0.22)" />

      {/* ── 한강 ── */}
      <path d={HAN_FILL} fill="url(#riverG)" filter="url(#rivGlow)" />
      {/* 강안선 */}
      <path d={HAN_NORTH} fill="none" stroke="rgba(160,230,255,0.5)" strokeWidth="1.2" />
      <path d={HAN_SOUTH} fill="none" stroke="rgba(120,210,255,0.35)" strokeWidth="0.8" />
      {/* 여의도 */}
      <path d={YEOUIDO_ISLAND} fill="rgba(55,115,55,0.30)" stroke="rgba(100,190,100,0.4)" strokeWidth="1" />
      {/* 한강 레이블 */}
      <text x="175" y="435" fill="rgba(155,225,255,0.6)" fontSize="11"
        fontFamily="'Noto Sans KR', sans-serif" fontWeight="700" letterSpacing="4">한 강</text>

      {/* ── 벚꽃 ── */}
      {BLOSSOMS.map((b, i) => (
        <Blossom key={i} x={b.x} y={b.y} size={b.s} rotate={b.r} opacity={b.o} />
      ))}

      {/* ── 노선 선 ── */}
      {Object.entries(LINE_SEGMENTS).map(([lk, segs]) => {
        const color  = LINES[lk].color;
        const active = !activeLine || activeLine === lk;
        return segs.map((seg, si) => (
          <polyline key={`${lk}-${si}`}
            points={buildPoints(lk, seg)}
            fill="none" stroke={color}
            strokeWidth={active ? 2.8 : 1}
            opacity={active ? 0.92 : 0.1}
            strokeLinecap="round" strokeLinejoin="round"
          />
        ));
      })}

      {/* ── 역 dot ── */}
      {Object.entries(LINE_COORDS).map(([lk, stations]) => {
        const color  = LINES[lk].color;
        const active = !activeLine || activeLine === lk;
        return stations.map((s, idx) => {
          const hit = highlighted?.lineKey === lk && highlighted?.stationIdx === idx;
          return (
            <circle key={`${lk}-${idx}`}
              cx={s.x} cy={s.y}
              r={hit ? 10 : active ? 3.5 : 1.5}
              fill={hit ? color : active ? '#cce8ff' : '#253545'}
              stroke={hit ? '#fff' : active ? color : 'none'}
              strokeWidth={hit ? 2.5 : active ? 0.8 : 0}
              opacity={active ? 1 : 0.1}
              style={hit ? { filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}88)` } : undefined}
            />
          );
        });
      })}

      {/* ── 하이라이트 역명 ── */}
      {highlighted && (() => {
        const s     = LINE_COORDS[highlighted.lineKey]?.[highlighted.stationIdx];
        const color = LINES[highlighted.lineKey]?.color;
        if (!s) return null;
        const lw  = s.name.length * 13 + 14;
        const tx  = s.x > 820 ? s.x - lw - 8 : s.x + 14;
        const ty  = s.y > 680 ? s.y - 18 : s.y - 14;
        return (
          <g>
            <rect x={tx - 5} y={ty - 16} width={lw} height={22}
              rx={7} fill="rgba(6,10,20,0.92)" stroke={color} strokeWidth="1.3" />
            <text x={tx} y={ty} fill={color} fontSize="13.5"
              fontFamily="'Noto Sans KR', sans-serif" fontWeight="700"
              style={{ filter: `drop-shadow(0 0 7px ${color})` }}>
              {s.name}역
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
