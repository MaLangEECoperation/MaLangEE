"use client";

import Link from "next/link";

export default function WebSocketTestIndexPage() {
  return (
    <div className={`main-page glass-page relative min-h-screen w-full overflow-hidden `}>
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">WebSocket Test Console</h1>
            <p className="mt-2 text-gray-600">테스트할 모드를 선택하세요</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/ws-test/conversation-new"
              className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                  대화하기 (Conversation)
                </h2>
                <p className="text-sm text-gray-500">실시간 프리토킹 대화 테스트</p>
              </div>
              <span className="text-2xl transition-transform group-hover:scale-110">💬</span>
            </Link>

            <Link
              href="/ws-test/scenario-new"
              className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-green-500 hover:bg-green-50 hover:shadow-md"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700">
                  주제 정하기 (Scenario)
                </h2>
                <p className="text-sm text-gray-500">시나리오 생성 및 설정 테스트</p>
              </div>
              <span className="text-2xl transition-transform group-hover:scale-110">📝</span>
            </Link>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
            <p>MaLangEE WebSocket Test Suite</p>
          </div>
        </div>
      </div>
    </div>
  );
}
