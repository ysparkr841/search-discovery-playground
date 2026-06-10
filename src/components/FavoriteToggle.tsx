/**
 * FavoriteToggle — 즐겨찾기(하트) 토글 버튼.
 *
 * 순수 프리젠테이션. 상태는 `active`로 받고, 토글 동작은 `onToggle` 콜백으로 위임한다.
 * 아이콘 전용 버튼이므로 `aria-label` / `aria-pressed`로 접근성을 보장한다.
 */

export interface FavoriteToggleProps {
  /** 현재 즐겨찾기 여부. true면 오렌지 채움 하트. */
  active: boolean;
  /** 토글 클릭 시 호출. (id 전달은 상위 컴포넌트 책임) */
  onToggle: () => void;
  /** 접근성 라벨 보조용 장소명(선택). 지정 시 "{name} 즐겨찾기" 형태로 라벨 구성. */
  label?: string;
  /** 버튼 크기 (px). 기본 36. */
  size?: number;
}

export default function FavoriteToggle({
  active,
  onToggle,
  label,
  size = 36,
}: FavoriteToggleProps) {
  const ariaLabel = label
    ? `${label} 즐겨찾기 ${active ? "해제" : "추가"}`
    : `즐겨찾기 ${active ? "해제" : "추가"}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={active}
      title={ariaLabel}
      style={{ width: size, height: size }}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        active
          ? "text-primary hover:bg-primary-soft"
          : "text-ink-muted hover:bg-surface-muted hover:text-primary",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.58}
        height={size * 0.58}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-6.716-4.297-9.193-7.07C.86 11.79.86 8.79 2.81 7.05A5 5 0 0 1 12 8.09 5 5 0 0 1 21.19 7.05c1.95 1.74 1.95 4.74-.003 6.88C18.716 16.703 12 21 12 21z" />
      </svg>
    </button>
  );
}
