
import sys
import os
import argparse
import asyncio
from sqlalchemy import text
from dotenv import load_dotenv

# [CRITICAL] Path Setup & Conflict Prevention
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_app_dir = os.path.dirname(current_dir)
backend_dir = os.path.dirname(backend_app_dir)

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Remove potentially conflicting paths
safe_paths = [p for p in sys.path if "ai-engine" not in p]
sys.path = safe_paths

# Load environment variables
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv(os.path.join(backend_dir, ".env.local"))

try:
    from app.core.config import settings
    from app.db import database 
except ImportError as e:
    print(f"[Error] Failed to import app modules: {e}")
    sys.exit(1)

async def remove_feedback_column():
    engine = database.engine
    print(f"Removing 'feedback' column... (SQLite: {settings.USE_SQLITE})")
    
    async with engine.begin() as conn:
        # [Safety] Prevent hanging by setting lock timeout (PostgreSQL only)
        if not settings.USE_SQLITE:
            try:
                await conn.execute(text("SET lock_timeout = '5s'"))
            except Exception:
                pass

        try:
            await conn.execute(text("ALTER TABLE conversation_sessions DROP COLUMN IF EXISTS feedback"))
            print("Column 'feedback' removed successfully (if it existed).")
        except Exception as e:
            print(f"Error removing column: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove feedback column")
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
        if args.db_name: settings.POSTGRES_DB = args.db_name
        if args.db_user: settings.POSTGRES_USER = args.db_user
        if args.db_password: settings.POSTGRES_PASSWORD = args.db_password
        if args.db_host: settings.POSTGRES_SERVER = args.db_host
        if args.db_port: settings.POSTGRES_PORT = args.db_port
            
        database.engine = database.create_async_engine(
            settings.DATABASE_URL,
            echo=True,
            isolation_level="AUTOCOMMIT"
        )
    
    asyncio.run(remove_feedback_column())
