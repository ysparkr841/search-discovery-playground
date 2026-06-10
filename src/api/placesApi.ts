import type { Place } from "../types/place";
import { PLACES } from "../data/places";

/**
 * Mock API — 실제 네트워크 호출을 Promise + setTimeout 으로 흉내 낸다.
 *
 * 설계 결정 (contract):
 * - **반환 shape 은 `Place[]` (배열) 그 자체** 다. 래핑 객체(`{ items: [] }`)가
 *   아니다. 따라서 훅/UI는 응답을 곧바로 `.filter()`/`.sort()` 할 수 있다.
 *   (래핑 vs 배열 혼동으로 인한 `filter is not a function` 류 크래시를 예방)
 * - 서버는 "전체 데이터를 돌려주는" 역할만 한다. 검색어/카테고리/정렬/즐겨찾기
 *   필터링은 클라이언트(usePlaceSearch)에서 수행한다 → TanStack Query 캐싱과 궁합.
 * - 인위적 지연 400~700ms 로 loading 상태를 시연 가능하게 한다.
 */

/** 인위적 네트워크 지연 범위(ms). */
const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 700;

/**
 * 에러 상태 시연용 트리거.
 *
 * `fetchPlaces({ simulateError: true })` 로 호출하면 의도적으로 reject 한다.
 * UI에서는 "에러 발생시키기" 토글/버튼으로 이 플래그를 켜 TanStack Query 의
 * error 상태(`isError`, `error`)를 재현할 수 있다.
 */
export interface FetchPlacesOptions {
  /** true 이면 의도적으로 에러를 발생시킨다 (error 상태 시연용). */
  simulateError?: boolean;
}

/** Mock API 가 reject 시 던지는 에러 타입. `instanceof` 로 식별 가능. */
export class PlacesApiError extends Error {
  constructor(message = "장소 정보를 불러오지 못했습니다.") {
    super(message);
    this.name = "PlacesApiError";
  }
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

/**
 * 전체 장소 목록을 비동기로 반환한다.
 *
 * @param options.simulateError true 이면 지연 후 {@link PlacesApiError} 로 reject.
 * @returns 성공 시 `Place[]` 전체 목록(원본 불변, 방어적 복사본).
 */
export function fetchPlaces(options: FetchPlacesOptions = {}): Promise<Place[]> {
  const { simulateError = false } = options;

  return new Promise<Place[]>((resolve, reject) => {
    setTimeout(() => {
      if (simulateError) {
        reject(new PlacesApiError());
        return;
      }
      // 원본 배열을 보호하기 위해 얕은 복사본을 반환한다.
      resolve([...PLACES]);
    }, randomDelay());
  });
}
