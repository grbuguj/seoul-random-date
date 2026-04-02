/**
 * 커플 이름 기반 운세 텍스트
 * hash(nameA + nameB + station) % FORTUNES.length 로 결정적 pick
 */

// {a} = 이름A, {b} = 이름B, {s} = 역명
const COUPLE_FORTUNES = [
  { text: "{a}이(가) {b}에게 {s}역 카페에서 아메리카노 쏠 확률",   percent: "94%" },
  { text: "{a}이(가) {b} 손 먼저 잡을 확률",                       percent: "88%" },
  { text: "{b}이(가) {a}한테 {s}역 맛집 웨이팅 중 고백할 확률",    percent: "73%" },
  { text: "{a}랑 {b}가 {s}역 편의점에서 아이스크림 사먹을 확률",   percent: "97%" },
  { text: "{b}이(가) {s}역 골목에서 {a}한테 커피 사줄 확률",       percent: "81%" },
  { text: "{a}이(가) {b} 사진 찍어주다가 100장 넘길 확률",          percent: "92%" },
  { text: "{b}이(가) {s}역 근처 디저트 카페 예약해놨을 확률",       percent: "67%" },
  { text: "{a}랑 {b}가 {s}역에서 길 잃고 더 재미있어질 확률",      percent: "85%" },
  { text: "{b}이(가) {a}한테 오늘 데이트 최고라고 말할 확률",       percent: "91%" },
  { text: "{a}이(가) {s}역 뷰 맛집 찾아서 {b} 깜짝 놀라게 할 확률", percent: "78%" },
  { text: "{a}랑 {b}가 {s}역 노을 보며 다음 약속 잡을 확률",       percent: "83%" },
  { text: "{b}이(가) {a} 위해 {s}역 근처 꽃 한 송이 살 확률",      percent: "62%" },
  { text: "{a}이(가) {b}한테 {s}역이 '우리 역'이라고 선언할 확률", percent: "76%" },
  { text: "{a}랑 {b}가 오늘 데이트 사진 SNS에 올릴 확률",          percent: "89%" },
  { text: "{b}이(가) {a}한테 '다음엔 어디 갈까?' 물어볼 확률",     percent: "96%" },
  { text: "{a}이(가) {s}역 맛집에서 {b} 먹방 영상 찍어줄 확률",    percent: "71%" },
  { text: "{b}이(가) {a}한테 오늘 고백하거나 고백받을 확률",        percent: "58%" },
  { text: "{a}랑 {b}가 {s}역 근처에서 커플템 구매할 확률",         percent: "69%" },
  { text: "{a}이(가) {b} 위해 {s}역에서 깜짝 이벤트 준비할 확률",  percent: "54%" },
  { text: "{a}랑 {b}가 오늘 데이트 후 더 가까워질 확률",           percent: "99%" },
];

export function getCouplefortune(nameA, nameB, station) {
  const hash = (nameA + nameB + station)
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const raw = COUPLE_FORTUNES[hash % COUPLE_FORTUNES.length];

  // {a}, {b}, {s} 치환
  const text = raw.text
    .replace(/{a}/g, nameA)
    .replace(/{b}/g, nameB)
    .replace(/{s}/g, station);

  return { text, percent: raw.percent };
}

/** 이름 두 개 기반 궁합 점수 (결정적) */
export function getCompatibilityScore(nameA, nameB) {
  const hash = (nameA + nameB)
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // 55 ~ 99 사이
  return 55 + (hash % 45);
}
