import { describe, expect, it } from "vitest";

import { tokenizeQuery } from "../tokenize";

describe("tokenizeQuery", () => {
  it("앞뒤·중간 공백을 정리해 토큰으로 분리한다", () => {
    expect(tokenizeQuery("  강남  카페 ")).toEqual(["강남", "카페"]);
  });

  it("대소문자를 무시해 중복을 제거하고 첫 표기를 보존한다", () => {
    expect(tokenizeQuery("Cafe cafe CAFE")).toEqual(["Cafe"]);
  });

  it("빈 문자열과 공백만 있는 입력은 빈 배열을 반환한다", () => {
    expect(tokenizeQuery("")).toEqual([]);
    expect(tokenizeQuery("    ")).toEqual([]);
  });

  it("단일 키워드는 그대로 반환한다", () => {
    expect(tokenizeQuery("스시")).toEqual(["스시"]);
  });
});
