import { ChatDetailModal } from "@/views/dashboard/main/ui/ChatDetailModal";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * Intercepted Route: 대화 상세 모달
 * - Dashboard에서 세션 클릭 시 모달로 표시
 * - 소프트 네비게이션 유지
 */
export default async function DetailModalPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <ChatDetailModal sessionId={sessionId} />;
}
