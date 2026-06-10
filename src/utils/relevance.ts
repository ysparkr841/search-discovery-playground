import type { Place } from "../types/place";

/**
 * 장소와 검색 토큰들의 **관련도 점수**를 계산한다(높을수록 관련도 높음).
 *
 * 검색 결과의 "정확도순" 정렬에 쓰인다. 어떤 필드에서 일치했는지에 따라
 * 가중치를 달리해, 이름에 검색어가 있는 장소를 설명에만 있는 장소보다 위로 올린다.
 *
 * 필드 가중치: **name > tag > description**.
 * 같은 필드 안에서도 완전 일치 > 접두사 일치 > 부분 일치 순으로 가산한다.
 * 토큰이 여럿이면 각 토큰의 점수를 합산한다.
 *
 * 전제: 보통 `usePlaceSearch`의 AND 필터를 통과한(모든 토큰을 포함하는) 장소에
 * 대해 호출되므로, 점수 차이는 "어디서 일치했는가"에서 발생한다.
 *
 * @param place  점수를 매길 장소.
 * @param tokens 소문자/원본 무관, 내부에서 소문자로 비교하는 검색 토큰 배열.
 * @returns 관련도 점수(토큰이 없으면 0).
 */
export function scoreRelevance(place: Place, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const name = place.name.toLowerCase();
  const description = place.description.toLowerCase();
  const tags = place.tags.map((t) => t.toLowerCase());

  let score = 0;

  for (const raw of tokens) {
    const token = raw.toLowerCase();

    // name: 완전 100 / 접두사 60 / 부분 40
    if (name === token) score += 100;
    else if (name.startsWith(token)) score += 60;
    else if (name.includes(token)) score += 40;

    // tag: 완전 25 / 부분 15
    if (tags.some((t) => t === token)) score += 25;
    else if (tags.some((t) => t.includes(token))) score += 15;

    // description: 부분 5
    if (description.includes(token)) score += 5;
  }

  return score;
}
