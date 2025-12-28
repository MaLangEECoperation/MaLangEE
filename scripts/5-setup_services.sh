#!/bin/bash

###############################################
#  MaLangEE 서비스 등록 스크립트 (Systemd)
#  실행 방법: sudo bash 5-setup_services.sh
#
#  기능:
#  1. Frontend (React/Vite) 서비스 등록
#  2. Backend (Spring Boot) 서비스 등록
#  3. AI-Engine (Python) 서비스 등록
#  4. 서버 재시작 시 자동 실행 설정
###############################################

# 공통 설정 로드
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# 프로젝트 경로
PROJECT_ROOT=$(get_project_path "$DEPLOY_USER" "$GITHUB_REPO")
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
AI_DIR="$PROJECT_ROOT/ai-engine"

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Systemd 서비스 자동 등록 스크립트   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"

# Root 권한 확인
if [[ $EUID -ne 0 ]]; then
   echo "이 스크립트는 root 권한으로 실행되어야 합니다." 
   exit 1
fi

# 0. 필수 패키지 설치 확인 (Maven)
echo -e "\n${GREEN}0️⃣ 필수 패키지 확인 및 설치${NC}"
if ! command -v mvn &> /dev/null; then
    echo "  ℹ️  Maven이 설치되어 있지 않습니다. 설치를 진행합니다..."
    apt-get update -y
    apt-get install -y maven
    echo "  ✓ Maven 설치 완료"
else
    echo "  ✓ Maven 이미 설치됨"
fi

# Maven 경로 확인
MVN_PATH=$(which mvn)
echo "  ℹ️  Maven 경로: $MVN_PATH"

# Node/NPM 경로 확인
NPM_PATH=$(which npm)
NODE_PATH=$(which node)
echo "  ℹ️  NPM 경로: $NPM_PATH"
echo "  ℹ️  Node 경로: $NODE_PATH"

# Python 경로 확인
PYTHON_PATH=$(which python3)
echo "  ℹ️  Python 경로: $PYTHON_PATH"


# 1. Backend 서비스 (Spring Boot)
echo -e "\n${GREEN}1️⃣ Backend 서비스 등록 (malangee-backend)${NC}"

# 기존 서비스 중지 및 비활성화 (있다면)
if systemctl is-active --quiet malangee-backend; then
    echo "  ℹ️  기존 Backend 서비스 중지 중..."
    systemctl stop malangee-backend
fi

cat > /etc/systemd/system/malangee-backend.service <<EOF
[Unit]
Description=MaLangEE Backend Service (Spring Boot)
After=syslog.target network.target postgresql.service

[Service]
User=$USER
WorkingDirectory=$BACKEND_DIR
# Maven 경로 동적 적용
ExecStart=$MVN_PATH spring-boot:run
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable malangee-backend
systemctl start malangee-backend
echo "  ✓ Backend 서비스 등록 및 시작 완료"

# 2. AI-Engine 서비스 (Python)
echo -e "\n${GREEN}2️⃣ AI-Engine 서비스 등록 (malangee-ai)${NC}"

# 기존 서비스 중지 및 비활성화 (있다면)
if systemctl is-active --quiet malangee-ai; then
    echo "  ℹ️  기존 AI-Engine 서비스 중지 중..."
    systemctl stop malangee-ai
fi

cat > /etc/systemd/system/malangee-ai.service <<EOF
[Unit]
Description=MaLangEE AI Engine Service (Python)
After=syslog.target network.target

[Service]
User=$USER
WorkingDirectory=$AI_DIR
# Python 경로 동적 적용, 출력 버퍼링 비활성화(-u)
ExecStart=$PYTHON_PATH -u app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable malangee-ai
systemctl start malangee-ai
echo "  ✓ AI-Engine 서비스 등록 및 시작 완료"

# 3. Frontend 서비스 (React/Vite)
# 주의: 개발 서버(Vite)를 프로덕션 서비스로 돌리는 것은 권장되지 않으나, 요청하신 대로 구성합니다.
# 실제 배포 시에는 'npm run build' 후 Nginx 등으로 정적 파일을 서빙해야 합니다.
echo -e "\n${GREEN}3️⃣ Frontend 서비스 등록 (malangee-frontend)${NC}"

# 의존성 설치 (npm install) 확인 및 실행
if [ -f "$FRONTEND_DIR/package.json" ]; then
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo "  ℹ️  Frontend 의존성(node_modules)이 없습니다. 설치를 진행합니다..."
        # aimaster 권한으로 설치 실행
        su - $USER -c "cd $FRONTEND_DIR && npm install"
        echo "  ✓ Frontend 의존성 설치 완료"
    else
        echo "  ✓ Frontend 의존성 이미 존재함"
    fi
fi

# 기존 서비스 중지 및 비활성화 (있다면)
if systemctl is-active --quiet malangee-frontend; then
    echo "  ℹ️  기존 Frontend 서비스 중지 중..."
    systemctl stop malangee-frontend
fi

cat > /etc/systemd/system/malangee-frontend.service <<EOF
[Unit]
Description=MaLangEE Frontend Service (React/Vite)
After=syslog.target network.target

[Service]
User=$USER
WorkingDirectory=$FRONTEND_DIR
# NPM 경로 동적 적용
ExecStart=$NPM_PATH run dev
Restart=always
RestartSec=10
# Node.js 실행을 위한 PATH 설정 필수
Environment=PATH=/usr/bin:/usr/local/bin:$USER_HOME/.nvm/versions/node/v18.0.0/bin
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable malangee-frontend
systemctl start malangee-frontend
echo "  ✓ Frontend 서비스 등록 및 시작 완료"

# 4. 상태 확인
echo -e "\n${CYAN}📊 서비스 상태 확인:${NC}"
echo ""
echo -e "${YELLOW}Backend:${NC}"
systemctl status malangee-backend --no-pager | head -n 3
echo ""
echo -e "${YELLOW}AI-Engine:${NC}"
systemctl status malangee-ai --no-pager | head -n 3
echo ""
echo -e "${YELLOW}Frontend:${NC}"
systemctl status malangee-frontend --no-pager | head -n 3

echo -e "\n${GREEN}✓ 모든 서비스가 백그라운드에 등록되었으며, 재부팅 시 자동 실행됩니다.${NC}"
echo "  로그 확인: journalctl -u malangee-backend -f"
