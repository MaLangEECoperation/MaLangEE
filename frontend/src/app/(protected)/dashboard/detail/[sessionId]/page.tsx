import { ChatDetailPage } from "@/views/dashboard/main/ui/ChatDetailPage";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * 직접 접근 페이지: 대화 상세
 * - URL 직접 입력 시 전체 페이지로 표시
 * - /dashboard/detail/[sessionId]
 */
export default async function DetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <ChatDetailPage sessionId={sessionId} />;
}
