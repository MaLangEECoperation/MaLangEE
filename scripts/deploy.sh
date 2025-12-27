#!/bin/bash

###############################################################
#  MaLangEE Deployment Script (Ubuntu 24)
#
#  [실행 순서 설명]
#   1) GitHub 저장소 이름 자동 추출
#   2) 프로젝트 폴더 존재 여부 확인 → 없으면 clone
#   3) GitHub main 브랜치 최신 코드 pull
#   4) React(frontend) 빌드
#   5) Spring Boot(backend) 빌드
#   6) Python AI(ai-engine) 패키지 업데이트
#   7) 모든 작업 로그를 /var/log/<repo>_deploy.log 에 기록
#
#  ※ 목적: 서버에서 MaLangEE 프로젝트를 자동으로 업데이트/배포
###############################################################

USER="aimaster"
HOME_DIR="/home/$USER"

# GitHub 저장소 URL
GITHUB_REPO="https://github.com/MaLangEECoperation/MaLangEE.git"

# 저장소 이름 자동 추출
REPO_NAME=$(basename "$GITHUB_REPO" .git)

# 자동 프로젝트 경로
PROJECT_DIR="$HOME_DIR/projects/$REPO_NAME"

# 브랜치
BRANCH="main"

# 로그 파일
LOG_FILE="/var/log/${REPO_NAME}_deploy.log"

echo "======================================" | tee -a $LOG_FILE
echo "   $REPO_NAME Deployment Started" | tee -a $LOG_FILE
echo "   $(date)" | tee -a $LOG_FILE
echo "======================================" | tee -a $LOG_FILE

# 1) 프로젝트 폴더 없으면 clone
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[INFO] 프로젝트 폴더 없음 → clone 실행" | tee -a $LOG_FILE
    git clone $GITHUB_REPO $PROJECT_DIR | tee -a $LOG_FILE
fi

cd $PROJECT_DIR

# 2) 최신 코드 가져오기
echo "[INFO] Git pull 실행" | tee -a $LOG_FILE
git fetch --all | tee -a $LOG_FILE
git checkout $BRANCH | tee -a $LOG_FILE
git pull origin $BRANCH | tee -a $LOG_FILE

# 3) 프론트엔드 빌드
if [ -d "frontend" ]; then
    echo "[INFO] React 빌드 시작" | tee -a $LOG_FILE
    cd frontend
    npm install | tee -a $LOG_FILE
    npm run build | tee -a $LOG_FILE
    cd ..
fi

# 4) 백엔드(Spring Boot) 빌드
if [ -d "backend" ]; then
    echo "[INFO] Spring Boot 빌드 시작" | tee -a $LOG_FILE
    cd backend
    ./gradlew build | tee -a $LOG_FILE
    cd ..
fi

# 5) Python AI 서버 업데이트
if [ -d "ai-engine" ]; then
    echo "[INFO] Python AI 서버 업데이트" | tee -a $LOG_FILE
    cd ai-engine
    python3 -m venv venv
    source venv/bin


    