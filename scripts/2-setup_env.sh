#!/bin/bash

###############################################
#  MaLangEE 개발 환경 자동 설치 스크립트
#  실행 방법: bash setup_dev_environment.sh
#  또는: ./setup_dev_environment.sh
#
#  설치 내용:
#  ├─ Java (JDK 17+)
#  ├─ Node.js (v18+)
#  ├─ Python (3.9+)
#  └─ PostgreSQL (13+)
#
#  OS: Ubuntu/Debian 기반
###############################################

# 공통 설정 로드
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# 프로젝트 경로
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_DIR="$PROJECT_ROOT"

echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║  $PROJECT_NAME 개발 환경 자동 설치 스크립트  ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# 1) 프로젝트 디렉토리 생성
print_header "1️⃣ 프로젝트 디렉토리 생성"


PROJECT_DIRS=(
    "$PROJECT_ROOT/frontend/node_modules"
    "$PROJECT_ROOT/backend/target"
    "$PROJECT_ROOT/backend/build"
    "$PROJECT_ROOT/ai-engine/venv"
    "$PROJECT_ROOT/database/data"
)

for dir in "${PROJECT_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "디렉토리 생성: $dir"
    else
        print_info "디렉토리 이미 존재: $dir"
    fi
done

# 2) 시스템 패키지 업데이트
print_header "2️⃣ 시스템 패키지 업데이트"

if ! command -v sudo &> /dev/null; then
    print_warning "sudo가 없습니다. 패키지 업데이트를 건너뜁니다."
else
    print_info "패키지 목록 업데이트 중..."
    sudo apt-get update -y &>/dev/null || print_warning "apt-get update 실패"
    print_success "패키지 업데이트 완료"
fi

# 3) Java 설치
print_header "3️⃣ Java 설치"

if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    print_success "Java 이미 설치됨: $JAVA_VERSION"
else
    print_info "Java 설치 중..."
    if command -v sudo &> /dev/null; then
        sudo apt-get install -y openjdk-17-jdk-headless &>/dev/null
        print_success "Java 설치 완료"
    else
        print_warning "Java 설치를 위해서는 sudo 권한이 필요합니다"
    fi
fi

# 4) Node.js 설치
print_header "4️⃣ Node.js 설치"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js 이미 설치됨: $NODE_VERSION"
else
    print_info "Node.js 설치 중..."
    if command -v sudo &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &>/dev/null
        sudo apt-get install -y nodejs &>/dev/null
        print_success "Node.js 설치 완료"
    else
        print_warning "Node.js 설치를 위해서는 sudo 권한이 필요합니다"
    fi
fi

# 5) Python 설치
print_header "5️⃣ Python 설치"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python 이미 설치됨: $PYTHON_VERSION"
else
    print_info "Python 설치 중..."
    if command -v sudo &> /dev/null; then
        sudo apt-get install -y python3 python3-venv python3-pip &>/dev/null
        print_success "Python 설치 완료"
    else
        print_warning "Python 설치를 위해서는 sudo 권한이 필요합니다"
    fi
fi

# 6) PostgreSQL 설치
print_header "6️⃣ PostgreSQL 설치"

if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version)
    print_success "PostgreSQL 이미 설치됨: $POSTGRES_VERSION"
else
    print_info "PostgreSQL 설치 중..."
    if command -v sudo &> /dev/null; then
        sudo apt-get install -y postgresql postgresql-contrib &>/dev/null
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        print_success "PostgreSQL 설치 및 시작 완료"
    else
        print_warning "PostgreSQL 설치를 위해서는 sudo 권한이 필요합니다"
    fi
fi

# 7) PostgreSQL 데이터베이스 및 사용자 생성 (대화형)
print_header "7️⃣ PostgreSQL 데이터베이스 및 사용자 생성"

if command -v psql &> /dev/null; then
    echo -e "${CYAN}PostgreSQL 설정을 진행합니다.${NC}\n"
    
    # config.sh의 기본값 사용
    read -p "데이터베이스명 (기본값: $DB_NAME): " DB_NAME_INPUT
    DB_NAME=${DB_NAME_INPUT:-"$DB_NAME"}
    
    read -p "데이터베이스 사용자명 (기본값: $DB_USER): " DB_USER_INPUT
    DB_USER=${DB_USER_INPUT:-"$DB_USER"}
    
    read -sp "데이터베이스 사용자 비밀번호 (기본값: $DB_PASSWORD): " DB_PASSWORD_INPUT
    DB_PASSWORD=${DB_PASSWORD_INPUT:-"$DB_PASSWORD"}
    echo ""
    
    # 입력 확인
    echo ""
    echo -e "${YELLOW}설정 정보:${NC}"
    echo "  • 데이터베이스명: $DB_NAME"
    echo "  • 사용자명: $DB_USER"
    echo "  • 비밀번호: ****** (입력됨)"
    echo ""
    
    read -p "위의 설정으로 진행하시겠습니까? (y/n): " CONFIRM
    
    if [[ $CONFIRM =~ ^[Yy]$ ]]; then
        # PostgreSQL 사용자와 데이터베이스 생성
        print_info "PostgreSQL 데이터베이스 및 사용자 생성 중..."
        
        # sudo -u postgres로 실행하여 데이터베이스 생성
        sudo -u postgres psql << EOFPSQL
-- 기존 사용자 삭제 (있으면)
DROP USER IF EXISTS "$DB_USER" CASCADE;

-- 새 사용자 생성
CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';

-- 기존 데이터베이스 삭제 (있으면)
DROP DATABASE IF EXISTS "$DB_NAME";

-- 새 데이터베이스 생성
CREATE DATABASE "$DB_NAME" OWNER "$DB_USER";

-- 권한 설정
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
ALTER USER "$DB_USER" CREATEDB;

-- 연결 권한 설정
\c "$DB_NAME"
GRANT ALL PRIVILEGES ON SCHEMA public TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
EOFPSQL
        
        if [ $? -eq 0 ]; then
            print_success "PostgreSQL 데이터베이스 및 사용자 생성 완료"
            echo ""
            echo -e "${CYAN}데이터베이스 연결 정보:${NC}"
            echo "  • Host: localhost"
            echo "  • Port: 5432"
            echo "  • Database: $DB_NAME"
            echo "  • User: $DB_USER"
            echo "  • Password: ****** (입력하신 비밀번호)"
            echo ""
            echo -e "${CYAN}연결 테스트:${NC}"
            echo "  psql -h localhost -U $DB_USER -d $DB_NAME"
        else
            print_error "PostgreSQL 데이터베이스 생성 실패"
        fi
    else
        print_warning "PostgreSQL 설정을 건너뛰었습니다."
        echo "  나중에 수동으로 설정하려면:"
        echo "  sudo -u postgres psql"
    fi
else
    print_warning "PostgreSQL이 설치되지 않았습니다."
fi

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✓ 설치 완료!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}📦 설치된 도구:${NC}"
echo ""

# 버전 확인
if command -v java &> /dev/null; then
    echo -e "  ${GREEN}✓ Java:${NC} $(java -version 2>&1 | head -1 | sed 's/^[ \t]*//')"
else
    echo -e "  ${YELLOW}⚠ Java:${NC} 설치 안됨"
fi

if command -v node &> /dev/null; then
    echo -e "  ${GREEN}✓ Node.js:${NC} $(node -v)"
else
    echo -e "  ${YELLOW}⚠ Node.js:${NC} 설치 안됨"
fi

if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✓ npm:${NC} $(npm -v)"
else
    echo -e "  ${YELLOW}⚠ npm:${NC} 설치 안됨"
fi

if command -v python3 &> /dev/null; then
    echo -e "  ${GREEN}✓ Python:${NC} $(python3 --version | cut -d' ' -f2)"
else
    echo -e "  ${YELLOW}⚠ Python:${NC} 설치 안됨"
fi

if command -v psql &> /dev/null; then
    echo -e "  ${GREEN}✓ PostgreSQL:${NC} $(psql --version | cut -d' ' -f3)"
else
    echo -e "  ${YELLOW}⚠ PostgreSQL:${NC} 설치 안됨"
fi

echo ""
echo -e "${CYAN}📁 생성된 디렉토리:${NC}"
echo "  • frontend/node_modules"
echo "  • backend/target (Build 결과물)"
echo "  • backend/build (Build 결과물)"
echo "  • ai-engine/venv"
echo "  • database/data"

echo ""
echo -e "${CYAN}🚀 다음 단계:${NC}"
echo ""
echo "  1️⃣ 필요한 설정값 수정:"
echo "     - 환경변수 설정 (.env 파일 생성)"
echo "     - Backend DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD 설정"
echo "     - JWT_SECRET 등 보안 정보"
echo "     - 포트 번호, API URL 등 환경 설정"
echo ""
echo "  2️⃣ 개발 의존성 설치:"
echo "     cd frontend && npm install"
echo "     cd ../backend && mvn clean install"
echo "     cd ../ai-engine && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo ""
echo "  3️⃣ 데이터베이스 테이블 생성 (필요시):"
echo "     psql -h localhost -U <데이터베이스_사용자> -d <데이터베이스명> -f database/init.sql"
echo ""
echo -e "${CYAN}📖 프로젝트 구조:${NC}"
echo ""
echo "  MaLangEE/"
echo "  ├── frontend/              # React/Vue 프론트엔드"
echo "  ├── backend/               # Java Spring Boot REST API"
echo "  ├── ai-engine/             # Python AI 엔진"
echo "  ├── database/              # PostgreSQL 설정"
echo "  ├── docs/                  # 문서"
echo "  └── scripts/               # 배포 및 설정 스크립트"
echo ""
echo -e "${GREEN}✓ 개발 환경 설치 완료!${NC}\n"
echo -e "${YELLOW}⚠ 주의:${NC} sudo 권한이 없으면 일부 설치가 건너뛰어질 수 있습니다."
echo ""
