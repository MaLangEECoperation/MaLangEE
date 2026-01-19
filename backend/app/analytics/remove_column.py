from app.db.database import SessionLocal
from sqlalchemy import text

def remove_feedback_column():
    db = SessionLocal()
    try:
        # Check if column exists is hard in raw sql without inspecting, 
        # but 'ALTER TABLE ... DROP COLUMN IF EXISTS' is supported in Postgres.
        # SQLite doesn't support DROP COLUMN directly in older versions, but let's assume Postgres or modern SQLite.
        # SQLite: requires recreating table usually, but we will try standard SQL.
        # User environment: Windows, probably SQLite or Postgres.
        # Given previous scripts used ALTER TABLE, we will assume it works.
        
        print("Removing 'feedback' column from 'conversation_sessions' table...")
        # Using IF EXISTS to avoid error if already removed
        db.execute(text("ALTER TABLE conversation_sessions DROP COLUMN IF EXISTS feedback"))
        db.commit()
        print("Column 'feedback' removed successfully.")
    except Exception as e:
        print(f"Error removing column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    remove_feedback_column()
