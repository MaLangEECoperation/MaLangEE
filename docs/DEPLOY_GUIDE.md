# MaLangEE 개발자 배포 가이드

이 문서는 MaLangEE 프로젝트의 개발 및 배포 환경에 대한 가이드입니다.

## 1. 서버 접속 정보
*   **SSH 접속:** `ssh aimaster@<서버_IP>`
*   **사용자:** `aimaster`
*   **프로젝트 경로:** `/home/aimaster/projects/MaLangEE`
*   **배포 스크립트:** `/home/aimaster/projects/MaLangEE/deploy.sh`

## 2. 서비스 구성 및 포트
| 서비스 | 기술 스택 | 포트 | 비고 |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite | **5173** | `http://<서버_IP>:5173` |
| **Backend** | Spring Boot | **8080** | `http://<서버_IP>:8080/api/health` |
| **AI-Engine** | Python | **5000** | `http://<서버_IP>:5000` |

## 3. 배포 방법 (deploy.sh 사용)

프로젝트 루트에 있는 `deploy.sh` 스크립트를 사용하여 간편하게 배포할 수 있습니다.

### 3.0 배포 스크립트 위치 및 실행
```bash
# 프로젝트 디렉토리로 이동
cd /home/aimaster/projects/MaLangEE

# 배포 스크립트 실행
./deploy.sh all
```

### 3.1 전체 배포 (추천)
코드 업데이트(Git Pull), 빌드, 서비스 재시작을 한 번에 수행합니다.
```bash
./deploy.sh all
```

**수행 작업:**
- ✅ Git 최신 코드 동기화 (main 브랜치)
- ✅ Frontend 빌드 (npm install + npm build)
- ✅ Backend 빌드 (Maven clean package)
- ✅ AI-Engine 업데이트 (Python venv + pip install)
- ✅ 모든 서비스 재시작

### 3.2 개별 배포
특정 파트만 배포하고 싶을 때 사용합니다.
```bash
# Backend만 배포 (Maven Build + Restart)
cd /home/aimaster/projects/MaLangEE && ./deploy.sh backend

# Frontend만 배포 (NPM Install + Build + Restart)
cd /home/aimaster/projects/MaLangEE && ./deploy.sh frontend

# AI-Engine만 배포 (Restart)
cd /home/aimaster/projects/MaLangEE && ./deploy.sh ai

# Git pull만 수행 (빌드 없음)
cd /home/aimaster/projects/MaLangEE && ./deploy.sh git
```

### 3.3 서비스 재시작만 수행
빌드 없이 서비스만 재시작합니다.
```bash
cd /home/aimaster/projects/MaLangEE && ./deploy.sh restart
```

### 3.4 배포 로그 확인
```bash
# 실시간 배포 로그 확인
tail -f /var/log/MaLangEE_deploy.log

# 최근 50줄 확인
tail -50 /var/log/MaLangEE_deploy.log
```

## 4. 자동 배포 (Crontab)

서버가 실행 중일 때 **10분마다 자동으로 배포**가 진행됩니다.

### Crontab 설정 확인
```bash
# 현재 Crontab 확인
crontab -l

# 출력 예시:
# */10 * * * * cd /home/aimaster/projects/MaLangEE && ./deploy.sh all >> /var/log/MaLangEE_deploy.log 2>&1
```

### 자동 배포 중지 (필요시)
```bash
# 임시 중지 (crontab 편집)
crontab -e
# 위의 cron 라인을 주석 처리: # */10 * * * * ...

# 완전 삭제
crontab -r

# 복구
crontab -l > /tmp/crontab_backup.txt
# 필요시 내용 복원
```

## 5. 수동 관리 (Systemd)
`deploy.sh` 대신 직접 서비스를 제어해야 할 경우 `systemctl` 명령어를 사용합니다.

### 서비스 상태 확인
```bash
# 전체 상태 요약
systemctl status malangee-backend malangee-frontend malangee-ai

# 개별 서비스 상태
systemctl status malangee-backend   # Backend
systemctl status malangee-frontend  # Frontend
systemctl status malangee-ai        # AI-Engine

# 실시간 로그 확인 (종료: Ctrl+C)
journalctl -u malangee-backend -f   # Backend
journalctl -u malangee-frontend -f  # Frontend
journalctl -u malangee-ai -f        # AI-Engine
```

### 서비스 제어 (sudo 필요)
```bash
# 서비스 시작
sudo systemctl start malangee-backend
sudo systemctl start malangee-frontend
sudo systemctl start malangee-ai

# 서비스 재시작
sudo systemctl restart malangee-backend
sudo systemctl restart malangee-frontend
sudo systemctl restart malangee-ai

# 서비스 중지
sudo systemctl stop malangee-frontend
sudo systemctl stop malangee-backend
sudo systemctl stop malangee-ai

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable malangee-backend
sudo systemctl enable malangee-frontend
sudo systemctl enable malangee-ai
```

## 5. 프로젝트 구조
```
/home/aimaster/projects/MaLangEE/
├── frontend/              # React 프로젝트 (Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/               # Spring Boot 프로젝트
│   ├── src/
│   ├── pom.xml
│   └── ...
├── ai-engine/             # Python AI 엔진
│   ├── app.py
│   ├── venv/              # 파이썬 가상환경 (서버전용)
│   └── requirements.txt
├── database/              # 데이터베이스 설정
│   ├── init.sql
│   └── data/              # 데이터 파일 (서버전용)
├── deploy.sh              # 배포 스크립트
└── .gitignore             # Git 제외 파일 설정
```

## 6. 환경 설정

### 데이터베이스 정보
```
Host: localhost
Port: 5432
Database: malangee
User: malangee_user
Password: (설정 파일 참고)
```

### 서비스 포트 정보
| 서비스 | 포트 | 접속 URL |
|--------|------|---------|
| Frontend | 5173 | `http://<서버_IP>:5173` |
| Backend | 8080 | `http://<서버_IP>:8080` |
| AI-Engine | 5000 | `http://<서버_IP>:5000` |

## 7. 주요 파일 경로

| 파일 | 위치 | 용도 |
|------|------|------|
| 배포 로그 | `/var/log/MaLangEE_deploy.log` | 자동 배포 로그 확인 |
| 서비스 설정 | `/etc/systemd/system/malangee-*.service` | 서비스 정의 (수정 금지) |
| 배포 스크립트 | `/home/aimaster/projects/MaLangEE/deploy.sh` | 배포 자동화 |

## 8. 주의사항 및 FAQ

### CORS 설정
- Frontend는 브라우저의 주소창 호스트(`window.location.hostname`)를 기준으로 Backend(8080)와 AI(5000)에 요청을 보냅니다.
- 외부에서 접속할 경우 브라우저 콘솔에서 CORS 오류가 발생할 수 있으니, Backend의 CORS 설정을 확인하세요.

### 방화벽 설정
- 외부에서 접속이 안 될 경우, 클라우드 방화벽(Security Group)에서 5173, 8080, 5000 포트가 열려 있는지 확인하세요.
```bash
# 포트 상태 확인
sudo ss -tlnp | grep -E '5173|8080|5000'
```

### 배포 실패 시 확인사항
```bash
# 1. 배포 로그 확인
tail -100 /var/log/MaLangEE_deploy.log

# 2. 서비스 상태 확인
systemctl status malangee-backend
systemctl status malangee-frontend
systemctl status malangee-ai

# 3. Git 상태 확인
cd /home/aimaster/projects/MaLangEE
git status
git log --oneline -5

# 4. 디스크 공간 확인
df -h

# 5. 메모리 사용량 확인
free -h
```

### 서버 전용 파일 보호
- `.env`, `config.local.json` 등 서버 설정 파일은 Git 추적 대상이 아닙니다 (`.gitignore` 포함)
- 배포 시 이러한 파일들은 **자동으로 보존**됩니다
- 수동으로 수정한 파일들도 `git pull` 후 유지됩니다

### 배포 실행 권한
| 작업 | 권한 | 명령어 |
|------|------|--------|
| 배포 스크립트 실행 | aimaster | `./deploy.sh all` |
| 서비스 재시작 | sudo | `sudo systemctl restart malangee-*` |
| 로그 확인 | 제한 없음 | `tail -f /var/log/MaLangEE_deploy.log` |
