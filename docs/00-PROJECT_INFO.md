# 📘 MaLangEE 프로젝트 핵심 정보

> **모든 팀원이 가장 먼저 확인해야 할 프로젝트 필수 정보입니다.**  
> IP, 포트, 계정 정보가 변경되면 이 문서만 업데이트하세요.

---

## 🌐 서비스 접속 정보 (Production)

> **중요**: 모든 서비스는 **Nginx**(`malangee.kro.kr`)를 통해 **HTTPS**로 서빙됩니다.  
> `docker-compose` 설정상 백엔드/프론트엔드 컨테이너의 포트(3000, 8080)는 호스트에 직접 노출되지 않으며, 오직 Nginx를 통해서만 접근 가능합니다.

| 서비스 | URL | 설명 |
|:---:|---|---|
| **Frontend** | [https://malangee.kro.kr](https://malangee.kro.kr) | 사용자 웹 인터페이스 (Next.js) |
| **Backend API** | [https://malangee.kro.kr/api/v1](https://malangee.kro.kr/api/v1) | REST API 서버 (ProxyPass) |

| **Database** | `49.50.137.35:5432` | PostgreSQL (Host 직접 설치) |

---

## 🖥️ 서버 접속 정보 (SSH)

- **Host IP**: `49.50.137.35`
- **Domain**: `malangee.kro.kr`
- **OS**: Ubuntu 24.04 LTS
- **SSH 계정**: `aimaster`
- **SSH 접속**:
  ```bash
  ssh aimaster@49.50.137.35
  ```

---

## 🛠️ 기술 스택 및 버전
개발 및 배포 환경을 일치시켜 주세요.

| 구분 | 기술 | 버전 | 비고 |
|---|---|---|---|
| **Language** | Java | **JDK 17** | OpenJDK 17.0.17 |
| | Node.js | **v20.x** | v20.19.6 (LTS) |
| | Python | **3.12+** | 3.12.3 |
| **Framework** | Spring Boot | **3.2.0** | Maven 빌드 |
| | Next.js | **16.1.0** | React 기반, TypeScript |
| **Database** | PostgreSQL | **15+** | 15.15 |

---

## 📂 주요 디렉토리 경로 (Server)

| 경로 | 설명 |
|---|---|
| `/home/aimaster/projects/MaLangEE` | **프로젝트 루트** (Git 저장소) |
| `/home/aimaster/projects/MaLangEE/deploy.sh` | **배포 스크립트** |
| `/var/log/MaLangEE_deploy.log` | **배포 로그** |
| `/home/aimaster/projects/MaLangEE/nginx.conf` | **Nginx 설정** (Docker 마운트) |

---

## 🔐 데이터베이스 정보

- **Database Name**: `malangee`
- **User**: `aimaster`
- **Password**: *(보안상 별도 공유 - docker.env 확인)*
- **Port**: `5432`

---

## 🔄 포트 맵 (Port Map)

| 내부 포트 | 호스트 노출 | 서비스 | 비고 |
|:---:|:---:|---|---|
| **3000** | ❌ (Internal) | Frontend | Nginx가 리버스 프록시 처리 |
| **8080** | ❌ (Internal) | Backend | Nginx가 `/api/v1`으로 프록시 |

| **80/443** | ✅ 80/443 | **Nginx** | **외부 진입점 (Entrypoint)** |
| **5432** | ✅ 5432 | PostgreSQL | Host Process |
