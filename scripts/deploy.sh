#!/bin/bash#!/bin/bash



##############################################################################################################

#  MaLangEE 통합 배포 스크립트#  MaLangEE Deployment Script (Ubuntu 24)

#  실행 방법: ./deploy.sh [옵션]#

#  사용자: aimaster (개발자)#  [실행 순서 설명]

##   1) GitHub 저장소 이름 자동 추출

#  기능:#   2) 프로젝트 폴더 존재 여부 확인 → 없으면 clone

#  1. Git Pull (코드 업데이트)#   3) GitHub main 브랜치 최신 코드 pull

#  2. Backend 빌드 (Maven)#   4) React(frontend) 빌드

#  3. Frontend 의존성 설치 (NPM)#   5) Spring Boot(backend) 빌드

#  4. 서비스 재시작 (Systemd)#   6) Python AI(ai-engine) 패키지 업데이트

################################################   7) 모든 작업 로그를 /var/log/<repo>_deploy.log 에 기록

#

# 설정#  ※ 목적: 서버에서 MaLangEE 프로젝트를 자동으로 업데이트/배포


# 올바른 프로젝트 루트 경로로 수정
PROJECT_ROOT="/home/aimaster/projects/MaLangEE"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
AI_DIR="$PROJECT_ROOT/ai-engine"
USER="aimaster"
HOME_DIR="/home/$USER"



# 색상 코드# GitHub 저장소 URL

GREEN='\033[0;32m'GITHUB_REPO="https://github.com/MaLangEECoperation/MaLangEE.git"

CYAN='\033[0;36m'

YELLOW='\033[1;33m'# 저장소 이름 자동 추출

RED='\033[0;31m'REPO_NAME=$(basename "$GITHUB_REPO" .git)

NC='\033[0m'


# 자동 프로젝트 경로
PROJECT_DIR="$PROJECT_ROOT"

usage() {

    echo -e "${CYAN}사용법: $0 [옵션]${NC}"# 브랜치

    echo "옵션:"BRANCH="main"

    echo "  all       : 전체 배포 (Git Pull + Build + Restart)"

    echo "  backend   : Backend만 배포"# 로그 파일

    echo "  frontend  : Frontend만 배포"LOG_FILE="/var/log/${REPO_NAME}_deploy.log"

    echo "  ai        : AI-Engine만 배포"

    echo "  restart   : 서비스 재시작만 수행"echo "======================================" | tee -a $LOG_FILE

    echo ""echo "   $REPO_NAME Deployment Started" | tee -a $LOG_FILE

    exit 1echo "   $(date)" | tee -a $LOG_FILE

}echo "======================================" | tee -a $LOG_FILE



# 인자 확인# 1) 프로젝트 폴더 없으면 clone

if [ $# -eq 0 ]; thenif [ ! -d "$PROJECT_DIR" ]; then

    usage    echo "[INFO] 프로젝트 폴더 없음 → clone 실행" | tee -a $LOG_FILE

fi    git clone $GITHUB_REPO $PROJECT_DIR | tee -a $LOG_FILE

fi

TARGET=$1

cd $PROJECT_DIR

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"

echo -e "${CYAN}║        MaLangEE 배포 스크립트          ║${NC}"# 2) 최신 코드 가져오기

echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"echo "[INFO] Git pull 실행" | tee -a $LOG_FILE

echo "대상: $TARGET"git fetch --all | tee -a $LOG_FILE

echo ""git checkout $BRANCH | tee -a $LOG_FILE

git pull origin $BRANCH | tee -a $LOG_FILE

# 1. Git Pull

if [[ "$TARGET" == "all" || "$TARGET" == "backend" || "$TARGET" == "frontend" || "$TARGET" == "ai" ]]; then# 3) 프론트엔드 빌드

    echo -e "${GREEN}1️⃣ Git Pull (코드 업데이트)${NC}"if [ -d "frontend" ]; then

    cd "$PROJECT_ROOT" || exit    echo "[INFO] React 빌드 시작" | tee -a $LOG_FILE

        cd frontend

    # .git 디렉토리가 있는지 확인 (테스트 환경에서는 없을 수 있음)    npm install | tee -a $LOG_FILE

    if [ -d ".git" ]; then    npm run build | tee -a $LOG_FILE

        git pull    cd ..

        if [ $? -ne 0 ]; thenfi

            echo -e "${RED}Git Pull 실패!${NC}"

            exit 1# 4) 백엔드(Spring Boot) 빌드

        fiif [ -d "backend" ]; then

    else    echo "[INFO] Spring Boot 빌드 시작" | tee -a $LOG_FILE

        echo -e "${YELLOW}Git 저장소가 아닙니다. Git Pull을 건너뜁니다.${NC}"    cd backend

    fi    ./gradlew build | tee -a $LOG_FILE

fi    cd ..

fi

# 2. Backend 빌드

if [[ "$TARGET" == "all" || "$TARGET" == "backend" ]]; then# 5) Python AI 서버 업데이트

    echo -e "\n${GREEN}2️⃣ Backend 빌드 (Spring Boot)${NC}"if [ -d "ai-engine" ]; then

    cd "$BACKEND_DIR" || exit    echo "[INFO] Python AI 서버 업데이트" | tee -a $LOG_FILE

        cd ai-engine

    # Maven Wrapper 확인    python3 -m venv venv

    if [ -f "./mvnw" ]; then    source venv/bin

        ./mvnw clean package -DskipTests

    else

        mvn clean package -DskipTests    
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Backend 빌드 실패!${NC}"
        exit 1
    fi
    echo "  ✓ Backend 빌드 완료"
fi

# 3. Frontend 준비
if [[ "$TARGET" == "all" || "$TARGET" == "frontend" ]]; then
    echo -e "\n${GREEN}3️⃣ Frontend 준비 (NPM Install)${NC}"
    cd "$FRONTEND_DIR" || exit
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Frontend 의존성 설치 실패!${NC}"
        exit 1
    fi
    echo "  ✓ Frontend 준비 완료"
fi

# 4. 서비스 재시작
echo -e "\n${GREEN}4️⃣ 서비스 재시작${NC}"

if [[ "$TARGET" == "all" || "$TARGET" == "backend" ]]; then
    echo "  • Backend 재시작 중..."
    sudo systemctl restart malangee-backend
fi

if [[ "$TARGET" == "all" || "$TARGET" == "ai" ]]; then
    echo "  • AI-Engine 재시작 중..."
    sudo systemctl restart malangee-ai
fi

if [[ "$TARGET" == "all" || "$TARGET" == "frontend" ]]; then
    echo "  • Frontend 재시작 중..."
    sudo systemctl restart malangee-frontend
fi

# 5. 상태 확인
echo -e "\n${CYAN}📊 서비스 상태 확인:${NC}"

if [[ "$TARGET" == "all" || "$TARGET" == "backend" ]]; then
    if sudo systemctl is-active --quiet malangee-backend 2>/dev/null; then
        echo -e "${GREEN}✓ Backend:     실행 중${NC}"
    else
        echo -e "${RED}✗ Backend:     중지됨${NC}"
    fi
fi

if [[ "$TARGET" == "all" || "$TARGET" == "ai" ]]; then
    if sudo systemctl is-active --quiet malangee-ai 2>/dev/null; then
        echo -e "${GREEN}✓ AI-Engine:   실행 중${NC}"
    else
        echo -e "${RED}✗ AI-Engine:   중지됨${NC}"
    fi
fi

if [[ "$TARGET" == "all" || "$TARGET" == "frontend" ]]; then
    if sudo systemctl is-active --quiet malangee-frontend 2>/dev/null; then
        echo -e "${GREEN}✓ Frontend:    실행 중${NC}"
    else
        echo -e "${RED}✗ Frontend:    중지됨${NC}"
    fi
fi

echo -e "\n${GREEN}✓ 배포 완료!${NC}"
