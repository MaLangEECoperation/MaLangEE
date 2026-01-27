import { ChatTranscriptModal } from "@/views/dashboard/main/ui/ChatTranscriptModal";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * Intercepted Route: 전문 스크립트 모달
 * - Detail 모달에서 전문보기 클릭 시 모달로 표시
 * - 소프트 네비게이션 유지
 */
export default async function TranscriptModalPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <ChatTranscriptModal sessionId={sessionId} />;
}
