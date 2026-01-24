# PostgreSQL Database Guide (MaLangEE)

## 1. 개요
이 디렉토리는 MaLangEE 프로젝트의 데이터베이스 설정, 스키마, 초기 데이터 및 **자동 설치 스크립트**를 포함합니다.
보안을 위해 **실제 운영 데이터와 비밀번호가 포함된 파일은 Git에 포함되지 않으며**, 대신 샘플 파일(`*.sample.sql`)이 제공됩니다.

### 📂 파일 목록
- **`install_and_setup.sh`**: ✨ **통합 설치 스크립트** (PostgreSQL 설치 + 설정 + DB 생성 + 데이터 복원)
- **`schema.sql`**: 데이터베이스 스키마 구조 (테이블, 인덱스 등)
- **`setup_roles.sample.sql`**: 유저 생성 스크립트 샘플 (기본 비밀번호 포함, 변경 권장)
- **`initial_data_sample.sql`**: 개발용 샘플 데이터 (PII 제거됨)
- *`setup_roles.sql`* (Ignored): 실제 비밀번호가 포함된 유저 생성 파일 (로컬 전용)
- *`initial_data.sql`* (Ignored): 실제 운영 데이터 덤프 (로컬 전용)

## 2. 빠르고 쉬운 설치 (추천)
새로운 서버나 개발 환경에서 DB를 빠르게 구축하려면 **`install_and_setup.sh`**를 사용하세요.

```bash
cd database
chmod +x install_and_setup.sh
./install_and_setup.sh
```
이 스크립트는 다음 작업을 자동으로 수행합니다:
1. PostgreSQL 설치 확인 (없으면 자동 설치)
2. 외부 접속 설정(`postgresql.conf`, `pg_hba.conf`) 자동 수정 (Docker 연동용)
3. 서비스 재시작
4. `aimaster` 유저 및 `malangee` DB 생성
5. 스키마 및 샘플 데이터 자동 복원

## 3. 수동 설정 방법 (상세)

### 3.1 접속 정보
- **Host**: `localhost` (Docker 컨테이너에서는 `host.docker.internal` 사용)
- **Port**: `5432`
- **Database**: `malangee`
- **User**: `aimaster`
- **Password**: `aimaster123` (기본값, 운영 환경에선 변경 필수)

### 3.2 수동 백업 및 복원
```bash
# 백업 (스키마만)
pg_dump -U aimaster -h localhost -d malangee --schema-only > schema.sql

# 백업 (데이터만) -> *Git 커밋 주의* (initial_data_sample.sql로 수정해서 올릴 것)
pg_dump -U aimaster -h localhost -d malangee --data-only --inserts > initial_data.sql

# 복원
psql -U aimaster -h localhost -d malangee -f schema.sql
psql -U aimaster -h localhost -d malangee -f initial_data_sample.sql
```

## 4. 보안 정책 (.gitignore)
- `docker.env`, `initial_data.sql`, `setup_roles.sql` 등 민감한 파일은 **Git에 업로드되지 않습니다.**
- GitHub에는 반드시 **`*.sample.sql`** 또는 **`*.example`** 파일만 커밋해야 합니다.
