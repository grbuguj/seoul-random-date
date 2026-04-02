// 역별 운세 텍스트 — 역명 해시로 결정적 pick (같은 역 = 항상 같은 운세)

const FORTUNES = [
  { text: "오늘 이 역에서 운명의 인연을 만날 확률", percent: "87%" },
  { text: "이 역 골목 카페에서 첫눈에 반할 예감", percent: "92%" },
  { text: "이 역 근처 맛집에서 인생 메뉴 발견 가능성", percent: "78%" },
  { text: "오늘 이 역 주변을 걷다 보면 사진이 잘 나올 확률", percent: "95%" },
  { text: "이 역에서 시작한 데이트가 둘만의 단골 장소가 될 확률", percent: "81%" },
  { text: "이 역 근처 야경이 오늘따라 유독 예뻐 보일 확률", percent: "89%" },
  { text: "이 역 주변에서 서로 손 잡고 싶어질 확률", percent: "93%" },
  { text: "이 역이 훗날 '그때 거기 갔었잖아' 추억 장소가 될 확률", percent: "76%" },
  { text: "이 역 근처 디저트 카페에서 사진 100장 찍을 확률", percent: "88%" },
  { text: "이 역에서 내리자마자 '여기 좋다!' 소리 나올 확률", percent: "84%" },
  { text: "이 역 골목에서 보물 같은 빈티지샵 발견 확률", percent: "71%" },
  { text: "이 역 주변 공원에서 벤치 찾아 한참 앉아있을 확률", percent: "90%" },
  { text: "이 역 맛집 웨이팅 중 더 가까워질 확률", percent: "96%" },
  { text: "이 역 근처에서 다음 데이트 약속도 잡힐 확률", percent: "82%" },
  { text: "이 역이 여러분의 '우리 역'이 될 확률", percent: "77%" },
  { text: "이 역 주변 야외 테라스에서 노을 같이 볼 확률", percent: "85%" },
  { text: "이 역 편의점 앞에서 아이스크림 먹으며 걸을 확률", percent: "91%" },
  { text: "이 역에서 길을 잃어 예상치 못한 명소 발견 확률", percent: "74%" },
  { text: "이 역 근처 책방에서 같은 책 좋아하는 거 발견 확률", percent: "68%" },
  { text: "이 역이 평생 기억에 남는 데이트 장소가 될 확률", percent: "83%" },
];

/**
 * 역명 기반 결정적 운세 pick
 * 같은 역은 항상 같은 운세가 나옴
 */
export function getFortune(stationName) {
  const hash = stationName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FORTUNES[hash % FORTUNES.length];
}
