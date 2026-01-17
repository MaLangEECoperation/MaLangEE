import asyncio
import argparse
import sys
import os
import uuid
import random
from datetime import datetime, timedelta
from faker import Faker

# Add backend directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import AsyncSessionLocal
from app.db.models import ConversationSession, ChatMessage
from sqlalchemy.ext.asyncio import AsyncSession

fake = Faker('ko_KR')  # Use Korean locale

async def create_mock_data(user_id: int = None, session_count: int = 10, messages_per_session: int = 40):
    async with AsyncSessionLocal() as db:
        print(f"Starting mock data generation...")
        print(f"User ID: {user_id if user_id else 'None (Anonymous)'}")
        print(f"Sessions: {session_count}")
        print(f"Messages per session: {messages_per_session}")

        for i in range(session_count):
            session_id = str(uuid.uuid4())
            start_time = fake.date_time_between(start_date='-1M', end_date='now')
            duration_minutes = random.randint(5, 30)
            end_time = start_time + timedelta(minutes=duration_minutes)
            
            # Create Session
            session = ConversationSession(
                session_id=session_id,
                title=fake.sentence(nb_words=4).strip('.'),
                started_at=start_time.isoformat(),
                ended_at=end_time.isoformat(),
                total_duration_sec=float(duration_minutes * 60),
                user_speech_duration_sec=float(duration_minutes * 60 * 0.4), # Assume 40% user speech
                scenario_place=fake.city(),
                scenario_partner=fake.name(),
                scenario_goal=fake.sentence(),
                scenario_state_json="{}",
                scenario_completed_at=end_time if random.choice([True, False]) else None,
                deleted=False,
                voice="alloy",
                show_text=True,
                user_id=user_id
            )
            db.add(session)
            
            # Create Messages
            current_time = start_time
            msg_interval = (duration_minutes * 60) / messages_per_session
            
            for j in range(messages_per_session):
                role = "user" if j % 2 == 0 else "assistant"
                content = fake.sentence() if role == "user" else fake.paragraph(nb_sentences=2)
                
                msg_duration = random.uniform(2.0, 10.0)
                
                message = ChatMessage(
                    session_id=session_id,
                    role=role,
                    content=content,
                    timestamp=current_time.isoformat(),
                    duration_sec=msg_duration
                )
                db.add(message)
                
                current_time += timedelta(seconds=msg_interval)
            
            print(f"Created session {i+1}/{session_count}: {session_id}")
        
        await db.commit()
        print("Mock data generation completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate mock data for MaLangEE")
    parser.add_argument("--user-id", type=int, help="User ID to assign sessions to", default=None)
    args = parser.parse_args()

    asyncio.run(create_mock_data(user_id=args.user_id))
