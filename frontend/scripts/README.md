# Frontend scripts 사용법

위 문서는 `frontend/scripts` 폴더에 있는 개발/운영 보조 스크립트들의 용도와 사용법, 트러블슈팅을 정리합니다.

## 대상 파일

- **`restart-dev.sh`** — 개발 서버(Next) 포트 정리 후 포트 3000으로 dev 실행 (단발성)
- **`start-frontend.sh`** — user-level systemd에서 호출하는 시작 스크립트 (Production/Dev 모드 지원)
- **`manage-frontend.sh`** — 서비스 관리용 스크립트 (start/stop/restart/status)
- **`generate-favicon.js`** — 파비콘 생성 유틸리티

## 주의사항

- 대부분 작업은 사용자(`aimaster`) 권한으로 수행하도록 설계되어 있습니다. 루트(root)로 실행된 기존 프로세스나 시스템 서비스가 포트를 점유했다면 관리자 권한으로 정리해야 합니다.
- 스크립트는 `lsof`, `ss`, `systemctl --user`, `sharp` 등을 사용합니다.

---

## 1) `restart-dev.sh`

**경로**: `frontend/scripts/restart-dev.sh`

### 목적
- 로컬에서 빠르게 개발 서버를 재시작할 때 사용하는 원클릭 스크립트입니다.
- 포트(3000, 3001) 점유를 확인하여 기존 프로세스를 종료하고 `.next/dev/lock`을 제거한 뒤 `npm run dev`를 실행합니다.
- 단순 포트 kill 뿐만 아니라 `malangee-frontend` 또는 `next` 관련 시스템/유저 서비스도 탐지하여 중지를 시도합니다.

### 사용법
```bash
./scripts/restart-dev.sh
```

### 상세 동작
1. `lsof`로 3000/3001 포트 PID를 찾아 종료 (SIGTERM -> SIGKILL).
2. `systemctl` (User/System)을 검색해 관련 서비스를 중지 시도.
3. `ps` 목록에서 Next.js 관련 프로세스 패턴을 찾아 종료.
4. `.next/dev/lock` 파일 삭제.
5. `PORT=3000 NODE_ENV=development npm run dev` 실행.

---

## 2) `start-frontend.sh`

**경로**: `frontend/scripts/start-frontend.sh`

### 목적
- Systemd 서비스(`malangee-frontend.service`)에서 `ExecStart`로 호출하기 위해 설계된 시작 스크립트입니다.
- **Production(Standalone)** 모드와 **Development** 모드를 모두 지원합니다.

### 사용법
```bash
# 개발 모드 (기본값)
./scripts/start-frontend.sh development

# 프로덕션 모드 (Standalone 빌드 실행)
./scripts/start-frontend.sh production
```

### 상세 동작
1. 현재 사용자 소유의 3000/3001 포트 리스너 종료.
2. `.next/dev/lock` 삭제.
3. **Mode 분기**:
   - `production`: `NODE_ENV=production` 설정. `public/` 및 `.next/static/` 정적 파일을 `.next/standalone` 내부로 복사한 뒤 `node .next/standalone/server.js` 실행.
   - `development`: `NODE_ENV=development` 설정. `yarn dev` 또는 `npm run dev` 실행.

---

## 3) `manage-frontend.sh`

**경로**: `frontend/scripts/manage-frontend.sh`

### 목적
- `malangee-frontend.service` (Systemd User Unit)를 쉽게 제어하기 위한 래퍼(Wrapper) 스크립트입니다.
- 수동으로 프로세스를 죽이고 서비스를 켜는 과정을 자동화합니다.

### 사용법
```bash
# 재시작 (권장: 프로세스 정리 -> 서비스 시작)
./scripts/manage-frontend.sh restart

# 시작 / 중지 / 상태 확인
./scripts/manage-frontend.sh start
./scripts/manage-frontend.sh stop
./scripts/manage-frontend.sh status
```

---

## 4) `generate-favicon.js`

**경로**: `frontend/scripts/generate-favicon.js`

### 목적
- 고해상도 PNG 이미지(`public/images/m.png`)를 기반으로 `public/favicon.ico` 파일을 생성합니다.
- `sharp` 라이브러리를 사용하여 리사이징 및 변환을 수행합니다.

### 사용법
```bash
node scripts/generate-favicon.js
```
> **참고**: `npm install sharp`가 필요할 수 있습니다.

---

## Systemd User Unit 가이드

파일 위치: `~/.config/systemd/user/malangee-frontend.service`

이 Unit 파일은 `start-frontend.sh`를 실행하도록 설정되어야 합니다.

### 서비스 관리 명령어
```bash
# 즉시 시작 및 부팅 시 자동 시작 활성화
systemctl --user enable --now malangee-frontend.service

# 로그 실시간 확인
journalctl --user -u malangee-frontend.service -f
```

## 트러블슈팅

### EADDRINUSE (Address already in use)
- **현상**: 포트 3000이 이미 사용 중이라 서버가 뜨지 않음.
- **해결**: `./scripts/manage-frontend.sh restart` 실행. 만약 해결되지 않으면 `sudo lsof -i :3000`으로 루트 권한 프로세스가 있는지 확인하고 `sudo kill` 하세요.

### .next/dev/lock 이슈
- **현상**: Dev 서버가 3000번 대신 3001번 등으로 뜸.
- **해결**: `lock` 파일이 남아서 그렇습니다. 스크립트들이 자동으로 지워주지만, 수동으로 `rm -f frontend/.next/dev/lock` 해도 됩니다.
