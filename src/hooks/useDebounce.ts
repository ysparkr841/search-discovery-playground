import { useEffect, useState } from "react";

/**
 * 값이 안정될 때까지 갱신을 지연시키는 디바운스 훅.
 *
 * `value`가 바뀌면 `delay`(ms) 뒤에 반환값이 갱신된다. 지연 시간 안에 값이 다시
 * 바뀌면 이전 타이머는 `clearTimeout`으로 취소되어 마지막 값만 반영된다.
 * (검색어 입력 → 확정 검색어 도출에 사용)
 *
 * @typeParam T 디바운스할 값의 타입.
 * @param value 원본 값(매 입력마다 바뀌는 값).
 * @param delay 지연 시간(ms). 기본 300.
 * @returns `delay`만큼 지연된 안정화 값.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // 다음 effect 실행/언마운트 전에 이전 타이머 취소 (cleanup).
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}
