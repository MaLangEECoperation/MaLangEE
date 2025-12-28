# 서버 배포 설정 정보 (개발자용)

## 📌 서버 배포 환경 설정

MaLangEE 프로젝트의 자동 배포가 설정되어 있습니다. 이 문서에서 배포 상태를 확인하고 관리하는 방법을 안내합니다.

---

## 🔧 서버 설정 정보

### 배포 사용자
```
사용자명: aimaster
홈 디렉토리: /home/aimaster
```

### GitHub 저장소
```
저장소 URL: https://github.com/MaLangEECoperation/MaLangEE.git
브랜치: main
프로젝트 경로: /home/aimaster/projects/MaLangEE
```

### 배포 스크립트
```
배포 스크립트: /home/aimaster/deploy.sh
배포 로그: /var/log/MaLangEE_deploy.log
```

---

## ⚙️ Cron 자동 배포 설정

### 자동 배포 정보
```
실행 주기: 10분마다
명령어: /home/aimaster/deploy.sh
로그: /var/log/MaLangEE_deploy.log
```

### 배포 흐름
```
매 10분마다 (00, 10, 20, 30분...)
    ↓
Cron이 /home/aimaster/deploy.sh 실행
    ↓
git fetch origin main
    ↓
git reset --hard origin/main (최신 코드로 강제 업데이트)
    ↓
배포 완료 (로그 기록)
```

---

## 🚀 배포 관리 가이드

### 1️⃣ 배포 로그 확인

**실시간 배포 로그 보기:**
```bash
tail -f /var/log/MaLangEE_deploy.log
```

**최근 20줄 확인:**
```bash
tail -20 /var/log/MaLangEE_deploy.log
```

**특정 날짜의 배포 로그:**
```bash
grep "2024-12-27" /var/log/MaLangEE_deploy.log
```

**배포 완료 시간만 보기:**
```bash
grep "배포 완료" /var/log/MaLangEE_deploy.log
```

**로그 파일 크기 확인:**
```bash
du -h /var/log/MaLangEE_deploy.log
```

---

### 2️⃣ Cron 설정 확인

**Cron 설정 보기:**
```bash
crontab -u aimaster -l
```

**출력 예시:**
```
*/10 * * * * /home/aimaster/deploy.sh >> /var/log/MaLangEE_deploy.log 2>&1
```

**설명:**
- `*/10` = 10분마다
- `* * * *` = 매일, 매시간
- `/home/aimaster/deploy.sh` = 실행 스크립트
- `>> /var/log/MaLangEE_deploy.log 2>&1` = 로그 파일에 기록

---

### 3️⃣ 저장소 상태 확인

**Git 상태 확인:**
```bash
cd /home/aimaster/projects/MaLangEE && git status
```

**최근 커밋 확인:**
```bash
cd /home/aimaster/projects/MaLangEE && git log --oneline -5
```

**원격 저장소와 비교:**
```bash
cd /home/aimaster/projects/MaLangEE && git fetch origin main
cd /home/aimaster/projects/MaLangEE && git log --oneline -5 origin/main
```

**현재 브랜치 확인:**
```bash
cd /home/aimaster/projects/MaLangEE && git branch -a
```

**로컬과 원격의 차이 확인:**
```bash
cd /home/aimaster/projects/MaLangEE && git diff HEAD origin/main
```

---

### 4️⃣ 배포 스크립트 수동 실행

**지금 바로 배포 실행:**
```bash
/home/aimaster/deploy.sh
```

**배포 중 로그 확인:**
```bash
# 터미널 1: 배포 실행
/home/aimaster/deploy.sh

# 터미널 2: 로그 모니터링
tail -f /var/log/MaLangEE_deploy.log
```

**배포 후 결과 확인:**
```bash
# 배포 완료 메시지 확인
tail -5 /var/log/MaLangEE_deploy.log

# 저장소 상태 확인
cd /home/aimaster/projects/MaLangEE && git log --oneline -1
```

---

## 📊 배포 모니터링

### 배포 빈도 모니터링

**오늘 배포된 횟수:**
```bash
grep "$(date +%Y-%m-%d)" /var/log/MaLangEE_deploy.log | wc -l
```

**시간대별 배포 현황:**
```bash
grep "$(date +%Y-%m-%d)" /var/log/MaLangEE_deploy.log | grep "배포 시작"
```

---

### 배포 성공/실패 확인

**배포 성공한 경우:**
```bash
grep "배포 완료" /var/log/MaLangEE_deploy.log
```

**배포 실패한 경우:**
```bash
grep -i "error" /var/log/MaLangEE_deploy.log
```

---

### 배포 지연 확인

**마지막 배포 시간:**
```bash
tail -1 /var/log/MaLangEE_deploy.log
```

**배포가 10분 이상 지연되었는지 확인:**
```bash
# Cron 데몬 상태 확인
sudo systemctl status cron

# Cron 로그 확인
sudo journalctl -u cron -n 20
```

---

## 🔍 배포 문제 해결

### 배포가 작동하지 않을 때

#### 1. Cron 데몬 확인
```bash
# Cron 서비스 상태
sudo systemctl status cron

# Cron 서비스 시작
sudo systemctl start cron

# Cron 자동 시작 설정
sudo systemctl enable cron
```

#### 2. Cron 로그 확인
```bash
# Cron 실행 로그
sudo journalctl -u cron -f

# 또는 syslog에서
tail -f /var/log/syslog | grep CRON
```

#### 3. 배포 스크립트 권한 확인
```bash
# 스크립트 권한 확인
ls -la /home/aimaster/deploy.sh

# 실행 권한이 없으면
chmod +x /home/aimaster/deploy.sh
```

#### 4. 배포 스크립트 수동 테스트
```bash
# 스크립트 수동 실행
/home/aimaster/deploy.sh

# 결과 확인
echo $?  # 0이면 성공, 0이 아니면 실패
```

#### 5. 저장소 접근 확인
```bash
# 저장소 상태 확인
cd /home/aimaster/projects/MaLangEE && git status

# Git 인증 확인
cd /home/aimaster/projects/MaLangEE && git fetch origin main
```

---

## 📝 배포 스크립트 내용

배포 스크립트(`/home/aimaster/deploy.sh`)는 다음과 같이 작동합니다:

```bash
#!/bin/bash

REPO_PATH="/home/aimaster/projects/MaLangEE"
LOG_FILE="/var/log/MaLangEE_deploy.log"

# 배포 시작 로그 기록
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 배포 시작" >> $LOG_FILE

# 저장소 업데이트
cd $REPO_PATH || exit 1
git fetch origin main >> $LOG_FILE 2>&1
git reset --hard origin/main >> $LOG_FILE 2>&1

# 배포 완료 로그 기록
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 배포 완료" >> $LOG_FILE
```

### 각 단계 설명

1. **로그 기록**: 배포 시작 시간 기록
2. **저장소 이동**: 프로젝트 디렉토리로 이동
3. **최신 코드 다운로드**: `git fetch origin main`으로 최신 정보 가져옴
4. **코드 업데이트**: `git reset --hard origin/main`으로 강제 업데이트
5. **로그 기록**: 배포 완료 시간 기록

---

## 🔄 배포 전/후 확인 체크리스트

### 배포 전
- [ ] GitHub에 변경사항 커밋됨
- [ ] GitHub에 푸시됨
- [ ] 현재 저장소 상태 확인: `git status`
- [ ] 최근 커밋 확인: `git log --oneline -1`

### 배포 중
- [ ] Cron 자동 실행 대기 (최대 10분)
- [ ] 또는 수동으로 배포: `/home/aimaster/deploy.sh`
- [ ] 배포 로그 모니터링: `tail -f /var/log/MaLangEE_deploy.log`

### 배포 후
- [ ] 로그에서 "배포 완료" 메시지 확인
- [ ] 저장소 상태 확인: `cd /home/aimaster/projects/MaLangEE && git status`
- [ ] 최신 커밋이 반영되었는지 확인: `git log --oneline -1`
- [ ] 배포된 코드 테스트

---

## 💡 유용한 명령어 모음

### 배포 빠른 명령어
```bash
# 지금 바로 배포
/home/aimaster/deploy.sh

# 배포 로그 보기 (실시간)
tail -f /var/log/MaLangEE_deploy.log

# 저장소 상태
cd /home/aimaster/projects/MaLangEE && git status

# 최근 커밋 5개
cd /home/aimaster/projects/MaLangEE && git log --oneline -5

# Cron 설정 확인
crontab -u aimaster -l

# 서비스 상태
sudo systemctl status cron
```

### 로그 분석 명령어
```bash
# 오늘의 배포 횟수
grep "$(date +%Y-%m-%d)" /var/log/MaLangEE_deploy.log | wc -l

# 배포 성공 횟수
grep "배포 완료" /var/log/MaLangEE_deploy.log | wc -l

# 최근 배포 시간
tail -1 /var/log/MaLangEE_deploy.log

# 배포 소요 시간 (첫 번째 배포)
head -1 /var/log/MaLangEE_deploy.log
tail -1 /var/log/MaLangEE_deploy.log
```

---

## ⚠️ 주의사항

### 배포 중 주의할 점

1. **강제 업데이트**: `git reset --hard`는 로컬 변경사항을 모두 덮어씌움
   - 서버에서 수동 수정 금지
   - 모든 변경은 GitHub에서 관리

2. **배포 중복 방지**: Cron이 10분마다 실행되므로
   - 동시에 여러 배포 명령 실행 금지
   - 배포 완료 후 최소 1분 대기 후 다시 실행

3. **로그 크기**: 로그 파일이 커질 수 있으므로
   - 주기적으로 로그 확인
   - 필요시 로그 로테이션 설정

### 배포 실패 시

1. 배포 로그 확인: `tail -f /var/log/MaLangEE_deploy.log`
2. Git 상태 확인: `cd /home/aimaster/projects/MaLangEE && git status`
3. Cron 상태 확인: `sudo systemctl status cron`
4. 수동 배포 테스트: `/home/aimaster/deploy.sh`

---

## 🔗 관련 문서

현재 문서: `02-DEPLOYMENT_GUIDE.md` (배포 관리 가이드)

---

---

## � 문제 해결

### PostgreSQL 연결 오류: "connection refused"

#### 증상
```
psql: error: connection to server at "localhost" (127.0.0.1), port 5432 failed
Is the server running on that host and accepting TCP/IP connections?
```

#### 원인
1. **PostgreSQL 서비스 미실행**
2. **pg_hba.conf 파일 손상**
3. **포트 바인딩 실패**

#### 진단 명령
```bash
# 서비스 상태 확인
sudo systemctl status postgresql

# 클러스터 상태 확인
sudo pg_lsclusters

# 로그 확인
sudo tail -50 /var/log/postgresql/postgresql-*.log

# 프로세스 확인
sudo ps aux | grep '[p]ostgres'
```

#### 해결 방법

**1️⃣ pg_hba.conf 파일 손상 시**
```bash
# 손상된 줄 제거
sudo sed -i '123d' /etc/postgresql/16/main/pg_hba.conf

# 또는 샘플 파일로 복구
sudo cp /usr/share/postgresql/16/pg_hba.conf.sample /etc/postgresql/16/main/pg_hba.conf

# 권한 설정
sudo chmod 640 /etc/postgresql/16/main/pg_hba.conf
sudo chown postgres:postgres /etc/postgresql/16/main/pg_hba.conf

# 재시작
sudo systemctl restart postgresql
```

**2️⃣ 서비스 시작**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # 부팅 시 자동 시작
```

**3️⃣ 클러스터 재초기화 (마지막 수단)**
```bash
# ⚠️ 모든 데이터가 삭제됩니다!
sudo pg_dropcluster 16 main --stop
sudo pg_createcluster 16 main
sudo systemctl start postgresql
```

---

## �📞 지원

배포에 문제가 발생하면:

1. 배포 로그 확인: `/var/log/MaLangEE_deploy.log`
2. Cron 상태 확인: `sudo systemctl status cron`
3. 저장소 상태 확인: `cd /home/aimaster/projects/MaLangEE && git status`
4. 수동 배포 테스트: `/home/aimaster/deploy.sh`

위의 **문제 해결** 섹션을 먼저 확인하세요.
