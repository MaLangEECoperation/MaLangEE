#!/bin/bash

###############################################
#  MaLangEE 공통 설정 파일
#  모든 설치/배포 스크립트에서 사용되는
#  중앙 집중식 설정 관리
#
#  사용 방법:
#  source "$(dirname "$0")/config.sh"
###############################################

# ============================================
# 프로젝트 기본 정보
# ============================================
export PROJECT_NAME="MaLangEE"
export SERVICE_NAME="malangee"
export GITHUB_REPO="https://github.com/MaLangEECoperation/MaLangEE.git"
export GITHUB_BRANCH="main"

# ============================================
# 배포 사용자 정보
# ============================================
# 참고: init_ubuntu_server.sh에서 사용자 입력으로 덮어씌워짐
export DEPLOY_USER="aimaster"
export PROJECT_BASE_PATH="/home/${DEPLOY_USER}/projects"

# ============================================
# 웹 서버 설정 (Nginx)
# ============================================
# 참고: setup_nginx.sh에서 사용자 입력으로 덮어씌워짐
export DOMAIN_NAME="localhost"
export PROJECT_PATH="/"

# ============================================
# Frontend 설정
# ============================================
# 참고: setup_nginx.sh에서 사용자 입력으로 덮어씌워짐
export FRONTEND_HOST="localhost"
export FRONTEND_PORT="5173"

# ============================================
# Backend 설정
# ============================================
# 참고: setup_nginx.sh에서 사용자 입력으로 덮어씌워짐
export BACKEND_HOST="localhost"
export BACKEND_PORT="8080"

# ============================================
# 데이터베이스 설정
# ============================================
# 참고: setup_dev_environment.sh에서 사용자 입력으로 덮어씌워짐
export DB_NAME="malangee"
export DB_USER="malangee_user"
export DB_PASSWORD="malangee_password"
export DB_HOST="localhost"
export DB_PORT="5432"

# ============================================
# 로깅 및 배포 경로
# ============================================
export LOG_DIR="/var/log"
export DEPLOY_LOG="${LOG_DIR}/${PROJECT_NAME}_deploy.log"

# ============================================
# Nginx 설정 경로
# ============================================
export NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
export NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
export NGINX_CONFIG_NAME="${SERVICE_NAME}"

# ============================================
# 유틸리티 함수
# ============================================

# 색상 정의
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export NC='\033[0m'

# 로깅 함수
print_header() {
    echo -e "\n${BLUE}====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}====================================${NC}\n"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# 경로 정규화 함수
normalize_path() {
    local path="$1"
    
    # 경로가 "/"가 아니면 정규화
    if [[ "$path" != "/" ]]; then
        # 앞에 / 추가
        path="/${path#/}"
        # 뒤에 / 제거
        path="${path%/}"
    fi
    
    echo "$path"
}

# 저장소 이름 추출 함수
get_repo_name() {
    local repo_url="$1"
    basename "$repo_url" .git
}

# 프로젝트 경로 생성 함수
get_project_path() {
    local user="$1"
    local repo_url="$2"
    local repo_name=$(get_repo_name "$repo_url")
    echo "/home/${user}/projects/${repo_name}"
}

# 배포 스크립트 경로 함수
get_deploy_script_path() {
    local user="$1"
    echo "/home/${user}/deploy.sh"
}

export -f normalize_path
export -f get_repo_name
export -f get_project_path
export -f get_deploy_script_path
export -f print_header
export -f print_success
export -f print_error
export -f print_info
export -f print_warning
