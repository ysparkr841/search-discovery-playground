import type { Place, SortKey } from "../types/place";
import { scoreRelevance } from "./relevance";
import { tokenizeQuery } from "./tokenize";

/**
 * 장소 배열을 정렬 키에 따라 정렬한다. **원본은 변경하지 않는다**(복사 후 정렬).
 *
 * - `accuracy`  : 정확도순(기본값). 검색어가 있으면 {@link scoreRelevance} 점수
 *                 내림차순으로 정렬해 관련도를 반영한다(동점은 평점, 그다음 원래 순서).
 *                 검색어가 없으면 입력 순서를 그대로 유지한다.
 * - `latest`    : 최신순. `updatedAt`(ISO 8601) 내림차순.
 * - `distance`  : 거리순. `distance`(meter) 오름차순.
 * - `rating`    : 평점순. `rating` 내림차순.
 *
 * @param places 정렬 대상 배열.
 * @param key    정렬 키.
 * @param query  정확도순 관련도 계산에 쓰는 검색어(다른 키에서는 무시). 기본 "".
 * @returns 정렬된 **새 배열**.
 */
export function sortPlaces(places: Place[], key: SortKey, query = ""): Place[] {
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
    default: {
      const tokens = tokenizeQuery(query);
      // 검색어가 없으면 관련도 기준이 없으므로 입력 순서를 유지한다.
      if (tokens.length === 0) return copy;

      // 안정 정렬: 점수 내림차순 → 평점 내림차순 → 원래 순서(index) 보존.
      return copy
        .map((place, index) => ({
          place,
          index,
          score: scoreRelevance(place, tokens),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.place.rating - a.place.rating ||
            a.index - b.index,
        )
        .map((entry) => entry.place);
    }
  }
}
