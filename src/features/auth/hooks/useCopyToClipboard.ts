import { useCallback, useEffect, useRef, useState } from 'react';

// 복사 후 일정 시간 동안 "복사됨" 상태를 유지
export const useCopyToClipboard = <K extends string>(resetMs = 2000) => {
  const [copiedKey, setCopiedKey] = useState<K | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (key: K, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // 클립보드 권한이 없는 환경(비보안 컨텍스트 등)에서는 표시만 갱신
      }
      setCopiedKey(key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedKey(null), resetMs);
    },
    [resetMs],
  );

  return { copiedKey, copy };
};
