import { ChatTranscriptPage } from "@/views/dashboard/main/ui/ChatTranscriptPage";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * 직접 접근 페이지: 전문 스크립트
 * - URL 직접 입력 시 전체 페이지로 표시
 * - /dashboard/transcript/[sessionId]
 */
export default async function TranscriptPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <ChatTranscriptPage sessionId={sessionId} />;
}
