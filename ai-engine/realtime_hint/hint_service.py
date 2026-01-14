"""
hint_service.py - 실시간 대화 힌트 생성 서비스

[역할]
영어 학습 대화 중 사용자가 막힐 때 다음 발화 힌트를 생성합니다.

[주요 기능]
대화 맥락과 시나리오 컨텍스트를 받아 적절한 응답 힌트 3개 생성
"""

import json
import logging

from app.core.config import settings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an English conversation tutor helping a Korean learner practice English.

Based on the conversation context, suggest 3 natural English responses the learner could say next.

Guidelines:
- Suggestions should be appropriate for the conversation flow
- Vary the difficulty: 1 simple, 1 intermediate, 1 advanced
- Keep responses concise (1-2 sentences each)
- Make them sound natural, not textbook-like

{scenario_context}

Output format (JSON array only, no explanation):
["response 1", "response 2", "response 3"]
"""

USER_PROMPT = """Recent conversation:
{conversation}

Suggest 3 possible responses for the learner:"""


def _format_conversation(messages: list[dict]) -> str:
    """메시지 리스트를 대화 형식으로 변환"""
    lines = []
    for msg in messages:
        role = "Learner" if msg.get("role") == "user" else "Tutor"
        content = msg.get("content", "")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _format_scenario_context(context: dict | None) -> str:
    """시나리오 컨텍스트를 프롬프트용 문자열로 변환"""
    if not context:
        return ""

    parts = []
    if context.get("title"):
        parts.append(f"Topic: {context['title']}")
    if context.get("place"):
        parts.append(f"Place: {context['place']}")
    if context.get("partner"):
        parts.append(f"Speaking with: {context['partner']}")
    if context.get("goal"):
        parts.append(f"Goal: {context['goal']}")

    if parts:
        return "Scenario context:\n" + "\n".join(parts)
    return ""


def generate_hints(messages: list[dict], context: dict | None = None) -> list[str]:
    """
    대화 맥락을 받아 힌트 3개를 생성합니다.

    Args:
        messages: [{"role": "user"|"assistant", "content": "..."}] 형식의 리스트
        context: {"title", "place", "partner", "goal"} 시나리오 정보 (선택)

    Returns:
        ["힌트1", "힌트2", "힌트3"] 형식의 리스트
    """
    logger.info(f"힌트 생성 시작 - 메시지 {len(messages)}개")

    if not messages:
        logger.info("대화 내용 없음")
        return []

    try:
        llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7, api_key=settings.OPENAI_API_KEY)

        prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("user", USER_PROMPT)])

        chain = prompt | llm | StrOutputParser()

        conversation_text = _format_conversation(messages)
        scenario_context = _format_scenario_context(context)

        logger.info("LLM 호출 중...")
        result = chain.invoke({"conversation": conversation_text, "scenario_context": scenario_context})

        # JSON 파싱
        hints = json.loads(result)

        if isinstance(hints, list) and len(hints) > 0:
            logger.info(f"힌트 {len(hints)}개 생성 완료")
            return hints[:3]  # 최대 3개

        logger.warning("LLM 응답 파싱 실패, 빈 리스트 반환")
        return []

    except json.JSONDecodeError as e:
        logger.error(f"JSON 파싱 오류: {e}")
        return []
    except Exception as e:
        logger.error(f"힌트 생성 오류: {e}")
        return []
