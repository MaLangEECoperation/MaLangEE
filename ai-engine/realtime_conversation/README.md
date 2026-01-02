# 실시간 대화 모듈 (Real-time Conversation Module)

이 모듈은 '말랭이' 서비스의 핵심 기능인 "실시간 대화" 로직을 담당합니다.
메인 FastAPI 백엔드 서버에 통합되어 작동하도록 설계되었습니다.

## 🎯 **담당 업무 (My Task)**

1.  **WebSocket 연결 관리 (Connection Management)**
    *   백엔드로부터 넘어온 WebSocket 연결 수락.
    *   OpenAI Realtime API와의 보안 WebSocket 연결 수립 및 관리.
    *   **관련 파일:** `connection_handler.py`

2.  **대화 컨텍스트 및 프롬프트 관리 (Context & Prompting)**
    *   초기 시스템 지침(페르소나: "말랭이") 정의 및 관리.
    *   동적 지침 업데이트 처리 (예: 말하기 속도 조절, 주제 전환 등).
    *   세션 파라미터 설정 (음색, VAD 설정 등).
    *   **관련 파일:** `conversation_manager.py`

3.  **오디오 스트림 릴레이 (Audio Stream Relay)**
    *   **Client -> OpenAI**: `audio_append` 이벤트를 효율적으로 전달.
    *   **OpenAI -> Client**: `audio.delta` 및 `transcript` 이벤트를 효율적으로 전달.

## 🚫 **작업 외 범위 (Backend Team's Task)**

*   **FastAPI 라우터 설정**: 실제 URL 엔드포인트 정의 (`/ws/chat`은 테스트용일 뿐임).
*   **인증 (Authentication)**: 이 모듈로 WebSocket을 넘겨주기 전, 사용자 토큰 검증.
*   **데이터베이스 (Database)**: 대화 로그 저장 및 사용자 이력 SQL 저장.
