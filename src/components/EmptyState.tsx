/**
 * EmptyState — 검색/필터 결과가 없을 때의 안내 화면.
 *
 * 차분한 톤. 문구는 계약상 고정 문자열을 기본값으로 가지되, 필요 시 override 가능.
 */

export interface EmptyStateProps {
  /** 안내 문구 override(선택). 미지정 시 기본 문구 사용. */
  message?: string;
}

const DEFAULT_MESSAGE =
  "조건에 맞는 결과가 없습니다. 검색어를 줄이거나 필터를 변경해보세요.";

export default function EmptyState({ message = DEFAULT_MESSAGE }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-ink-muted"
      >
        <svg
          viewBox="0 0 24 24"
          width={32}
          height={32}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="max-w-xs text-body text-ink-secondary">{message}</p>
    </div>
  );
}
