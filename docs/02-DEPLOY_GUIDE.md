# 🚀 운영 서버 배포 가이드 (Production Setup)

이 문서는 Ubuntu 24.04 LTS 서버에 MaLangEE 서비스를 처음부터 셋팅하고 배포하는 전체 과정을 다룹니다.

---



## 1. 서버 준비 (Prerequisites)

### 1.1 필수 패키지 설치
`aimaster` 계정으로 접속하여 진행합니다.

```bash
sudo apt-get update
sudo apt-get install -y git curl wget unzip build-essential
```

### 1.2 Docker 설치
```bash
# Docker 공식 설치 스크립트 사용
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 권한 부여 (재로그인 필요)
sudo usermod -aG docker $USER
```

### 1.3 Nginx 및 Certbot 설치
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

---

## 2. 프로젝트 클론 및 설정

### 2.1 코드 가져오기
```bash
mkdir -p /home/aimaster/projects
cd /home/aimaster/projects
git clone https://github.com/MaLangEECoperation/MaLangEE.git
cd MaLangEE
```

### 2.2 환경 변수 설정
`docker.env` 파일을 생성하고 보안 정보를 입력합니다.
**주의**: `docker.env.example`을 복사하여 사용하되, 비밀번호는 반드시 변경하세요.

```bash
cp docker.env.example docker.env
nano docker.env
```
_(API 키, DB 비밀번호 등 실제 운영 값 입력)_

---

## 3. 데이터베이스 셋팅 (Host PostgreSQL)

Docker 내부가 아닌 **Host OS**에 PostgreSQL을 설치합니다. (운영 안정성 및 데이터 보존 용이)

### 3.1 자동 설치 스크립트 실행
`database` 폴더 내의 스크립트를 사용하면 PG 설치, 외부 접속 설정, 유저 생성이 한 번에 완료됩니다.

```bash
cd /home/aimaster/projects/MaLangEE/database
chmod +x install_and_setup.sh
./install_and_setup.sh
```

### 3.2 수동 확인 사항
- `pg_hba.conf`에 `host all all 0.0.0.0/0 md5`가 추가되었는지 확인.
- `postgresql.conf`에 `listen_addresses = '*'`인지 확인.

---

## 4. Nginx 및 SSL 설정

### 4.1 도메인 연결 및 SSL 발급
Cloudflare 또는 DNS 제공자에서 `malangee.kro.kr` -> `49.50.137.35` (A 레코드) 설정 후 진행합니다.

```bash
# 인증서 발급 (Nginx 플러그인 사용)
sudo certbot --nginx -d malangee.kro.kr
```

**인증서 저장 경로 확인:**
- Public Key: `/etc/letsencrypt/live/malangee.kro.kr/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/malangee.kro.kr/privkey.pem`

### 4.2 자동 갱신(Auto Renewal) 확인
Certbot 설치 시 자동으로 갱신 타이머가 등록됩니다. 정상 동작 여부를 테스트합니다.

```bash
# 갱신 시뮬레이션
sudo certbot renew --dry-run
```

### 4.3 프로젝트 Nginx 설정 적용
프로젝트에 포함된 최적화된 설정을 심볼릭 링크로 연결합니다.

```bash
# 기본 설정 백업
sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak

# 프로젝트 설정 연결 (절대 경로 사용 권장)
sudo ln -s /home/aimaster/projects/MaLangEE/nginx.conf /etc/nginx/nginx.conf

# 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
```

> **참고**: `nginx.conf` 내부에서 위 4.1의 SSL 인증서 경로를 참조하고 있으므로, 인증서 발급이 먼저 완료되어야 Nginx가 정상 구동됩니다.

---

## 5. 애플리케이션 배포

### 5.1 Docker Build & Run (수동)
```bash
cd /home/aimaster/projects/MaLangEE

# 기존 컨테이너 중지 및 삭제
docker-compose down

# 이미지 빌드 및 실행 (Detached Mode)
docker-compose up -d --build
```

### 5.2 자동 배포 스크립트 사용 (권장)
`deploy.sh` 스크립트는 Git Pull부터 빌드, 재시작까지 자동화해줍니다.

```bash
chmod +x deploy.sh

# 전체 배포 (Git Pull + Build + Restart)
./deploy.sh all

# 특정 서비스만 배포
./deploy.sh backend
./deploy.sh frontend
```

---

## 6. 배포 후 점검 (Verification)

### 6.1 서비스 상태 확인
```bash
docker-compose ps
```
- `frontend`: Up (Ports: 3000/tcp)
- `backend`: Up (Ports: 8080/tcp)
- `ai-engine`: Up (No Ports exposed externally)

### 6.2 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
```

### 6.3 접속 테스트
- **웹**: [https://malangee.kro.kr](https://malangee.kro.kr) 접속 확인
- **API**: `https://malangee.kro.kr/api/health` 응답 확인

---

## 7. 트러블슈팅

### Q. Nginx 502 Bad Gateway
- 백엔드 컨테이너가 아직 부팅 중이거나 죽었을 수 있습니다. `docker-compose logs backend`를 확인하세요.
- 포트 매핑 확인: `docker-compose.yml`에서 backend가 8080, frontend가 3000인지 확인.

### Q. Database Connection Refused
- `docker.env`의 `DATABASE_URL` 호스트가 `host.docker.internal`인지 확인하세요.
- 호스트의 PostgreSQL 설정(`pg_hba.conf`)에서 외부(Docker 네트워크) 접속을 허용했는지 확인하세요.

### Q. SSL 인증서 만료
- Certbot이 자동 갱신되지만, 강제 갱신이 필요한 경우: `sudo certbot renew --force-renewal`
