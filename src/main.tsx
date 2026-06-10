import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

/**
 * 앱 부팅 골격 (최소 버전).
 *
 * - Tailwind 엔트리 CSS(`index.css`) import.
 * - `QueryClientProvider` 로 앱 전체를 감싼다.
 *
 * App.tsx 의 실제 화면 조립(검색/필터/정렬/카드)은 integrator 가 담당한다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데모 앱: 윈도우 포커스 시 자동 refetch 비활성화 (의도치 않은 깜빡임 방지).
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element '#root' 를 찾을 수 없습니다.");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
