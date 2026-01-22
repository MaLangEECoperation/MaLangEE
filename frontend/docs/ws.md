@router.websocket("/ws/chat")

_async_ _def_ websocket_chat(

_websocket_: WebSocket,

# token은 get_current_user_ws 내부에서 처리됨

_user_: models.User = Depends(deps.get_current_user_ws),

_session_id_: _str_ = Query(None, _description_="세션 ID"),

):

"""

실시간 대화 WebSocket 엔드포인트

ws://49.50.137.35:8080/api/v1/chat/ws/chat

- token: 쿼리 파라미터로 JWT 토큰 전달 필요 (deps.get_current_user_ws에서 처리)

- session_id: 세션 ID 전달

"""

# 세션 아이디는 사용자와 단계별 대화를 통한 주제를 정할때 생성됨

---

@router.websocket("/ws/guest-chat")

_async_ _def_ websocket_guest_chat(

_websocket_: WebSocket,

):

"""

실시간 대화 WebSocket 엔드포인트 (게스트용, 인증 없음)

ws://49.50.137.35:8080/api/v1/chat/ws/guest-chat

"""

await websocket.accept()

# AI 세션 시작 (user_id=None)

await chat*service.start_ai_session(websocket, \_user_id*=None, _session_id_=None)
