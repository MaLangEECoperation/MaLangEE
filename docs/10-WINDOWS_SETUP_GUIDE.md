# Windows 11 로컬 개발 환경 구성 가이드

Windows 11에서 MaLangEE 프로젝트의 로컬 개발 환경을 구성하는 **완전 가이드**입니다.

---

## 📋 개요

MaLangEE는 다음 기술 스택을 사용합니다:

| 구성 요소 | 기술 | 포트 | 설명 |
|---------|------|------|------|
| **Frontend** | React/Vue + Vite | 5173 | 사용자 인터페이스 |
| **Backend** | Java Spring Boot + Maven | 8080 | REST API 서버 |
| **AI Engine** | Python 3.9+ | - | 머신러닝 엔진 |
| **Database** | PostgreSQL 13+ | 5432 | 데이터 저장소 |

---

## 📦 필수 설치 항목

### 1️⃣ Git
- **목적**: 코드 버전 관리
- **다운로드**: https://git-scm.com/download/win

### 2️⃣ Node.js & npm
- **목적**: Frontend 개발 및 패키지 관리
- **버전**: LTS 18.x 이상
- **다운로드**: https://nodejs.org/

### 3️⃣ Java JDK 17
- **목적**: Spring Boot Backend 개발
- **다운로드**: 
  - 옵션 A (추천): OpenJDK 17 (https://adoptopenjdk.net/)
  - 옵션 B: Oracle JDK 17 (https://www.oracle.com/java/technologies/downloads/)

### 4️⃣ Maven 3.8+
- **목적**: Java 의존성 관리 및 빌드
- **다운로드**: https://maven.apache.org/download.cgi

### 5️⃣ Python 3.9+
- **목적**: AI Engine 개발
- **다운로드**: https://www.python.org/downloads/ (Windows installer)
- **중요**: "Add Python to PATH" 체크!

### 6️⃣ PostgreSQL 13+
- **목적**: 데이터베이스
- **다운로드**: https://www.postgresql.org/download/windows/
- **기본 포트**: 5432

### 7️⃣ IDE (선택사항)
- **Frontend**: VS Code 또는 WebStorm
- **Backend**: IntelliJ IDEA Community 또는 VS Code
- **AI Engine**: VS Code 또는 PyCharm

---

## 🚀 단계별 설치 가이드

### Step 1: Git 설치

1. **다운로드**: https://git-scm.com/download/win
2. **설치**: 기본값 유지하고 Next 클릭
3. **확인**:
   ```powershell
   git --version
   # git version 2.40.0 (또는 최신 버전)
   ```

### Step 2: Node.js 설치

1. **다운로드**: https://nodejs.org/ (LTS 버전)
2. **설치**: 기본값 유지하고 Next 클릭
3. **확인**:
   ```powershell
   node -v
   npm -v
   # v18.x.x
   # 9.x.x
   ```

### Step 3: Java JDK 17 설치

#### 옵션 A: OpenJDK (추천)

```powershell
# Chocolatey 사용 (Windows 패키지 관리자)
# 1) Chocolatey 설치 (관리자 PowerShell):
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2) OpenJDK 17 설치:
choco install openjdk17

# 3) 확인:
java -version
javac -version
```

#### 옵션 B: Oracle JDK 또는 수동 설치

1. **다운로드**: https://adoptopenjdk.net/ 또는 Oracle 사이트
2. **설치**: 기본값 유지
3. **환경변수 설정**:
   - `JAVA_HOME` = `C:\Program Files\Java\jdk-17.x.x`
   - `PATH`에 `%JAVA_HOME%\bin` 추가
4. **확인**:
   ```powershell
   java -version
   javac -version
   ```

### Step 4: Maven 설치

```powershell
# Chocolatey 사용 (가장 쉬움):
choco install maven

# 또는 수동 설치:
# 1) https://maven.apache.org/download.cgi 에서 다운로드
# 2) C:\Program Files 에 압축 해제
# 3) 환경변수 설정:
#    - MAVEN_HOME = C:\Program Files\apache-maven-3.9.x
#    - PATH에 %MAVEN_HOME%\bin 추가

# 확인:
mvn -version
# Apache Maven 3.9.x
```

### Step 5: Python 설치

1. **다운로드**: https://www.python.org/downloads/
2. **설치 시 주의**:
   - ✅ "Add Python 3.9 to PATH" **반드시 체크**
   - ✅ "Install pip" 체크
   - 기본값 유지
3. **확인**:
   ```powershell
   python --version
   pip --version
   # Python 3.9.x (또는 최신)
   # pip 22.x
   ```

### Step 6: PostgreSQL 설치

1. **다운로드**: https://www.postgresql.org/download/windows/
2. **설치**:
   - Password: 기억하기 쉬운 비밀번호 설정 (예: `postgres`)
   - Port: 5432 (기본값)
   - Locale: Korean, Korea 선택
3. **확인**:
   ```powershell
   psql --version
   # psql (PostgreSQL) 13.x
   ```

---

## 💻 개발 환경 구성

### 프로젝트 디렉토리 생성

```powershell
# 작업 폴더 생성 (예: 내 문서)
mkdir C:\Users\YourName\Documents\MaLangEE
cd C:\Users\YourName\Documents\MaLangEE

# Git 저장소 클론
git clone https://github.com/MaLangEECoperation/MaLangEE.git
cd MaLangEE
```

### 각 모듈별 설치

#### Frontend 설치

```powershell
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 접속:
# http://localhost:5173
```

#### Backend 설치

```powershell
cd backend

# Maven 의존성 설치 (처음 한 번만, 시간 소요)
mvn clean install

# Spring Boot 개발 서버 실행
mvn spring-boot:run

# 브라우저에서 접속:
# http://localhost:8080
# API 문서: http://localhost:8080/swagger-ui.html (설정된 경우)
```

#### Python AI Engine 설치

```powershell
cd ai-engine

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# 또는 Command Prompt (cmd):
venv\Scripts\activate.bat

# 의존성 설치
pip install -r requirements.txt

# 실행
python main.py
```

#### PostgreSQL 데이터베이스 설정

```powershell
# PostgreSQL 명령 프롬프트 열기
# Windows 시작 메뉴에서 "psql" 검색하여 실행
# 또는 PowerShell:
psql -U postgres

# SQL 명령 입력:
-- 데이터베이스 생성
CREATE DATABASE malangee;

-- 사용자 생성
CREATE USER malangee_user WITH PASSWORD 'malangee_password';

-- 권한 설정
ALTER ROLE malangee_user SET client_encoding TO 'utf8';
ALTER ROLE malangee_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE malangee_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE malangee TO malangee_user;

-- 종료
\q
```

---

## 🔧 IDE 설정

### VS Code (추천 - 가볍고 빠름)

#### 필수 확장 프로그램

1. **Frontend 개발**:
   - Vite
   - Vue (Vue Language Features)
   - Prettier - Code formatter
   - ESLint

2. **Backend 개발**:
   - Extension Pack for Java (Microsoft)
   - Maven for Java
   - Spring Boot Extension Pack

3. **Python 개발**:
   - Python
   - Pylance
   - Python Debugger

4. **공통**:
   - Git Graph
   - REST Client
   - Database Client (SQLTools)
   - Thunder Client (API 테스트)

#### 설정 (settings.json)

```json
{
  // 형식 지정
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[java]": {
    "editor.defaultFormatter": "redhat.java",
    "editor.formatOnSave": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true
  },

  // 폰트
  "editor.fontSize": 13,
  "editor.fontFamily": "'Consolas', 'Courier New', monospace",

  // Python
  "python.defaultInterpreterPath": "${workspaceFolder}/ai-engine/venv/Scripts/python.exe",
  "python.formatting.provider": "black",

  // Java
  "java.home": "C:\\Program Files\\Java\\jdk-17.x.x"
}
```

### IntelliJ IDEA (Java 개발에 최고)

1. **설치**: https://www.jetbrains.com/idea/download/
2. **프로젝트 열기**: backend 폴더 선택
3. **SDK 설정**:
   - File → Project Structure → Project
   - SDK: JDK 17 선택
4. **Maven 설정**:
   - Maven이 자동 감지됨
   - View → Tool Windows → Maven 에서 프로젝트 새로고침

---

## 📊 포트 확인 및 관리

### 사용 중인 포트 확인

```powershell
# 포트 5173 (Frontend) 확인
netstat -ano | findstr :5173

# 포트 8080 (Backend) 확인
netstat -ano | findstr :8080

# 포트 5432 (PostgreSQL) 확인
netstat -ano | findstr :5432
```

### 포트 충돌 시 해결

```powershell
# PID로 프로세스 종료
# 예: PID가 12345인 경우
taskkill /PID 12345 /F

# 또는 다른 포트로 실행
# Frontend: npm run dev -- --port 3000
# Backend: mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=9000"
```

---

## 🔌 데이터베이스 연결 설정

### Backend (application.properties 또는 application.yml)

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/malangee
spring.datasource.username=malangee_user
spring.datasource.password=malangee_password
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

또는 YAML:

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/malangee
    username: malangee_user
    password: malangee_password
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQL10Dialect
    hibernate:
      ddl-auto: update
    show-sql: false
```

### Python (AI Engine)

```python
# config.py 또는 .env 파일
import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'malangee',
    'user': 'malangee_user',
    'password': 'malangee_password'
}

# 연결 테스트
try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("PostgreSQL 연결 성공!")
    conn.close()
except Exception as e:
    print(f"연결 실패: {e}")
```

---

## 🌐 동시 실행 및 통합 테스트

### 터미널 분할 (VS Code)

1. **View** → **Terminal** → **Split Terminal** (또는 Ctrl+\)
2. 각 터미널에서 실행:

```powershell
# 터미널 1: Frontend
cd frontend
npm run dev

# 터미널 2: Backend
cd backend
mvn spring-boot:run

# 터미널 3: Python AI Engine
cd ai-engine
.\venv\Scripts\Activate.ps1
python main.py
```

### 동시 실행 스크립트 (선택사항)

`scripts/run_dev.ps1` 생성:

```powershell
# Windows PowerShell 스크립트
# 실행: .\scripts\run_dev.ps1

# 새 PowerShell 창에서 각 서비스 실행
Start-Process powershell -ArgumentList {
    cd frontend
    npm run dev
}

Start-Process powershell -ArgumentList {
    cd backend
    mvn spring-boot:run
}

Start-Process powershell -ArgumentList {
    cd ai-engine
    .\venv\Scripts\Activate.ps1
    python main.py
}

Write-Host "모든 서비스가 시작되었습니다!"
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:8080"
```

---

## 🔍 개발 환경 체크리스트

### 설치 확인

```powershell
# 모든 버전 확인
git --version
node -v
npm -v
java -version
mvn -version
python --version
psql --version
```

### 포트 확인

```powershell
# 기본 포트가 모두 사용 가능한지 확인
netstat -ano | findstr ":5173"  # Frontend
netstat -ano | findstr ":8080"  # Backend
netstat -ano | findstr ":5432"  # PostgreSQL
# 아무것도 표시되지 않으면 OK
```

### 데이터베이스 연결 확인

```powershell
# PostgreSQL 연결 테스트
psql -h localhost -U malangee_user -d malangee

# SQL 입력
SELECT version();
\q  # 종료
```

### 프로젝트 구조 확인

```powershell
cd MaLangEE
Get-ChildItem

# 출력:
# frontend/
# backend/
# ai-engine/
# database/
# docs/
# scripts/
# README.md
# 01-SETUP_GUIDE.md
```

---

## 💡 개발 팁

### 1. 일관된 편집 설정

`.editorconfig` 파일 (프로젝트 루트):

```ini
# EditorConfig helps maintain consistent coding styles
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,vue}]
indent_style = space
indent_size = 2

[*.{java}]
indent_style = space
indent_size = 4

[*.py]
indent_style = space
indent_size = 4
```

### 2. 환경변수 설정 (.env 파일)

**Frontend** (frontend/.env):
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=MaLangEE
```

**Backend** (backend/.env 또는 환경변수):
```env
DATABASE_URL=postgresql://malangee_user:malangee_password@localhost:5432/malangee
JWT_SECRET=your_secret_key_here
```

**Python** (ai-engine/.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malangee
DB_USER=malangee_user
DB_PASSWORD=malangee_password
```

### 3. Git 설정

```powershell
# 전역 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 프로젝트별 설정
cd MaLangEE
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 4. 빠른 개발 빌드

```powershell
# Frontend: 변경 감지 및 자동 리로드
npm run dev

# Backend: 핫 리로드 (Spring Boot DevTools)
mvn spring-boot:run

# Python: 자동 리로드
# requirements.txt에 watchdog 추가 후
# python -m watchdog.auto
```

### 5. 디버깅

**VS Code에서 디버깅**:

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: 현재 파일",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "name": "Java: 현재 클래스",
      "type": "java",
      "request": "launch",
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

---

## 🚨 문제 해결

### Q1: Python이 인식되지 않음

```powershell
# 해결:
# 1) Python 재설치 시 "Add Python to PATH" 체크
# 2) PowerShell 재시작
# 3) 경로 확인:
where python
```

### Q2: Maven 또는 Java를 찾을 수 없음

```powershell
# 해결:
# 1) 환경변수 설정 확인:
$env:JAVA_HOME
$env:MAVEN_HOME

# 2) 수동 설정:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.x.x"
$env:MAVEN_HOME = "C:\Program Files\apache-maven-3.9.x"

# 3) PATH에 추가:
$env:Path += ";$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin"

# 4) PowerShell 프로필에 저장 (영구적):
# 아래 내용을 $PROFILE 파일에 추가
```

### Q3: npm install 실패

```powershell
# 해결:
# 1) npm 캐시 초기화
npm cache clean --force

# 2) package-lock.json 삭제 후 다시 설치
Remove-Item package-lock.json
npm install

# 3) Node 재설치 (최후의 수단)
choco uninstall nodejs
choco install nodejs
```

### Q4: PostgreSQL 연결 실패

```powershell
# 해결:
# 1) PostgreSQL 서비스 확인
Get-Service postgresql-x64-13
# 또는 Services (서비스) 앱에서 확인

# 2) PostgreSQL 시작
Start-Service postgresql-x64-13

# 3) 포트 확인
netstat -ano | findstr :5432

# 4) 암호 재설정
psql -U postgres
-- 데이터베이스에서:
ALTER USER malangee_user WITH PASSWORD 'new_password';
```

### Q5: 포트 충돌

```powershell
# 해결 방법 1: 프로세스 종료
tasklist | findstr node   # Node 프로세스 찾기
taskkill /PID [PID] /F    # 프로세스 종료

# 해결 방법 2: 다른 포트 사용
# Frontend:
npm run dev -- --port 3000

# Backend:
# application.properties에서:
# server.port=9000
```

---

## 📚 유용한 리소스

### 공식 문서
- **Node.js**: https://nodejs.org/docs/
- **Java Spring Boot**: https://spring.io/projects/spring-boot
- **Python**: https://docs.python.org/
- **PostgreSQL**: https://www.postgresql.org/docs/

### 개발 커뮤니티
- **Stack Overflow**: https://stackoverflow.com/
- **GitHub Discussions**: MaLangEE 저장소 토론
- **Reddit**: r/learnprogramming, r/webdev

### 개발 도구
- **Postman** (API 테스트): https://www.postman.com/
- **DBeaver** (DB 관리): https://dbeaver.io/
- **Git Bash** (향상된 Git): https://gitforwindows.org/

---

## ✅ 최종 체크리스트

- [ ] Git 설치 및 저장소 클론 완료
- [ ] Node.js & npm 설치 완료
- [ ] Java JDK 17 설치 완료
- [ ] Maven 설치 완료
- [ ] Python 설치 및 PATH 설정 완료
- [ ] PostgreSQL 설치 및 데이터베이스 생성 완료
- [ ] Frontend npm install 완료
- [ ] Backend mvn clean install 완료
- [ ] Python 가상환경 생성 및 패키지 설치 완료
- [ ] IDE 설치 및 확장 프로그램 설정 완료
- [ ] 포트 확인 (5173, 8080, 5432) 완료
- [ ] 모든 서비스 동시 실행 및 테스트 완료

---

## 🚀 다음 단계

1. **개발 시작**: Frontend 또는 Backend 선택하여 개발
2. **커밋**: 주기적으로 변경사항 커밋
3. **푸시**: GitHub에 코드 푸시
4. **배포**: 서버에서 자동 배포 (Cron 또는 GitHub Actions)

---

**Windows 11에서 MaLangEE 로컬 개발 환경 구성 완료! 🎉**

문제가 발생하면 이 가이드의 "문제 해결" 섹션을 참고하세요.
