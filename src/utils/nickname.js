// 랜덤 닉네임 생성 — localStorage에 저장해서 재방문 시 유지

const ADJ = [
  '졸린', '배고픈', '행복한', '설레는', '귀여운',
  '수줍은', '신난', '따뜻한', '두근두근', '반짝이는',
  '달콤한', '용감한', '느긋한', '활발한', '로맨틱한',
];

const ANIMALS = [
  '다람쥐', '고양이', '펭귄', '토끼', '강아지',
  '곰돌이', '여우', '코알라', '햄스터', '수달',
  '판다', '오리', '고슴도치', '미어캣', '알파카',
];

const STORAGE_KEY = 'seoul-date-nickname';

export function generateNickname() {
  const adj    = ADJ[Math.floor(Math.random() * ADJ.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return adj + animal;
}

export function getOrCreateNickname() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    const fresh = generateNickname();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return generateNickname(); // 프라이빗 브라우징 등 localStorage 불가 시 fallback
  }
}
