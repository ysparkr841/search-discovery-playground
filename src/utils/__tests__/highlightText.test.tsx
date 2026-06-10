import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { highlightText } from "../highlightText";

/** ReactNode를 정적 HTML 문자열로 렌더해 검증을 단순화한다(DOM 불필요). */
function toHtml(node: ReactNode): string {
  return renderToStaticMarkup(<>{node}</>);
}

describe("highlightText", () => {
  it("빈 검색어면 원문을 그대로 반환한다", () => {
    expect(toHtml(highlightText("서울역", ""))).toBe("서울역");
    expect(toHtml(highlightText("서울역", "   "))).toBe("서울역");
  });

  it("일치 구간을 <mark>로 강조한다", () => {
    expect(toHtml(highlightText("서울역", "서울"))).toBe("<mark>서울</mark>역");
  });

  it("공백으로 나뉜 여러 키워드를 각각 강조한다", () => {
    const html = toHtml(highlightText("강남 카페거리", "강남 카페"));
    expect(html).toContain("<mark>강남</mark>");
    expect(html).toContain("<mark>카페</mark>");
  });

  it("대소문자를 무시하고 강조한다", () => {
    expect(toHtml(highlightText("Cafe Latte", "cafe"))).toBe(
      "<mark>Cafe</mark> Latte",
    );
  });

  it("정규식 특수문자가 포함돼도 안전하게 그대로 강조한다", () => {
    // "(b)" 가 정규식으로 해석되면 크래시하거나 잘못 매칭된다 → 이스케이프 검증.
    expect(toHtml(highlightText("a (b) c", "(b)"))).toBe("a <mark>(b)</mark> c");
  });

  it("일치하는 구간이 없으면 강조 없이 원문을 렌더한다", () => {
    expect(toHtml(highlightText("서울역", "부산"))).toBe("서울역");
  });
});
