/**
 * SearchBar — 검색 입력창.
 *
 * 순수 컴포넌트. 입력값은 `value`로 받고 변경은 raw value 그대로 `onChange`로 올린다.
 * **디바운스는 여기서 하지 않는다**(훅 책임). 검색 아이콘 + 클리어(×) 버튼 포함.
 */

export interface SearchBarProps {
  /** 현재 입력값(제어 컴포넌트). */
  value: string;
  /** 입력 변경 시 raw value를 그대로 전달. */
  onChange: (value: string) => void;
  /** placeholder 문구(선택). */
  placeholder?: string;
  /** 접근성 라벨(선택). 기본 "장소 검색". */
  ariaLabel?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "장소, 카테고리, 태그로 검색",
  ariaLabel = "장소 검색",
}: SearchBarProps) {
  const hasValue = value.length > 0;

  return (
    <div className="group relative flex items-center">
      {/* 검색 아이콘 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 text-ink-muted transition-colors group-focus-within:text-primary"
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        type="search"
        inputMode="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={[
          "h-12 w-full rounded-card bg-surface-muted pl-12 pr-11 text-body text-ink",
          "placeholder:text-ink-muted",
          "border border-transparent transition-colors",
          "focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30",
          "[&::-webkit-search-cancel-button]:appearance-none",
        ].join(" ")}
      />

      {/* 클리어 버튼 */}
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className={[
            "absolute right-3 inline-flex h-7 w-7 items-center justify-center rounded-full",
            "text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          ].join(" ")}
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
