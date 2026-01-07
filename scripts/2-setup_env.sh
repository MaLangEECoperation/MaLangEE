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
PROJECT_ROOT=$(get_project_path "$DEPLOY_USER" "$GITHUB_REPO")
ENV_DIR="$PROJECT_ROOT"

echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║  $PROJECT_NAME 개발 환경 자동 설치 스크립트  ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# 1) 프로젝트 디렉토리 생성
print_header "1️⃣ 프로젝트 디렉토리 생성"

# 프로젝트 루트 디렉토리 생성
if [ ! -d "$PROJECT_ROOT" ]; then
    mkdir -p "$PROJECT_ROOT"
    print_success "프로젝트 루트 디렉토리 생성: $PROJECT_ROOT"
else
    print_info "프로젝트 루트 디렉토리 이미 존재: $PROJECT_ROOT"
fi

# 하위 프로젝트 디렉토리 생성
PROJECT_DIRS=(
    "$PROJECT_ROOT/frontend"
    "$PROJECT_ROOT/backend"
    "$PROJECT_ROOT/ai-engine"
    "$PROJECT_ROOT/database"
)

for dir in "${PROJECT_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "디렉토리 생성: $dir"
    else
        print_info "디렉토리 이미 존재: $dir"
    fi
done

# 소유권 설정 (현재 사용자가 root일 경우, aimaster에게 권한 부여)
if [ "$EUID" -eq 0 ]; then
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_ROOT"
    print_success "디렉토리 소유권 설정: $DEPLOY_USER"
fi

# 2) 시스템 패키지 업데이트
print_header "2️⃣ 시스템 패키지 업데이트"

if ! command -v sudo &> /dev/null; then
    print_warning "sudo가 없습니다. 패키지 업데이트를 건너뜁니다."
else
    print_info "패키지 목록 업데이트 중..."
    sudo apt-get update -y &>/dev/null || print_warning "apt-get update 실패"
    print_success "패키지 업데이트 완료"
fi

# 3) Poetry 설치
print_header "3️⃣ Poetry 설치 (Python 패키지 매니저)"

if command -v poetry &> /dev/null; then
    POETRY_VERSION=$(poetry --version)
    print_success "Poetry 이미 설치됨: $POETRY_VERSION"
else
    print_info "Poetry 설치 중..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="/root/.local/bin:$PATH"
    print_success "Poetry 설치 완료"
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

# 5) Python 설치 (3.10 이상)
print_header "5️⃣ Python 설치 (3.10+)"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python 이미 설치됨: $PYTHON_VERSION"
    echo "  ℹ️  필수 설정 안내: 가상 환경(venv)을 생성하여 프로젝트별 의존성을 관리하는 것이 좋습니다."
    echo "     예: python3 -m venv venv && source venv/bin/activate"
else
    print_info "Python 3.10 이상 설치 중..."
    if command -v sudo &> /dev/null; then
        # deadsnakes PPA 추가 (최신 파이썬 버전을 위해)
        sudo apt-get install -y software-properties-common &>/dev/null
        sudo add-apt-repository -y ppa:deadsnakes/ppa &>/dev/null
        sudo apt-get update -y &>/dev/null
        
        # Python 3.10 설치
        sudo apt-get install -y python3.10 python3.10-venv python3.10-dev python3-pip &>/dev/null
        
        # python3 명령어가 python3.10을 가리키도록 설정 (선택사항, 여기서는 update-alternatives 사용 안함)
        
        print_success "Python 3.10 설치 완료"
        echo "  ℹ️  필수 설정 안내: 프로젝트 루트에서 가상 환경을 생성하세요."
        echo "     명령어: python3.10 -m venv venv"
    else
        print_warning "Python 설치를 위해서는 sudo 권한이 필요합니다"
    fi
fi

# 6) PostgreSQL 설치 (15 이상)
print_header "6️⃣ PostgreSQL 설치 (15+)"

if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version)
    print_success "PostgreSQL 이미 설치됨: $POSTGRES_VERSION"
    echo "  ℹ️  필수 설정 안내: /etc/postgresql/{version}/main/pg_hba.conf 파일에서 접속 권한을 설정해야 할 수 있습니다."
else
    print_info "PostgreSQL 15 이상 설치 중..."
    if command -v sudo &> /dev/null; then
        # PostgreSQL 공식 저장소 추가
        sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
        sudo apt-get update -y &>/dev/null
        
        # PostgreSQL 15 설치
        sudo apt-get install -y postgresql-15 postgresql-contrib-15 &>/dev/null
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        print_success "PostgreSQL 15 설치 및 시작 완료"
        echo "  ℹ️  필수 설정 안내: 기본적으로 로컬 접속만 허용됩니다. 외부 접속이 필요하면 postgresql.conf의 listen_addresses를 수정하세요."
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
    
    # 기존 데이터베이스 확인
    DB_EXISTS=$(sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 && echo "yes" || echo "no")
    
    if [ "$DB_EXISTS" = "yes" ]; then
        print_success "PostgreSQL 데이터베이스가 이미 존재합니다: $DB_NAME"
        echo ""
        echo -e "${CYAN}기존 데이터베이스 정보:${NC}"
        echo "  • Database: $DB_NAME"
        
        # 기존 데이터베이스의 소유자 확인
        DB_OWNER=$(sudo -u postgres psql -tc "SELECT pg_catalog.pg_get_userbyid(d.datdba) FROM pg_database d WHERE datname = '$DB_NAME'" 2>/dev/null | xargs)
        echo "  • Owner: $DB_OWNER"
        echo ""
        print_warning "데이터베이스 생성을 건너뜁니다."
    else
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
            print_warning "PostgreSQL 데이터베이스 생성을 건너뛰었습니다."
            echo "  나중에 수동으로 설정하려면:"
            echo "  sudo -u postgres psql"
        fi
    fi
else
    print_warning "PostgreSQL이 설치되지 않았습니다."
fi

# 8) OpenAI API Key 설정 (대화형)
print_header "8️⃣ OpenAI API Key 설정"

SECRETS_FILE="$SCRIPT_DIR/secrets.sh"

if [ -f "$SECRETS_FILE" ]; then
    print_info "이미 secrets.sh 파일이 존재합니다: $SECRETS_FILE"
    print_info "OpenAI Key 설정을 건너뜁니다."
else
    echo -e "${YELLOW}AI-Engine 구동을 위해 OpenAI API Key가 필요합니다.${NC}"
    echo -e "입력하지 않고 엔터를 치면 나중에 수동으로 secrets.sh 파일에 입력해야 합니다.\n"
    
    read -p "OpenAI API Key 입력 (sk-...): " OPENAI_KEY_INPUT
    
    if [ -n "$OPENAI_KEY_INPUT" ]; then
        echo "#!/bin/bash" > "$SECRETS_FILE"
        echo "# 자동 생성된 비밀 키 파일 (Git에 커밋하지 마세요)" >> "$SECRETS_FILE"
        echo "export OPENAI_API_KEY=\"$OPENAI_KEY_INPUT\"" >> "$SECRETS_FILE"
        
        chmod 600 "$SECRETS_FILE"
        print_success "API Key가 설정되었습니다: $SECRETS_FILE"
    else
        print_warning "API Key가 설정되지 않았습니다. (나중에 scripts/secrets.sh 파일을 생성하세요)"
    fi
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
echo "  • frontend"
echo "  • backend"
echo "  • ai-engine"
echo "  • database"
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
echo "     cd ../backend && poetry config virtualenvs.in-project true && poetry install"
echo "     cd ../ai-engine && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo ""
echo "  3️⃣ 데이터베이스 테이블 생성:"
echo "     # Backend 서버 최초 실행 시 자동으로 테이블이 생성됩니다."
echo "     cd backend && poetry run uvicorn app.main:app --reload"
echo ""
echo -e "${CYAN}📖 프로젝트 구조:${NC}"
echo ""
echo "  MaLangEE/"
echo "  ├── frontend/              # React/Vue 프론트엔드"
echo "  ├── backend/               # Python FastAPI REST API"
echo "  ├── ai-engine/             # Python AI 엔진"
echo "  ├── database/              # PostgreSQL 설정"
echo "  ├── docs/                  # 문서"
echo "  └── scripts/               # 배포 및 설정 스크립트"
echo ""
echo -e "${GREEN}✓ 개발 환경 설치 완료!${NC}\n"
echo -e "${YELLOW}⚠ 주의:${NC} sudo 권한이 없으면 일부 설치가 건너뛰어질 수 있습니다."
echo ""
