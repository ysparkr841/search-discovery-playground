/**
 * SortSelect — 정렬 기준 셀렉트(정확도/최신/거리/평점).
 *
 * 옵션 라벨/순서는 계약의 SORT_ORDER + SORT_LABELS 단일 출처 사용(하드코딩 금지).
 * 값은 `value: SortKey`, 변경은 `onChange`로 위임.
 */
import { SORT_LABELS, SORT_ORDER, type SortKey } from "../types/place";

export interface SortSelectProps {
  /** 현재 정렬 키. */
  value: SortKey;
  /** 정렬 변경 시 호출. */
  onChange: (value: SortKey) => void;
  /** 접근성 라벨(선택). 기본 "정렬 기준". */
  ariaLabel?: string;
}

export default function SortSelect({
  value,
  onChange,
  ariaLabel = "정렬 기준",
}: SortSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        aria-label={ariaLabel}
        className={[
          "h-9 appearance-none rounded-chip bg-surface-muted pl-3.5 pr-9 text-caption font-medium text-ink-secondary",
          "border border-transparent transition-colors",
          "hover:bg-surface-sunken",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          "cursor-pointer",
        ].join(" ")}
      >
        {SORT_ORDER.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
      {/* chevron */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-ink-muted"
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
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}
