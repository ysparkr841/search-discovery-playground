/**
 * CategoryFilter — 카테고리 칩 그룹(전체 + 5종).
 *
 * 라벨/순서는 계약(`src/types/place.ts`)의 단일 출처에서만 가져온다(하드코딩 금지).
 * 선택값은 `value`, 변경은 `onChange`로 위임. 선택 칩은 오렌지로 강조.
 */
import {
  CATEGORY_FILTER_ORDER,
  CATEGORY_LABELS,
  type CategoryFilter as CategoryFilterValue,
} from "../types/place";

export interface CategoryFilterProps {
  /** 현재 선택된 카테고리 필터. */
  value: CategoryFilterValue;
  /** 칩 선택 시 호출. */
  onChange: (value: CategoryFilterValue) => void;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="카테고리 필터"
      className="flex flex-wrap gap-2 overflow-x-auto"
    >
      {CATEGORY_FILTER_ORDER.map((cat) => {
        const selected = cat === value;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={selected}
            className={[
              "h-9 shrink-0 rounded-chip px-4 text-caption font-medium",
              "border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              selected
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-muted",
            ].join(" ")}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
