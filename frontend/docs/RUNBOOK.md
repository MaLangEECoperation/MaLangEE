# 운영 런북 (Operations Runbook)

MaLangEE 프론트엔드 운영 및 서버 관리 가이드입니다.

## 서버 정보

| 환경             | URL                                                             | 용도                      |
| ---------------- | --------------------------------------------------------------- | ------------------------- |
| Frontend (HTTPS) | https://lb-dev-web-ai-117002060-f11523401681.kr.lb.naverncp.com | 운영 (네이버 클라우드 LB) |
| Frontend (직접)  | http://49.50.137.35:3000                                        | 개발/디버깅               |
| Backend API      | http://49.50.137.35:8080                                        | FastAPI (Python)          |
| AI Engine        | http://49.50.137.35:5000                                        | Python FastAPI            |
| Database         | 49.50.137.35:5432                                               | PostgreSQL                |

---

## 빠른 명령어

### 상태 확인

```bash
# 모든 서비스 상태
ps aux | grep -E "next|uvicorn|python"

# 포트 확인
sudo lsof -i :3000  # Frontend
sudo lsof -i :8080  # Backend
sudo lsof -i :5000  # AI Engine
```

### 서비스 재시작

```bash
# 전체 재시작
/home/aimaster/projects/MaLangEE/deploy.sh restart

# 수동 배포
/home/aimaster/projects/MaLangEE/deploy.sh
```

### 로그 확인

```bash
# 배포 로그
tail -f /var/log/MaLangEE_deploy.log

# PostgreSQL 로그
sudo tail -f /var/log/postgresql/postgresql.log
```

---

## 자동 배포 시스템

### 동작 원리

```
Cron (10분마다) → deploy.sh 실행
  ↓
GitHub main 브랜치 변경 확인 (git fetch)
  ↓
변경 있음 → git pull → build → restart
  ↓
로그 기록 (/var/log/MaLangEE_deploy.log)
```

### Cron 관리

```bash
# Cron 상태 확인
sudo systemctl status cron

# 등록된 작업 확인
crontab -u aimaster -l

# Cron 재시작
sudo systemctl restart cron
```

---

## 문제 해결

### 1. Frontend 접속 불가

```bash
# 프로세스 확인
ps aux | grep next

# 포트 점유 확인
sudo lsof -i :3000

# 강제 종료 후 재시작
kill -9 <PID>
cd /home/aimaster/projects/MaLangEE/frontend
yarn dev
```

### 2. Backend 접속 불가

```bash
# 프로세스 확인
ps aux | grep uvicorn

# 포트 점유 확인
sudo lsof -i :8080

# 강제 종료 후 재시작
kill -9 <PID>
cd /home/aimaster/projects/MaLangEE/backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 3. DB 연결 오류

```bash
# PostgreSQL 상태
sudo systemctl status postgresql

# PostgreSQL 시작
sudo systemctl start postgresql

# DB 접속 테스트
psql -h localhost -U malangee_user -d malangee
```

### 4. 배포 실패

**"fatal: Could not read from remote repository"**

- 해결: SSH 키 확인 → GitHub에 공개키 등록

**"npm: command not found"**

- 해결: `source ~/.bashrc` 후 재실행

**"Permission denied"**

- 해결: `chmod +x deploy.sh` 및 `chown aimaster:aimaster`

---

## 환경 설정

### Frontend (.env.production)

```bash
# /home/aimaster/projects/MaLangEE/frontend/.env.production
NEXT_PUBLIC_API_URL=http://49.50.137.35:8080
```

### Backend (환경 설정)

```bash
# /home/aimaster/projects/MaLangEE/backend
# FastAPI + PostgreSQL
# DB: postgresql://malangee_user:malangee_password@localhost:5432/malangee
# 포트: 8080
```

---

## API 테스트

```bash
# Backend 헬스체크
curl http://49.50.137.35:8080/api/health

# Frontend 헬스체크 (운영)
curl https://lb-dev-web-ai-117002060-f11523401681.kr.lb.naverncp.com/

# Frontend 헬스체크 (직접)
curl http://49.50.137.35:3000/
```

---

## 일일 점검 체크리스트

### 매일 아침

- [ ] Cron 작동 확인: `tail -f /var/log/MaLangEE_deploy.log`
- [ ] Frontend 접속 확인
- [ ] Backend API 접속 확인
- [ ] DB 접속 확인

### 주 1회

- [ ] Git 저장소 상태: `git status`
- [ ] 디스크 용량: `df -h`
- [ ] 로그 파일 정리
- [ ] 보안 업데이트: `sudo apt update && apt list --upgradable`

---

## 배포 통계

```bash
# 오늘 배포 횟수
grep "$(date +%Y-%m-%d)" /var/log/MaLangEE_deploy.log | wc -l

# 최근 배포 기록
tail -20 /var/log/MaLangEE_deploy.log

# 성공/실패 통계
grep "SUCCESS\|배포 완료" /var/log/MaLangEE_deploy.log | wc -l  # 성공
grep "ERROR\|FAILED" /var/log/MaLangEE_deploy.log | wc -l       # 실패
```

---

## 초기 서버 구축

### 1단계: 서버 초기화

```bash
sudo ./scripts/1-init_server.sh
# 배포 사용자(aimaster) 생성, Git 설치, Cron 등록
```

### 2단계: 환경 설정

```bash
./scripts/2-setup_env.sh
# Java, Node.js, Python, PostgreSQL 설치
```

---

## 보안 권장사항

1. **SSH 접근 제한**: firewall 규칙으로 특정 IP만 허용
2. **배포 권한**: `aimaster` 계정만 배포 스크립트 실행
3. **DB 암호**: 강력한 암호 사용 및 정기 변경
4. **로그 정리**: 개인정보 포함 로그는 정기적으로 삭제
5. **백업**: DB와 코드 저장소 정기 백업
