#!/bin/bash

# ==========================================
# MaLangEE Database Setup Script (All-in-One)
# ==========================================

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== MaLangEE PostgreSQL 자동 설치 및 설정 스크립트 ===${NC}"

# 1. PostgreSQL 설치 확인 및 설치
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}[1/5] PostgreSQL이 설치되어 있지 않습니다. 설치를 시작합니다...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    echo -e "${GREEN}✓ 설치 완료${NC}"
else
    echo -e "${GREEN}[1/5] PostgreSQL이 이미 설치되어 있습니다.${NC}"
fi

# 버전 확인 (경로 설정을 위해)
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
CONF_DIR="/etc/postgresql/$PG_VERSION/main"
echo -e "PostgreSQL 버전: $PG_VERSION"
echo -e "설정 파일 경로: $CONF_DIR"

# 2. 설정 파일 수정 (외부 접속 허용)
echo -e "${YELLOW}[2/5] 외부 접속 설정 확인 및 수정...${NC}"

if [ -d "$CONF_DIR" ]; then
    # postgresql.conf: listen_addresses = '*'
    if sudo grep -q "listen_addresses = '*'" "$CONF_DIR/postgresql.conf"; then
        echo -e "  - listen_addresses 이미 설정됨"
    else
        echo -e "  - listen_addresses 설정 변경 ('*' 로 설정)"
        # 기존 설정을 주석 처리하고 새로 추가하거나 sed로 변경
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$CONF_DIR/postgresql.conf"
        sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$CONF_DIR/postgresql.conf"
        
        # 만약 위 sed로도 안 바뀌었다면(주석이 다르거나 등) 강제 추가
        if ! sudo grep -q "listen_addresses = '*'" "$CONF_DIR/postgresql.conf"; then
            echo "listen_addresses = '*'" | sudo tee -a "$CONF_DIR/postgresql.conf"
        fi
    fi

    # pg_hba.conf: host all all 0.0.0.0/0 md5
    if sudo grep -q "0.0.0.0/0" "$CONF_DIR/pg_hba.conf"; then
        echo -e "  - 외부 접근 제어(pg_hba.conf) 이미 설정됨"
    else
        echo -e "  - 외부 접근 제어 추가 (0.0.0.0/0 허용)"
        echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$CONF_DIR/pg_hba.conf"
    fi
    
    # 서비스 재시작
    echo -e "  - 서비스 재시작 중..."
    sudo systemctl restart postgresql
    echo -e "${GREEN}✓ 설정 완료 및 재시작됨${NC}"
else
    echo -e "${RED}⚠️ 설정 폴더를 찾을 수 없습니다: $CONF_DIR${NC}"
    echo "수동 설정이 필요할 수 있습니다."
fi

# 3. 유저(Role) 생성
echo -e "${YELLOW}[3/5] 데이터베이스 유저(aimaster) 생성 확인...${NC}"
# postgres 유저로 실행
if [ -f "setup_roles.sql" ]; then
    sudo -u postgres psql -f setup_roles.sql
else
    echo -e "${YELLOW}  - 'setup_roles.sql'이 없어 'setup_roles.sample.sql'을 사용합니다.${NC}"
    sudo -u postgres psql -f setup_roles.sample.sql
fi
echo -e "${GREEN}✓ 유저 처리 완료${NC}"

# 4. 데이터베이스 생성
echo -e "${YELLOW}[4/5] 데이터베이스(malangee) 생성 확인...${NC}"
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw malangee; then
    echo -e "${GREEN}  - malangee DB가 이미 존재합니다.${NC}"
else
    echo -e "  - malangee DB 생성 중..."
    sudo -u postgres createdb -O aimaster malangee
    echo -e "${GREEN}✓ DB 생성 완료${NC}"
fi

# 5. 스키마 및 데이터 복원
# 주의: 이미 데이터가 있는 경우 중복 에러가 날 수 있으므로, 초기 셋팅용으로만 사용 권장
echo -e "${YELLOW}[5/5] 데이터 복원 (Schema & Data)...${NC}"
read -p "데이터를 복원하시겠습니까? (기존 데이터 위에 덮어쓰거나 에러가 날 수 있습니다) [y/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export PGPASSWORD=aimaster123
    
    echo "  - 스키마 복원 중..."
    psql -U aimaster -d malangee -h localhost -f schema.sql > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 스키마 복원 성공${NC}"
    else
        echo -e "${RED}⚠️ 스키마 복원 중 오류 발생 (이미 테이블이 존재할 수 있음)${NC}"
    fi

    echo "  - 데이터 복원 중..."
    psql -U aimaster -d malangee -h localhost -f initial_data.sql > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 데이터 복원 성공${NC}"
    else
        echo -e "${RED}⚠️ 데이터 복원 중 오류 발생 (데이터 중복 등)${NC}"
    fi
else
    echo "데이터 복원을 건너뜁니다."
fi

echo ""
echo -e "${GREEN}=== 모든 설정이 완료되었습니다! ===${NC}"
echo -e "접속 정보:"
echo -e "  Host: localhost (또는 서버 IP)"
echo -e "  Port: 5432"
echo -e "  DB:   malangee"
echo -e "  User: aimaster"
echo -e "  PW:   aimaster123"
