import type { ReactNode } from "react";

import { tokenizeQuery } from "./tokenize";

/**
 * 정규식 특수문자를 이스케이프한다.
 * 사용자 입력(예: `(`, `[`, `*`)이 정규식을 깨뜨려 크래시하는 것을 방지한다.
 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * `text` 안에서 `query`의 각 키워드와 일치하는 모든 구간을 `<mark>`로 강조한 ReactNode 를 반환한다.
 *
 * - `query`가 비었거나 공백뿐이면 원문 텍스트를 그대로 반환한다.
 * - 공백으로 나뉜 **여러 키워드를 각각** 강조한다(예: "강남 카페" → "강남"과 "카페" 모두).
 * - 대소문자 무시(`i` 플래그), 다중 일치 처리(`g` 플래그).
 * - 정규식 특수문자는 이스케이프되어 안전하다.
 *
 * @param text  원문 텍스트.
 * @param query 강조할 검색어(공백 구분 다중 키워드 허용).
 * @returns 강조가 적용된 ReactNode(일치 없으면 원문 문자열).
 */
export function highlightText(text: string, query: string): ReactNode {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return text;
  }

  // 토큰들을 OR(`|`)로 묶어 한 번에 매칭한다. 각 토큰은 개별 이스케이프.
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  // 캡처 그룹이 하나이므로 split 결과는 [비일치, 일치, 비일치, 일치, ...] 순서다.
  // 일치 조각(홀수 인덱스)만 <mark>로 감싼다.
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    ),
  );
}
