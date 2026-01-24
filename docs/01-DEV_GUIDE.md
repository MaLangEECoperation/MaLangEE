# 💻 개발자 가이드 (Local Development)

> **Windows, Mac, Linux 로컬 환경에서 MaLangEE를 실행하기 위한 가이드입니다.**  
> 필수 도구 설치 후, 각 모듈을 로컬에서 실행하는 방법을 안내합니다.

---

## ✅ 필수 설치 체크리스트

개발 시작 전 다음 도구들이 설치되어 있어야 합니다.

1. **Git**: [Download](https://git-scm.com/downloads)
2. **Node.js (v20 LTS)**: [Download](https://nodejs.org/)
3. **Python 3.11+**: [Download](https://www.python.org/downloads/) ("Add to PATH" 체크 필수)
4. **Poetry** (Python 패키지 매니저):
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   # 또는
   pip install poetry
   ```
5. **PostgreSQL 15+**: [Download](https://www.postgresql.org/download/)
6. **IDE**: VS Code (추천), PyCharm, 또는 WebStorm

---

## 🚀 프로젝트 설정 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/MaLangEECoperation/MaLangEE.git
cd MaLangEE
```

### 2. 데이터베이스 설정
로컬 PostgreSQL에 접속하여 DB와 사용자를 생성합니다. (psql 또는 pgAdmin 사용)

```sql
CREATE DATABASE malangee;
CREATE USER aimaster WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE malangee TO aimaster;
-- PostgreSQL 15 이상에서는 public 스키마 권한도 필요할 수 있음
GRANT ALL ON SCHEMA public TO aimaster;
```

---

### 3. 모듈별 실행 방법

#### 🅰️ Backend (Python FastAPI)

백엔드는 **Python FastAPI** 프레임워크를 사용하며, **Poetry**로 의존성을 관리합니다.

```bash
cd backend

# 1. 의존성 설치 (가상환경 자동 생성)
poetry install

# 2. 환경 변수 설정
# .env 파일을 생성하고 필요한 값을 입력하세요.
cp .env.example .env
# (편집기로 .env 파일의 DB 정보, OpenAI API 키 등을 본인 환경에 맞게 수정)

# 3. 로컬 개발 서버 실행
poetry run uvicorn app.main:app --reload --port 8080
```
- 접속: `http://localhost:8080/api/health`
- 문서(Swagger): `http://localhost:8080/docs`

#### 🅱️ Frontend (React + Next.js)

프론트엔드는 **Next.js 16**을 사용합니다.

```bash
cd frontend

# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
# .env.development 파일이 있는지 확인하세요.
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 3. 개발 서버 실행
npm run dev
```
- 접속: `http://localhost:3000/`

---

## 🔧 환경 설정 파일 (.env)

### Backend (.env) 예시
```ini
# Database
DATABASE_URL=postgresql+asyncpg://aimaster:your_password@localhost:5432/malangee

# Security
SECRET_KEY=dev_secret_key_change_me
ALGORITHM=HS256

# AI Keys
OPENAI_API_KEY=sk-proj-...
```

### Frontend (.env.local) 예시
```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## 🐞 트러블슈팅

**Q. `poetry` 명령어를 찾을 수 없어요.**
A. 설치 후 터미널을 재시작하거나, Poetry가 설치된 경로(예: `~/.local/bin`)가 PATH에 추가되었는지 확인하세요.

**Q. DB 연결 오류 (`Connection refused`)**
A. `.env` 파일의 `DATABASE_URL`에 IP, Port, User, Password가 로컬 PostgreSQL 설정과 일치하는지 확인하세요. (기본 포트: 5432)

**Q. 백엔드 `ImportError` 발생**
A. `poetry install`이 정상적으로 완료되었는지, 그리고 `poetry run`으로 실행했는지(가상환경 활성화) 확인하세요.

**Q. AI Engine은 따로 실행 안 하나요?**
A. 현재 구조에서 AI 로직은 Backend 앱 내부에 통합되어 실행되거나 라이브러리로 호출되므로, 별도로 실행할 필요가 없습니다. (Backend 실행 시 자동 포함)
