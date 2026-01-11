# MaLangEE Copilot Instructions

**AI Language Learning Platform** with real-time English conversation powered by OpenAI Realtime API.

## Architecture Overview

This is a **three-tier microservices-oriented system**:

### 1. **Frontend** (`/frontend`) - Next.js 16 + React 19
- App Router with FSD (Feature-Sliced Design) architecture
- TailwindCSS 4 + shadcn/ui components (New York style)
- WebSocket client for real-time conversation
- Testing: Vitest (unit) + Playwright (E2E)

### 2. **Backend** (`/backend`) - FastAPI (Python 3.11+)
- REST API for data persistence (sessions, messages, user analytics)
- SQLAlchemy 2.x async ORM with PostgreSQL
- Pydantic for request/response validation
- Separates AI concerns from business logic

### 3. **AI Engine** (`/ai-engine`) - FastAPI (Python)
- **Core responsibility**: Real-time WebSocket relay between frontend and OpenAI Realtime API
- `ConnectionHandler`: Bidirectional WebSocket bridge (client ↔ OpenAI)
- `ConversationManager`: System prompt management with dynamic guide adjustment
- `ConversationTracker`: Session analytics (WPM, turn count, VAD timing)
- `SessionManager` → Backend REST calls for persistence

## Critical Data Flows

### Real-Time Conversation Pipeline
```
Frontend (WebSocket) 
  → AI Engine (ConnectionHandler) 
  → OpenAI Realtime API
  ← Audio/Transcript stream back to Frontend
  → ConversationTracker (metrics) 
  → Backend REST (/logs) for storage
```

### Session Lifecycle
1. Frontend: `POST /ws/chat` → AI Engine establishes dual WebSocket
2. User speaks → Audio streamed to OpenAI via PCM16 (not Float32)
3. OpenAI responds → Audio delta + transcript events
4. AI Engine: Converts metrics via ConversationTracker
5. Session ends → Backend `/api/v1/chat/logs` persists everything

## Key Technical Decisions

### Audio Format Handling
- **Frontend → AI Engine**: Float32 (Web Audio API) converted to Base64
- **AI Engine → OpenAI**: PCM16 (OpenAI expects this)
- **OpenAI → Frontend**: PCM16 audio chunks passed through

### Async Design
- All backend code uses `async/await` with SQLAlchemy AsyncSession
- AI Engine handles multiple concurrent conversations with single FastAPI process
- Database dependency injection: `get_db()` pattern similar to Spring's `@Autowired`

### Config Management
- Central `scripts/config.sh` defines ports, versions, usernames
- Frontend uses path aliases `@/*` → `src/*` (tsconfig.json)
- Backend uses Pydantic Settings from environment variables

## Essential Commands

```bash
# Frontend (cd frontend)
yarn dev              # localhost:3000
yarn build && yarn start
yarn lint:fix         # ESLint auto-fix
yarn test             # Vitest
yarn test:e2e         # Playwright

# Backend (cd backend)
poetry install
python -m uvicorn app.main:app --reload --port 8080

# AI Engine (cd ai-engine)
python app.py  # or use FastAPI/Uvicorn structure

# All services together (from project root)
bash scripts/5-setup_services.sh  # Runs all three with proper logging
```

## Code Conventions

### Frontend (TypeScript/React)
- **Component imports**: Always use `import { FC } from 'react'` not `React.FC`
- **Styling**: Use Tailwind classes, avoid inline styles
- **Forms**: React Hook Form + Zod for validation
- **API calls**: TanStack React Query v5 with hooks in `/shared/api`
- **Path aliases**: Use `@/*` never relative imports

### Backend (Python)
- **Project structure**: MVC pattern (models, schemas, repositories, api)
- **Database models** in `app/db/models.py` use SQLAlchemy declarative
- **Schemas** in `app/schemas/` are Pydantic models for request/response
- **Repositories** handle all DB queries (DAO pattern)
- **Controllers** in `app/api/v1/` receive dependencies via `Depends()`
- **Async everywhere**: Use `async def`, `await`, `AsyncSession`

### AI Engine (Python)
- **Module structure**: `realtime_conversation/` contains core classes
- **Handler interfaces**: Design for future backend DB integration via `ISessionRepository`
- **WebSocket events**: Parse OpenAI events (`session.created`, `response.audio_delta`, etc.)

## Cross-Module Communication Patterns

### Frontend → AI Engine
- WebSocket at `{AI_ENGINE_URL}/ws/chat`
- Send: `{"type": "audio.append", "audio": "<base64_pcm16>"}`
- Receive: Transcript and audio chunks

### AI Engine → OpenAI
- Authenticate with `OPENAI_API_KEY`
- Endpoint: `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-26`

### AI Engine → Backend
- REST POST to `http://localhost:8080/api/v1/chat/logs`
- Payload: `{"session": {...}, "messages": [...]}`

## Project-Specific Patterns

1. **WebSocket Relay Pattern**: AI Engine acts as transparent bridge—doesn't interpret audio, just converts formats
2. **Dynamic Prompting**: System prompt changes based on user WPM (slow/normal/fast)
3. **MSA-Oriented Design**: Each service has one clear responsibility
4. **Metrics-First Analytics**: ConversationTracker extracts metrics before persistence

## Testing Patterns

- **Frontend**: Tests in `frontend/tests/*.test.tsx` with Testing Library
- **Backend**: pytest with async fixtures (`pytest-asyncio`)
- **E2E**: Playwright scripts in `frontend/e2e/*.spec.ts` test full conversation flows

## Debugging Tips

- **AI Engine logs**: Check WebSocket frames in browser DevTools Network tab
- **Backend DB issues**: Verify `DATABASE_URL` in environment and migration state
- **Audio format mismatch**: OpenAI requires PCM16 at 24kHz; verify in `ConnectionHandler`
- **Port conflicts**: Check `scripts/config.sh` for configured ports (3000, 8080, 5000)

## References

- Main README: `/README.md` (deployment overview)
- Architecture details: `/docs/00-PROJECT_INFO.md` (services, IPs, versions)
- Frontend guide: `/frontend/CLAUDE.md` (FSD, component patterns)
- Backend guide: `/backend/README.md` (FastAPI structure, ORM)
- AI Engine guide: `/ai-engine/realtime_conversation/README.md` (components, flows)
