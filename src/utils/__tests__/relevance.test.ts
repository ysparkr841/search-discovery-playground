import { describe, expect, it } from "vitest";

import type { Place } from "../../types/place";
import { scoreRelevance } from "../relevance";

/** 테스트용 Place 생성 헬퍼. 필요한 필드만 덮어쓴다. */
function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 1,
    name: "기본 장소",
    category: "cafe",
    description: "설명",
    distance: 100,
    rating: 4.0,
    updatedAt: "2026-01-01T00:00:00.000Z",
    tags: [],
    ...overrides,
  };
}

describe("scoreRelevance", () => {
  it("토큰이 없으면 0점이다", () => {
    expect(scoreRelevance(makePlace(), [])).toBe(0);
  });

  it("이름 일치가 설명 일치보다 높은 점수를 받는다", () => {
    const inName = makePlace({ name: "스시집", description: "맛있는 곳" });
    const inDesc = makePlace({ name: "김밥천국", description: "스시도 판다" });
    expect(scoreRelevance(inName, ["스시"])).toBeGreaterThan(
      scoreRelevance(inDesc, ["스시"]),
    );
  });

  it("이름 완전 일치 > 접두사 일치 > 부분 일치 순으로 점수가 높다", () => {
    const exact = makePlace({ name: "스시" });
    const prefix = makePlace({ name: "스시오마카세" });
    const partial = makePlace({ name: "오마카세스시야" });
    const exactScore = scoreRelevance(exact, ["스시"]);
    const prefixScore = scoreRelevance(prefix, ["스시"]);
    const partialScore = scoreRelevance(partial, ["스시"]);
    expect(exactScore).toBeGreaterThan(prefixScore);
    expect(prefixScore).toBeGreaterThan(partialScore);
  });

  it("태그 일치가 설명 일치보다 높은 점수를 받는다", () => {
    const inTag = makePlace({ name: "어떤곳", tags: ["스시"] });
    const inDesc = makePlace({ name: "어떤곳", description: "스시 맛집" });
    expect(scoreRelevance(inTag, ["스시"])).toBeGreaterThan(
      scoreRelevance(inDesc, ["스시"]),
    );
  });

  it("여러 토큰의 점수를 합산한다", () => {
    const place = makePlace({ name: "강남 스시" });
    const single = scoreRelevance(place, ["강남"]);
    const multi = scoreRelevance(place, ["강남", "스시"]);
    expect(multi).toBeGreaterThan(single);
  });

  it("대소문자를 무시한다", () => {
    const place = makePlace({ name: "Cafe Latte" });
    expect(scoreRelevance(place, ["cafe"])).toBe(
      scoreRelevance(place, ["CAFE"]),
    );
  });
});
