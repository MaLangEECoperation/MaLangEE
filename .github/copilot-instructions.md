# Copilot Instructions for MaLangEE

## Project Overview
- **MaLangEE** is an AI-driven real-time English conversation learning platform.
- The system is composed of three main parts:
  - **Frontend**: Next.js 16 (React 19, TypeScript), in `frontend/`.
  - **Backend**: FastAPI (Python 3.11+), in `backend/`.
  - **AI Engine**: Real-time audio and scenario logic, in `ai-engine/`.
- All configuration is centralized in `scripts/config.sh`.

## Architecture & Data Flow
- **Frontend** communicates with Backend via REST and with AI Engine via WebSocket for real-time audio.
- **Backend** handles user, chat, and business logic, and persists data to PostgreSQL using async SQLAlchemy.
- **AI Engine** bridges real-time audio between the frontend and OpenAI Realtime API, managing session state and analytics.
- See `ai-engine/realtime_conversation/README.md` and `ai-engine/scenario/README.md` for detailed sequence diagrams and component roles.

## Developer Workflows
- **Deployment**: Use `deploy.sh` at the project root. Supports partial deploys (`frontend`, `backend`, `ai`, `all`).
- **Frontend**:
  - Use `yarn` (not npm) for all commands. See `frontend/CLAUDE.md` for full command list.
  - Key commands: `yarn dev`, `yarn build`, `yarn test`, `yarn lint`, `yarn storybook`.
- **Backend**:
  - Use Poetry for dependency management (`poetry install`).
  - Entrypoint: `backend/app/main.py`. Config: `backend/app/core/config.py`.
- **AI Engine**:
  - Python modules for real-time audio, scenario, and OpenAI integration.
  - See `ai-engine/realtime_conversation/README.md` for relay and state management logic.

## Project Conventions
- **Monorepo**: All services in one repo, with clear directory separation.
- **Service boundaries**: No direct imports across `frontend/`, `backend/`, `ai-engine/`.
- **TypeScript/React**: Use functional components, colocate feature logic, and prefer React Query for data fetching.
- **Python**: Use async/await for all DB and network operations. Follow FastAPI and SQLAlchemy async patterns.
- **Testing**: Frontend uses Vitest/Playwright, backend uses pytest, AI Engine has module-level tests in `ai-engine/tests/`.

## Integration & External Dependencies
- **OpenAI Realtime API**: All real-time audio and scenario logic is built around this.
- **Systemd**: Services are managed via systemd units (`malangee-backend`, `malangee-frontend`, `malangee-ai`).
- **PostgreSQL**: Used for all persistent data.

## Key References
- [docs/00-PROJECT_INFO.md]: High-level project info
- [docs/01-DEV_GUIDE.md]: Local dev guide
- [frontend/CLAUDE.md]: Frontend conventions and commands
- [ai-engine/realtime_conversation/README.md]: AI Engine relay/state logic
- [ai-engine/scenario/README.md]: Scenario pipeline and builder logic
- [backend/README.md]: Backend structure and config

---

- When in doubt, check the relevant README in each service directory.
- Follow the deployment and workflow patterns described above for consistency.
