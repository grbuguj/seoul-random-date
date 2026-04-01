// 슬롯 애니메이션 로직 훅
import { useState } from 'react';

export function useSlot() {
  const [isSpinning, setIsSpinning] = useState(false);

  // TODO: 릴 애니메이션 로직

  return { isSpinning };
}
