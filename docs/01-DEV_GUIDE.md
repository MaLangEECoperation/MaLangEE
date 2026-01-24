# 💻 개발자 가이드 (Local Development)

> **Windows, Mac, Linux 로컬 환경에서 MaLangEE를 실행하기 위한 가이드입니다.**
> 필수 도구 설치 후, 각 모듈을 로컬에서 실행하는 방법을 안내합니다.

---

## ✅ 필수 설치 체크리스트

개발 시작 전 다음 도구들이 설치되어 있어야 합니다.

1. **Git**: [Download](https://git-scm.com/downloads)
2. **Node.js (v20 LTS)**: [Download](https://nodejs.org/) (`.nvmrc`에 `20.18.0` 명시, `nvm use` 권장)
3. **Yarn**: `npm install -g yarn` (패키지 매니저)
4. **Python 3.11+**: [Download](https://www.python.org/downloads/) ("Add to PATH" 체크 필수)
5. **Poetry** (Python 패키지 매니저):
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   # 또는
   pip install poetry
   ```
6. **PostgreSQL 15+**: [Download](https://www.postgresql.org/download/) (로컬 개발 시 SQLite 대체 가능)
7. **IDE**: VS Code (추천), PyCharm, 또는 WebStorm

---

## 🚀 프로젝트 설정 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/MaLangEECoperation/MaLangEE.git
cd MaLangEE
```

### 2. 데이터베이스 설정

#### Option A: SQLite 사용 (기본값, 권장)
별도 설정 없이 바로 사용 가능합니다. `backend/app/core/config.py`에서 `USE_SQLITE=True`가 기본값입니다.

#### Option B: PostgreSQL 사용
로컬 PostgreSQL에 접속하여 DB와 사용자를 생성합니다. (psql 또는 pgAdmin 사용)

```sql
CREATE DATABASE malangee;
CREATE USER aimaster WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE malangee TO aimaster;
-- PostgreSQL 15 이상에서는 public 스키마 권한도 필요할 수 있음
GRANT ALL ON SCHEMA public TO aimaster;
```

환경변수 설정:
```bash
USE_SQLITE=FALSE
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=malangee
POSTGRES_USER=aimaster
POSTGRES_PASSWORD=your_password
```

---

### 3. 모듈별 실행 방법

#### 🅰️ Backend (FastAPI + Poetry)
```bash
cd backend

# 1. 의존성 설치 (가상환경 자동 생성)
poetry install

# 2. 로컬 개발 서버 실행 (SQLite 기본 사용)
poetry run uvicorn app.main:app --reload --port 8080

# PostgreSQL 사용 시 환경변수 설정
USE_SQLITE=FALSE poetry run uvicorn app.main:app --reload --port 8080
```
- 접속: `http://localhost:8080/`
- Swagger UI: `http://localhost:8080/docs`
- API 경로: `/api/v1/...`
- 설정 파일: `app/core/config.py` (환경변수 또는 `.env` 파일)

#### 🅱️ Frontend (Next.js 16 + React 19)
```bash
cd frontend

# 1. Node.js 버전 맞추기 (nvm 사용 시)
nvm use

# 2. 의존성 설치
yarn install

# 3. 개발 서버 실행
yarn dev
```
- 접속: `http://localhost:3000/`
- 설정 파일: `.env.local` (`.env.example` 참조하여 생성)

#### 🅾️ AI Engine (Python)
```bash
# AI Engine은 Backend의 Poetry 가상환경을 공유합니다.
cd backend

# Backend 의존성이 설치된 상태에서 실행
poetry run python ../ai-engine/app.py
```
- 접속: `http://localhost:5000`
- 참고: AI Engine의 실제 로직(시나리오, 실시간 대화)은 Backend 서비스에 통합되어 있으며, `app.py`는 헬스체크용 서버입니다.

---

## 🔧 환경 설정 파일

### Backend (.env 또는 환경변수)
```ini
# Database (기본값: SQLite)
USE_SQLITE=TRUE

# PostgreSQL 사용 시
USE_SQLITE=FALSE
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=malangee
POSTGRES_USER=malangee_user
POSTGRES_PASSWORD=malangee_password

# Security
SECRET_KEY=dev_secret_key_change_me
ALGORITHM=HS256

# AI Keys
OPENAI_API_KEY=sk-proj-...
```

### Frontend (.env.local)
```ini
NEXT_PUBLIC_API_URL=http://localhost:8080
```
Next.js는 `NEXT_PUBLIC_` 접두사가 붙은 환경 변수를 클라이언트에서 사용할 수 있습니다.

---

## 🐞 트러블슈팅

**Q. `poetry` 명령어를 찾을 수 없어요.**
A. 설치 후 터미널을 재시작하거나, Poetry가 설치된 경로(예: `~/.local/bin`)가 PATH에 추가되었는지 확인하세요.

**Q. `poetry install`이 실패해요.**
A. Python 3.11 이상이 설치되어 있는지 확인하세요. `python --version`으로 확인 후, 필요 시 `pyenv`를 사용하여 올바른 버전을 설치하세요.

**Q. DB 연결이 안 돼요.**
A. `backend/app/core/config.py`의 `USE_SQLITE` 설정을 확인하세요. 로컬 개발 시 `USE_SQLITE=TRUE`(기본값)이면 별도 DB 설정 없이 SQLite를 사용합니다. PostgreSQL 사용 시 환경변수(`POSTGRES_SERVER`, `POSTGRES_USER` 등)가 올바른지 확인하세요.

**Q. 포트 충돌이 발생해요.**
A. 이미 해당 포트(8080, 3000 등)를 사용하는 프로세스를 종료하거나, 각 모듈의 설정 파일에서 포트를 변경하세요.

**Q. API 호출이 실패해요.**
A. Frontend의 `.env.local` 파일에서 `NEXT_PUBLIC_API_URL`이 올바른 Backend 주소를 가리키는지 확인하세요.

**Q. `yarn dev` 실행 시 Node.js 버전 오류가 발생해요.**
A. `.nvmrc`에 명시된 Node.js 20.18.0을 사용하세요. `nvm use` 명령으로 자동 전환됩니다.

**Q. AI Engine은 따로 실행 안 하나요?**
A. 현재 구조에서 AI 로직은 Backend 앱 내부에 통합되어 실행되거나 라이브러리로 호출되므로, 별도로 실행할 필요가 없습니다. (Backend 실행 시 자동 포함)
