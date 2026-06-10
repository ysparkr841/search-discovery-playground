/**
 * 검색어를 공백 기준으로 토큰화한다.
 *
 * 다중 키워드 검색(AND 매칭)과 토큰별 하이라이팅이 공유하는 단일 출처.
 * - 앞뒤 공백 제거 후 연속 공백(`\s+`)으로 분리.
 * - 빈 토큰 제거.
 * - 대소문자 무시로 중복 제거(첫 등장 표기를 보존).
 *
 * @example
 * tokenizeQuery("  강남  카페 ")   // ["강남", "카페"]
 * tokenizeQuery("Cafe cafe")       // ["Cafe"]  (대소문자 무시 중복 제거)
 *
 * @param query 원본 검색어.
 * @returns 정리된 토큰 배열(원본 표기 유지). 빈 검색어면 `[]`.
 */
export function tokenizeQuery(query: string): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const raw of query.trim().split(/\s+/)) {
    if (raw === "") continue;
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push(raw);
  }

  return tokens;
}
