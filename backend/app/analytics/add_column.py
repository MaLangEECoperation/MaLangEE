
import sys
import os
import argparse
import asyncio
from sqlalchemy import text
from dotenv import load_dotenv

# [CRITICAL] Path Setup & Conflict Prevention
# ai-engine/app.py가 import되는 것을 막기 위해 sys.path를 엄격하게 설정합니다.
# 현재 파일 위치: backend/app/analytics/add_column.py
# 목표 backend 경로: .../backend
current_dir = os.path.dirname(os.path.abspath(__file__)) # .../app/analytics
backend_app_dir = os.path.dirname(current_dir) # .../app
backend_dir = os.path.dirname(backend_app_dir) # .../backend

# 1. sys.path의 맨 앞에 backend 디렉토리를 추가하여 'app' 패키지가 backend/app을 가리키도록 함
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. 혹시나 sys.path에 ai-engine 경로가 있다면 제거 (프로젝트 구조에 따라 다를 수 있음)
# 'ai-engine' 문자열이 포함된 경로가 sys.path에 있다면 잠시 제외
safe_paths = [p for p in sys.path if "ai-engine" not in p]
sys.path = safe_paths

# Load environment variables
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv(os.path.join(backend_dir, ".env.local"))

# 이제 app 패키지를 import (backend/app 이어야 함)
try:
    from app.core.config import settings
    from app.db import database 
except ImportError as e:
    print(f"[Error] Failed to import app modules: {e}")
    print(f"Current sys.path: {sys.path}")
    sys.exit(1)

async def add_is_analyzed_column():
    engine = database.engine
    print(f"Connecting to DB... (SQLite: {settings.USE_SQLITE})")
    
    async with engine.begin() as conn:
        print("Adding 'is_analyzed' column...")
        try:
            await conn.execute(text("ALTER TABLE conversation_sessions ADD COLUMN is_analyzed BOOLEAN DEFAULT FALSE"))
            print("- Added 'is_analyzed'")
        except Exception as e:
            if "duplicate" in str(e).lower() or "exists" in str(e).lower():
                print("- 'is_analyzed' already exists")
            else:
                print(f"- Error: {e}")
            
        print("Adding 'is_feedback' column...")
        try:
            await conn.execute(text("ALTER TABLE chat_messages ADD COLUMN is_feedback BOOLEAN DEFAULT FALSE"))
            print("- Added 'is_feedback'")
        except Exception:
            pass
            
        print("Adding 'feedback' column...")
        try:
            await conn.execute(text("ALTER TABLE chat_messages ADD COLUMN feedback VARCHAR"))
            print("- Added 'feedback'")
        except Exception:
            pass

        print("Adding 'reason' column...")
        try:
            await conn.execute(text("ALTER TABLE chat_messages ADD COLUMN reason VARCHAR"))
            print("- Added 'reason'")
        except Exception:
            pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add is_analyzed and feedback columns")
    parser.add_argument("--production", action="store_true", help="Force use of production database (PostgreSQL)")
    parser.add_argument("--db-name", type=str, help="Database name")
    parser.add_argument("--db-user", type=str, help="Database user")
    parser.add_argument("--db-password", type=str, help="Database password")
    parser.add_argument("--db-host", type=str, help="Database host", default="localhost")
    parser.add_argument("--db-port", type=str, help="Database port", default="5432")

    args = parser.parse_args()

    if args.production:
        print("Switching to PRODUCTION mode (PostgreSQL)")
        settings.USE_SQLITE = False
        
        # Args가 있으면 덮어쓰기, 없으면 Config 기본값 사용
        if args.db_name: settings.POSTGRES_DB = args.db_name
        if args.db_user: settings.POSTGRES_USER = args.db_user
        if args.db_password: settings.POSTGRES_PASSWORD = args.db_password
        if args.db_host: settings.POSTGRES_SERVER = args.db_host
        if args.db_port: settings.POSTGRES_PORT = args.db_port
            
        # Re-initialize engine
        database.engine = database.create_async_engine(
            settings.DATABASE_URL,
            echo=True,
            isolation_level="AUTOCOMMIT"
        )
    
    # loop 처리를 위해 안전하게 실행
    loop = asyncio.get_event_loop()
    loop.run_until_complete(add_is_analyzed_column())
