import type { Place, SortKey } from "../types/place";

/**
 * 장소 배열을 정렬 키에 따라 정렬한다. **원본은 변경하지 않는다**(복사 후 정렬).
 *
 * - `accuracy`  : 정확도순(기본값). 별도 점수가 없으므로 입력 순서를 그대로 유지한다.
 *                 (정확도는 usePlaceSearch 의 검색어 필터링 단계에서 이미 반영됨)
 * - `latest`    : 최신순. `updatedAt`(ISO 8601) 내림차순.
 * - `distance`  : 거리순. `distance`(meter) 오름차순.
 * - `rating`    : 평점순. `rating` 내림차순.
 *
 * @param places 정렬 대상 배열.
 * @param key    정렬 키.
 * @returns 정렬된 **새 배열**.
 */
export function sortPlaces(places: Place[], key: SortKey): Place[] {
  const copy = [...places];

  switch (key) {
    case "latest":
      // updatedAt 내림차순. ISO 8601 문자열은 사전식 비교로 시간순과 일치.
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "distance":
      return copy.sort((a, b) => a.distance - b.distance);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "accuracy":
    default:
      // 정확도순: 입력 순서(= 관련도/원본 순서) 유지.
      return copy;
  }
}
