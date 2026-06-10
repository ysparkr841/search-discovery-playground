/**
 * RecentSearches — 최근 검색어 칩 그룹.
 *
 * 순수 컴포넌트. items(최대 5개 표시)와 동작 콜백을 props로 받는다.
 * - 칩 본문 클릭 → onSearchAgain(term)
 * - 칩의 × → onRemove(term)
 * - 전체삭제 → onClearAll()
 */

export interface RecentSearchesProps {
  /** 최근 검색어 목록. 컴포넌트는 앞에서부터 최대 5개만 표시한다. */
  items: string[];
  /** 칩 클릭(재검색) 시 호출. */
  onSearchAgain: (term: string) => void;
  /** 개별 칩 삭제 시 호출. */
  onRemove: (term: string) => void;
  /** 전체 삭제 시 호출. */
  onClearAll: () => void;
}

const MAX_ITEMS = 5;

export default function RecentSearches({
  items,
  onSearchAgain,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  const visible = items.slice(0, MAX_ITEMS);
  if (visible.length === 0) return null;

  return (
    <section aria-label="최근 검색어" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-caption font-semibold text-ink-secondary">최근 검색어</h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-caption text-ink-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        >
          전체삭제
        </button>
      </div>

      <ul className="flex flex-wrap gap-2">
        {visible.map((term) => (
          <li key={term}>
            <div
              className={[
                "inline-flex items-center gap-1 rounded-chip bg-surface-muted pl-3 pr-1.5 py-1.5",
                "border border-transparent transition-colors hover:border-border-strong",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => onSearchAgain(term)}
                aria-label={`${term} 다시 검색`}
                className="max-w-[10rem] truncate text-caption text-ink-secondary focus-visible:outline-none focus-visible:underline"
              >
                {term}
              </button>
              <button
                type="button"
                onClick={() => onRemove(term)}
                aria-label={`최근 검색어 ${term} 삭제`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <svg
                  viewBox="0 0 24 24"
                  width={12}
                  height={12}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
