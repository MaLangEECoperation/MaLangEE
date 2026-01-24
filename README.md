# MaLangEE (말랭이)

**AI 기반 언어 학습 플랫폼**  
MaLangEE는 사용자의 발화를 실시간으로 분석하고 피드백을 제공하는 지능형 영어 학습 서비스입니다.

---

## 📚 주요 문서 가이드

프로젝트 참여자는 아래 문서를 필독해 주세요.

| 구분 | 문서 | 설명 |
|---|---|---|
| **필독** | [ℹ️ 00-PROJECT_INFO.md](docs/00-PROJECT_INFO.md) | **접속 URL**, 서버 IP, 계정, 포트 정보 (가장 중요) |
| **개발** | [💻 01-DEV_GUIDE.md](docs/01-DEV_GUIDE.md) | 로컬 개발 환경 셋팅 (Windows/Mac) |
| **운영** | [🚀 02-DEPLOY_GUIDE.md](docs/02-DEPLOY_GUIDE.md) | 운영 서버 배포 및 SSL/Nginx 설정 가이드 |

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 16 (React)
- **Styling**: TailwindCSS
- **State**: Zustand
- **Language**: TypeScript

### Backend & AI
- **Framework**: FastAPI (Python 3.11+)
- **Dependency**: Poetry
- **AI Engine**: LangChain, OpenAI API (Integration)
- **Database**: PostgreSQL 15+ (Host Native)
- **ORM**: SQLAlchemy (Async)

### Infrastructure
- **Server**: Ubuntu 24.04 LTS (Naver Cloud)
- **Web Server**: Nginx (Reverse Proxy + SSL)
- **Container**: Docker, Docker Compose
- **CI/CD**: Shell Script (`deploy.sh`)

---

## 🚀 빠른 시작 (Quick Start)

상세한 설치 및 실행 방법은 아래 가이드를 참고하세요.

- **개발자 (Local)**: [💻 01-DEV_GUIDE.md - 로컬 개발 환경 셋팅](docs/01-DEV_GUIDE.md)
- **운영자 (Prod)**: [🚀 02-DEPLOY_GUIDE.md - 운영 서버 배포 가이드](docs/02-DEPLOY_GUIDE.md)

---

## 📁 프로젝트 구조

```
MaLangEE/
├── frontend/                   # Next.js 프론트엔드
│   ├── src/                    # React 컴포넌트 및 페이지
│   └── public/                 # 정적 리소스
├── backend/                    # FastAPI 백엔드
│   ├── app/                    # API 로직 및 라우터
│   ├── pyproject.toml          # Poetry 의존성 관리
│   └── .env                    # 환경변수 (Git 제외)
├── ai-engine/                  # AI 엔진 모듈 (Backend에서 참조)
├── database/                   # DB 스키마 및 설치 스크립트
├── docs/                       # 📚 프로젝트 문서
├── nginx.conf                  # Nginx 설정 파일
├── docker-compose.yml          # Docker 서비스 정의
├── deploy.sh                   # 🚀 통합 배포 스크립트
└── README.md                   # 프로젝트 소개
```

---

## 🔐 보안 및 설정

서버 접속 정보, 포트 맵, 데이터베이스 접속 정보 등 민감한 환경 설정은 **보안상 별도 문서**로 관리합니다.

👉 **[ℹ️ 00-PROJECT_INFO.md](docs/00-PROJECT_INFO.md)** 문서를 확인하세요.
