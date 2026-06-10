import { useCallback, useEffect, useState } from "react";

/**
 * LocalStorage 키 문자열의 단일 출처.
 *
 * 저장/조회 시 키 오타로 인한 경계면 버그를 막기 위해 한 곳에 모은다.
 * - `RECENT_QUERIES` : 최근 검색어 (`string[]`)
 * - `FAVORITE_IDS`   : 즐겨찾기한 장소 id (`number[]`)
 */
export const STORAGE_KEYS = {
  RECENT_QUERIES: "sdp:recent-queries",
  FAVORITE_IDS: "sdp:favorite-ids",
} as const;

/** setState와 동일한 형태의 갱신자(값 또는 함수형 업데이트)를 받는 setter. */
type SetValue<T> = (value: T | ((prev: T) => T)) => void;

function readFromStorage<T>(key: string, initial: T): T {
  if (typeof window === "undefined") {
    return initial;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return initial;
    }
    return JSON.parse(raw) as T;
  } catch {
    // 파싱 실패(손상된 값 등)는 초기값으로 안전하게 폴백한다.
    return initial;
  }
}

/**
 * 제네릭 LocalStorage 동기화 훅.
 *
 * 최근 검색어(`string[]`)와 즐겨찾기(`number[]`) 양쪽에 재사용된다.
 * 초기 마운트 시 LocalStorage 를 읽어(try/catch 파싱 방어) 초기값으로 사용하고,
 * 값이 바뀔 때마다 직렬화해 저장한다. 함수형 업데이트를 지원한다.
 *
 * @typeParam T 저장할 값의 타입(JSON 직렬화 가능해야 함).
 * @param key  STORAGE_KEYS 의 값 같은 LocalStorage 키.
 * @param initial 저장된 값이 없을 때 사용할 초기값.
 * @returns `[value, setValue]` 튜플. setValue 는 값 또는 `(prev) => next` 함수를 받는다.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, SetValue<T>] {
  const [value, setValueState] = useState<T>(() => readFromStorage(key, initial));

  const setValue = useCallback<SetValue<T>>((next) => {
    setValueState((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패(쿼터 초과 등)는 무시 — 메모리 상태는 정상 동작한다.
    }
  }, [key, value]);

  return [value, setValue];
}
