import { describe, expect, it } from "vitest";

import type { Place } from "../../types/place";
import { sortPlaces } from "../sortPlaces";

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 1,
    name: "장소",
    category: "cafe",
    description: "설명",
    distance: 100,
    rating: 4.0,
    updatedAt: "2026-01-01T00:00:00.000Z",
    tags: [],
    ...overrides,
  };
}

const a = makePlace({ id: 1, name: "A", distance: 300, rating: 3.0, updatedAt: "2026-01-01T00:00:00.000Z" });
const b = makePlace({ id: 2, name: "B", distance: 100, rating: 5.0, updatedAt: "2026-06-01T00:00:00.000Z" });
const c = makePlace({ id: 3, name: "C", distance: 200, rating: 4.0, updatedAt: "2026-03-01T00:00:00.000Z" });
const input = [a, b, c];

const ids = (places: Place[]) => places.map((p) => p.id);

describe("sortPlaces", () => {
  it("거리순(distance)은 오름차순으로 정렬한다", () => {
    expect(ids(sortPlaces(input, "distance"))).toEqual([2, 3, 1]);
  });

  it("평점순(rating)은 내림차순으로 정렬한다", () => {
    expect(ids(sortPlaces(input, "rating"))).toEqual([2, 3, 1]);
  });

  it("최신순(latest)은 updatedAt 내림차순으로 정렬한다", () => {
    expect(ids(sortPlaces(input, "latest"))).toEqual([2, 3, 1]);
  });

  it("정확도순(accuracy)은 검색어가 없으면 입력 순서를 유지한다", () => {
    expect(ids(sortPlaces(input, "accuracy"))).toEqual([1, 2, 3]);
  });

  it("정확도순은 검색어가 있으면 관련도 높은 순으로 정렬한다", () => {
    const inName = makePlace({ id: 10, name: "스시야", description: "설명" });
    const inDesc = makePlace({ id: 11, name: "분식집", description: "스시도 있음" });
    // 입력은 설명 일치가 먼저지만, 이름 일치가 더 관련도 높아 앞으로 와야 한다.
    const sorted = sortPlaces([inDesc, inName], "accuracy", "스시");
    expect(ids(sorted)).toEqual([10, 11]);
  });

  it("원본 배열을 변경하지 않는다(불변)", () => {
    const original = [...input];
    sortPlaces(input, "rating");
    expect(input).toEqual(original);
  });

  it("새 배열을 반환한다", () => {
    expect(sortPlaces(input, "accuracy")).not.toBe(input);
  });
});
