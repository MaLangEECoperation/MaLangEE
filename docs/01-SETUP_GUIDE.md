# MaLangEE 설치 가이드

이 문서는 MaLangEE 프로젝트를 처음부터 설치하고 배포하는 **단계별 가이드**입니다.

---

## 📋 실행 순서 (중요!)

모든 스크립트는 **순서대로** 실행해야 합니다:

```
1️⃣ 1-init_server.sh    → Ubuntu 서버 초기화 (처음 한 번만, root 권한)
   ↓
2️⃣ 2-setup_env.sh      → 개발 환경 설치 (로컬 또는 서버)
```

---

## 🖥️ 현재 서버 구성 정보 (Reference)

**서버 정보**
- **OS**: Ubuntu 24.04 LTS
- **IP**: 49.50.137.35
- **기본 경로**: `/home/aimaster`
- **배포 경로**: `/home/aimaster/projects/MaLangEE`

**설치된 도구 버전 및 경로**
- **Java**: OpenJDK 17.0.17
- **Node.js**: v18.20.8 (`/usr/bin/node`)
- **npm**: 10.8.2 (`/usr/bin/npm`)
- **Python**: 3.12.3 (`/usr/bin/python3`)
- **Maven**: (`/usr/bin/mvn`)
- **PostgreSQL**: 15.15

**데이터베이스 정보**
- **Host**: 49.50.137.35
- **Port**: 5432
- **Database**: malangee
- **User**: aimaster

**서비스 접속 URL**
- **Frontend**: http://49.50.137.35:5173
- **AI Engine**: http://49.50.137.35:5000
- **Backend**: http://49.50.137.35:8080/api/health

---

## 🔧 1단계: 서버 초기화 (Ubuntu Server)

**목적**: Ubuntu 서버에 배포 사용자 생성, Git 설치, Cron 자동 배포 설정

**실행 환경**: Ubuntu/Debian 서버 (EC2, VPS 등)

**권한**: Root 권한 필요 (`sudo`)

### 실행 방법

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/MaLangEE

# 스크립트 실행
sudo bash scripts/1-init_server.sh
```

### 대화형 입력

스크립트를 실행하면 다음을 입력받습니다:

```
생성할 사용자명 (기본값: aimaster): [엔터 또는 사용자명 입력]
GitHub 저장소 URL (기본값: https://github.com/MaLangEECoperation/MaLangEE.git): [엔터]
GitHub 브랜치 (기본값: main): [엔터]
```

### 설정 정보

| 항목 | 값 |
|------|-----|
| **배포 사용자** | aimaster (또는 입력한 사용자명) |
| **프로젝트 경로** | /home/aimaster/projects/MaLangEE |
| **자동 배포** | Cron (10분마다) |
| **배포 로그** | /var/log/MaLangEE_deploy.log |

### 완료 후 확인

```bash
# Cron 자동 배포 설정 확인
crontab -u aimaster -l

# 출력 예시:
# */10 * * * * /home/aimaster/deploy.sh >> /var/log/MaLangEE_deploy.log 2>&1
```

---

## 🔨 2단계: 개발 환경 설치

**목적**: Java, Node.js, Python, PostgreSQL 자동 설치

**실행 환경**: 로컬 또는 서버

**권한**: 일반 사용자 (필요시 `sudo` 사용)

### 실행 방법

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/MaLangEE

# 스크립트 실행
bash scripts/2-setup_env.sh
```

### 설치 항목

다음 도구들이 자동으로 설치됩니다:

- ✅ **Java** (JDK 17.0.17) - Spring Boot Backend
- ✅ **Node.js** (v18.20.8) - Frontend
- ✅ **Python** (3.12.3) - AI Engine
- ✅ **PostgreSQL** (15.15) - 데이터베이스

### 대화형 설정

PostgreSQL 설정 시 다음을 입력받습니다:

```
PostgreSQL 설정을 진행합니다.

데이터베이스명 (기본값: malangee): [엔터]
데이터베이스 사용자명 (기본값: aimaster): [엔터]
데이터베이스 사용자 비밀번호 (기본값: malangee_password): [비밀번호 입력]

설정 정보:
  • 데이터베이스명: malangee
  • 사용자명: aimaster
  • 비밀번호: ****** (입력됨)

위의 설정으로 진행하시겠습니까? (y/n): y
```

### 완료 후 확인

```bash
# Java 버전 확인
java -version

# Node.js 버전 확인
node -v && npm -v

# Python 버전 확인
python3 --version

# PostgreSQL 버전 확인
psql --version

# PostgreSQL 접속 테스트
psql -h 49.50.137.35 -U aimaster -d malangee
```

---

## 🚀 개발 모드 실행

모든 설치가 완료되면 다음과 같이 실행합니다.

### Frontend 실행

```bash
cd frontend
npm install  # 처음 한 번만
npm run dev

# 접속: http://localhost:5173
```

### Backend 실행 (Java Spring Boot)

```bash
cd backend
mvn clean install  # 처음 한 번만
mvn spring-boot:run

# 접속: http://localhost:8080
```

### Python AI Engine 실행

```bash
cd ai-engine
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

## 📝 공통 설정 변경 (config.sh)

기본값이 아닌 다른 환경에서 실행할 경우, `scripts/config.sh`를 수정하세요.

### 예: 공인 IP 설정

```bash
# scripts/config.sh 수정
nano scripts/config.sh

# 다음 값 변경:
export DOMAIN_NAME="49.50.137.35"
export PROJECT_PATH="/malangee"
export DEPLOY_USER="your_username"
```

### 예: 데이터베이스 계정 변경

```bash
# scripts/config.sh 수정
export DB_NAME="custom_db"
export DB_USER="custom_user"
export DB_PASSWORD="secure_password"
```

**주의**: 각 스크립트는 대화형으로 실행 중 사용자 입력을 받으므로,  
config.sh의 기본값은 단순히 제안값으로 사용됩니다.

---

## 🔄 배포 프로세스

### 자동 배포 (Cron)

1단계에서 설정한 Cron이 **10분마다** 자동으로:
1. GitHub에서 최신 코드 가져오기 (`git fetch`)
2. 로컬 변경 무시하고 최신으로 업데이트 (`git reset --hard`)
3. 배포 완료 (로그 기록)

```bash
# 배포 로그 실시간 확인
tail -f /var/log/MaLangEE_deploy.log

# 최근 배포 로그 확인
tail -20 /var/log/MaLangEE_deploy.log
```

### 수동 배포 (즉시)

```bash
# 지금 바로 배포 실행
/home/aimaster/deploy.sh

# 배포 완료 확인
tail -5 /var/log/MaLangEE_deploy.log
```

### 저장소 상태 확인

```bash
# 저장소 이동
cd /home/aimaster/projects/MaLangEE

# 상태 확인
git status

# 최근 커밋 확인
git log --oneline -5
```

---

## ⚠️ 문제 해결

### 1단계 에러: "Permission denied"

```bash
# sudo 권한으로 실행하세요
sudo bash scripts/1-init_server.sh
```

### 2단계 에러: "apt-get: command not found"

```bash
# CentOS/RHEL의 경우 (Debian/Ubuntu 기반이 아님)
# 스크립트가 Ubuntu/Debian 기반입니다
# 수동으로 설치하거나 OS 변경 필요
```

### PostgreSQL 연결 오류

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# PostgreSQL 시작
sudo systemctl start postgresql

# 접속 테스트
psql -h localhost -U malangee_user -d malangee
```

---

## ✅ 설치 체크리스트

### 1단계 완료 확인

- [ ] 배포 사용자 생성됨
- [ ] Git 설치됨
- [ ] 저장소 클론됨: `/home/aimaster/projects/MaLangEE`
- [ ] Cron 배포 설정됨 (10분마다)
- [ ] 배포 로그 파일 생성됨: `/var/log/MaLangEE_deploy.log`

### 2단계 완료 확인

- [ ] Java 설치 확인: `java -version`
- [ ] Node.js 설치 확인: `node -v`
- [ ] Python 설치 확인: `python3 --version`
- [ ] PostgreSQL 설치 확인: `psql --version`
- [ ] PostgreSQL 접속 가능: `psql -h 49.50.137.35 -U aimaster -d malangee`

---

## 📞 추가 지원

더 자세한 정보는 다음 문서를 참고하세요:

- **[../../README.md](../../README.md)** - 프로젝트 개요
- **[02-DEPLOYMENT_GUIDE.md](02-DEPLOYMENT_GUIDE.md)** - 배포 관리 & 모니터링

---

**설치 완료! 🎉**

이제 다음 단계로 진행하세요:
1. Frontend 개발: `cd frontend && npm run dev`
2. Backend 개발: `cd backend && mvn spring-boot:run`
