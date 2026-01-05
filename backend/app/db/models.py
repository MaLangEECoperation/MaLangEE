from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class ConversationSession(Base):
    """대화 세션 테이블"""
    __tablename__ = "conversation_sessions"

    session_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=True)
    started_at = Column(String, nullable=False)
    ended_at = Column(String, nullable=False)
    
    total_duration_sec = Column(Float, default=0.0)
    user_speech_duration_sec = Column(Float, default=0.0)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    """개별 메시지 테이블"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("conversation_sessions.session_id"), nullable=False, index=True)
    
    role = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    duration_sec = Column(Float, default=0.0)

    session = relationship("ConversationSession", back_populates="messages")
