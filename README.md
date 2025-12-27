# MaLangEE

자동 배포 기능이 적용된 AI 프로젝트입니다.

---

## ✨ 주요 기능

- ✅ **자동 배포**: 10분마다 GitHub 코드 자동 동기화
- ✅ **Cron 기반**: 별도 설정 없이 자동 실행
- ⏸️ **GitHub Actions**: 선택사항 (빠른 배포 원할 시 추가 설정)

---

## 🚀 빠른 시작

### 1️⃣ 배포 상태 확인
```bash
# 배포 로그 실시간 확인
tail -f /var/log/MaLangEE_deploy.log
```

### 2️⃣ 저장소 상태 확인
```bash
cd /home/aimaster/projects/MaLangEE && git status
```

### 3️⃣ 배포 수동 실행 (지금 바로)
```bash
/home/aimaster/deploy.sh
```

---

## 🔧 배포 설정 정보

| 항목 | 값 |
|------|-----|
| **배포 사용자** | aimaster |
| **프로젝트 경로** | /home/aimaster/projects/MaLangEE |
| **GitHub 저장소** | https://github.com/MaLangEECoperation/MaLangEE.git |
| **브랜치** | main |
| **배포 방식** | Cron (10분마다) |
| **배포 스크립트** | /home/aimaster/deploy.sh |
| **배포 로그** | /var/log/MaLangEE_deploy.log |

---

## 📋 Cron 자동 배포

### 작동 방식
```
매 10분마다 자동 실행
    ↓
git fetch origin main
    ↓
git reset --hard origin/main
    ↓
배포 완료 (로그 기록)
```

### Cron 설정 확인
```bash
crontab -u aimaster -l
# 출력: */10 * * * * /home/aimaster/deploy.sh >> /var/log/MaLangEE_deploy.log 2>&1
```

---

## 📚 상세 가이드

| 문서 | 목적 |
|------|------|
| [docs/SERVER_DEPLOYMENT_INFO.md](docs/SERVER_DEPLOYMENT_INFO.md) | 🚀 배포 관리 & 모니터링 |

---

## ⚡ 자주 사용되는 명령어

### 배포 모니터링
```bash
# 배포 로그 보기 (실시간)
tail -f /var/log/MaLangEE_deploy.log

# 최근 배포 로그 보기
tail -20 /var/log/MaLangEE_deploy.log

# 배포 횟수 확인 (오늘)
grep "$(date +%Y-%m-%d)" /var/log/MaLangEE_deploy.log | wc -l
```

### 저장소 관리
```bash
# 저장소 상태 확인
cd /home/aimaster/projects/MaLangEE && git status

# 최근 커밋 확인
cd /home/aimaster/projects/MaLangEE && git log --oneline -5

# 원격과 비교
cd /home/aimaster/projects/MaLangEE && git fetch origin main
```

### 배포 관리
```bash
# 지금 바로 배포
/home/aimaster/deploy.sh

# Cron 설정 확인
crontab -u aimaster -l

# 서비스 상태 확인
sudo systemctl status cron
```

---

## 🔄 배포 흐름

### GitHub에 Push 후
```
1. GitHub에 코드 push
   ↓
2. (최대 10분 대기)
   ↓
3. Cron이 자동으로 배포 스크립트 실행
   ↓
4. 서버의 코드 자동 업데이트
   ↓
5. 배포 로그에 기록
```

### 또는 수동 배포
```
1. /home/aimaster/deploy.sh 실행
   ↓
2. git fetch + reset --hard 실행
   ↓
3. 배포 완료
```

---

## 🆘 문제 해결

### 배포가 안 될 때
```bash
# 1. 배포 로그 확인
tail -f /var/log/MaLangEE_deploy.log

# 2. Cron 상태 확인
sudo systemctl status cron

# 3. 저장소 상태 확인
cd /home/aimaster/projects/MaLangEE && git status

# 4. 수동 배포 테스트
/home/aimaster/deploy.sh
```

### Cron 서비스 재시작
```bash
# Cron 시작
sudo systemctl start cron

# 자동 시작 설정
sudo systemctl enable cron
```

---

## 📝 개발 워크플로우

### 1️⃣ 로컬에서 개발
```bash
git clone https://github.com/MaLangEECoperation/MaLangEE.git
cd MaLangEE
# 코드 수정...
```

### 2️⃣ 커밋 및 푸시
```bash
git add .
git commit -m "기능 설명"
git push origin main
```

### 3️⃣ 자동 배포 (10분 이내)
- Cron이 자동으로 배포 실행
- 또는 수동으로 `/home/aimaster/deploy.sh` 실행

### 4️⃣ 배포 확인
```bash
# 배포 로그 확인
tail -f /var/log/MaLangEE_deploy.log

# 서버의 코드 확인
cd /home/aimaster/projects/MaLangEE && git log --oneline -1
```

---

## ✅ 배포 체크리스트

### 배포 전
- [ ] GitHub에 변경사항 push됨
- [ ] 현재 저장소 상태 확인: `git status`

### 배포 중
- [ ] Cron이 10분마다 자동 실행 중
- [ ] 또는 수동으로 배포: `/home/aimaster/deploy.sh`

### 배포 후
- [ ] 배포 로그에 "배포 완료" 메시지 확인
- [ ] 서버의 최신 커밋 확인: `git log --oneline -1`

---

## 📌 주의사항

⚠️ **배포 정책**
- 모든 변경은 **GitHub**에서만 관리
- 서버에서 수동 수정 금지 (배포 시 덮어써짐)
- Cron이 **10분마다** 실행되므로 최대 10분 지연

---

## 🔗 관련 링크

-  **[docs/SERVER_DEPLOYMENT_INFO.md](docs/SERVER_DEPLOYMENT_INFO.md)** - 서버 설정 & 배포 관리
- 🔧 **[scripts/init_ubuntu_server.sh](scripts/init_ubuntu_server.sh)** - 서버 초기화 스크립트

---

## 📞 지원

문제가 발생하면:

1. **배포 로그 확인**: `/var/log/MaLangEE_deploy.log`
2. **Cron 상태 확인**: `sudo systemctl status cron`
3. **[docs/SERVER_DEPLOYMENT_INFO.md](docs/SERVER_DEPLOYMENT_INFO.md) - 문제 해결** 섹션 참고
4. **수동 배포 테스트**: `/home/aimaster/deploy.sh`

---

**최종 업데이트**: 2025-12-27
