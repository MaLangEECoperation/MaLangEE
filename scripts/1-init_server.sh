#!/bin/bash

###############################################
#  Ubuntu 서버 초기 세팅 올인원 스크립트
#  실행 방법: sudo bash 1-init_server.sh
#  또는: sudo ./1-init_server.sh
#
#  권한: root 권한 필요 (시스템 초기화 작업용)
#  ├─ 시스템 업데이트 (필수)
#  ├─ 사용자 생성 (필수)
#  ├─ SSH 설정 (필수)
#  ├─ Git 설치 (필수)
#  ├─ 저장소 클론 (sudo -u로 사용자 권한 사용)
#  ├─ 배포 스크립트 생성 (필수)
#  ├─ Cron 자동 배포 설정 (필수 - 10분마다)
#  └─ 로그 디렉토리 생성 (필수)
#
#  배포 방식:
#  • 기본: Cron 자동 배포 (10분마다 자동 git pull)

###############################################

# 공통 설정 로드
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# root 권한 확인
if [[ $EUID -ne 0 ]]; then
    print_error "이 스크립트는 root 권한으로 실행되어야 합니다."
    echo ""
    echo "실행 방법:"
    echo "  sudo bash 1-init_server.sh"
    echo "  또는"
    echo "  sudo ./1-init_server.sh"
    exit 1
fi

print_header "Ubuntu 서버 초기 세팅"
echo "현재 사용자: $(whoami) (root)"
echo ""

# 사용자 입력받기
read -p "생성할 사용자명 (기본값: $DEPLOY_USER): " -r USERNAME
USERNAME=${USERNAME:-"$DEPLOY_USER"}

read -p "GitHub 저장소 URL (기본값: $GITHUB_REPO): " -r GITHUB_REPO
GITHUB_REPO=${GITHUB_REPO:-"$GITHUB_REPO"}

read -p "GitHub 브랜치 (기본값: $GITHUB_BRANCH): " -r GITHUB_BRANCH
GITHUB_BRANCH=${GITHUB_BRANCH:-"$GITHUB_BRANCH"}

# 저장소 이름 자동 추출 (config.sh 함수 사용)
REPO_NAME=$(get_repo_name "$GITHUB_REPO")

echo ""
echo -e "${YELLOW}설정 정보:${NC}"
echo "  • 프로젝트명: $PROJECT_NAME"
echo "  • 서비스명: $SERVICE_NAME"
echo "  • 사용자명: $USERNAME"
echo "  • GitHub 저장소: $GITHUB_REPO"
echo "  • 브랜치: $GITHUB_BRANCH"
echo "  • 저장소 이름: $REPO_NAME"
echo ""

# 계속 진행할지 확인
read -p "위의 설정으로 계속 진행하시겠습니까? (y/n): " -r CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "스크립트를 취소합니다."
    exit 0
fi

print_header "Ubuntu 서버 초기 세팅 시작"

USERHOME="/home/$USERNAME"
PROJECT_ROOT="$USERHOME/projects"
REPO_PATH="$PROJECT_ROOT/$REPO_NAME"
DEPLOY_SCRIPT="$USERHOME/deploy.sh"
LOG_FILE="${LOG_DIR}/${PROJECT_NAME}_deploy.log"

### 0) 자동 업데이트
print_header "0️⃣ 시스템 자동 업데이트"
apt-get update -y && apt-get upgrade -y
print_success "시스템 업데이트 완료"
echo ""

### 1) 사용자 생성 + sudo 권한 + SSH 설정
print_header "1️⃣ 사용자 생성 및 SSH 설정"

# 사용자 생성
if id "$USERNAME" &>/dev/null; then
    print_success "사용자 '$USERNAME' 이미 존재함"
else
    adduser --disabled-password --gecos "" "$USERNAME"
    # 비밀번호를 아이디와 동일하게 설정
    echo "$USERNAME:$USERNAME" | chpasswd
    # 첫 로그인 시 비밀번호 변경 강제 설정
    passwd -e "$USERNAME"
    print_success "사용자 '$USERNAME' 생성 완료 (초기 비밀번호: $USERNAME, 로그인 시 변경 필요)"
fi

# sudo 권한 부여
usermod -aG sudo "$USERNAME"
print_success "sudo 권한 부여 완료"

# SSH 설정
mkdir -p "$USERHOME/.ssh"
touch "$USERHOME/.ssh/authorized_keys"
chmod 700 "$USERHOME/.ssh"
chmod 600 "$USERHOME/.ssh/authorized_keys"
chown -R "$USERNAME:$USERNAME" "$USERHOME/.ssh"
print_success "SSH 설정 완료"

# 프로젝트 폴더 생성 및 권한 설정
mkdir -p "$PROJECT_ROOT"
chown -R "$USERNAME:$USERNAME" "$PROJECT_ROOT"
print_success "프로젝트 폴더 생성 및 권한 설정 완료"
echo ""

### 2) Git 설치
print_header "2️⃣ Git 설치"

if ! command -v git &> /dev/null; then
    apt-get install -y git
    print_success "Git 설치 완료"
else
    print_success "Git 이미 설치됨"
fi
echo ""

### 3) GitHub 저장소 클론
print_header "3️⃣ GitHub 저장소 클론"

if [ -d "$REPO_PATH" ]; then
    print_info "저장소가 이미 존재합니다: $REPO_PATH"
    cd "$REPO_PATH"
    sudo -u "$USERNAME" git pull origin "$GITHUB_BRANCH"
    print_success "저장소 업데이트 완료"
else
    # 저장소 디렉토리에서 클론 (사용자 권한으로)
    cd "$PROJECT_ROOT"
    sudo -u "$USERNAME" git clone -b "$GITHUB_BRANCH" "$GITHUB_REPO"
    print_success "저장소 클론 완료: $REPO_PATH"
fi
echo ""

### 4) 자동 배포 스크립트 생성
print_header "4️⃣ 자동 배포 스크립트 생성"

tee "$DEPLOY_SCRIPT" > /dev/null << 'EOF'
#!/bin/bash

REPO_PATH="__REPO_PATH__"
LOG_FILE="__LOG_FILE__"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 배포 시작" >> $LOG_FILE

# 저장소 업데이트
cd $REPO_PATH || exit 1
git fetch origin main >> $LOG_FILE 2>&1
git reset --hard origin/main >> $LOG_FILE 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 배포 완료" >> $LOG_FILE
EOF

# 변수 치환
sed -i "s|__REPO_PATH__|$REPO_PATH|g" "$DEPLOY_SCRIPT"
sed -i "s|__LOG_FILE__|$LOG_FILE|g" "$DEPLOY_SCRIPT"

chmod +x "$DEPLOY_SCRIPT"
chown "$USERNAME:$USERNAME" "$DEPLOY_SCRIPT"
print_success "배포 스크립트 생성: $DEPLOY_SCRIPT"
echo ""

### 5) Cron 자동 배포 설정
print_header "5️⃣ Cron 자동 배포 설정"

CRON_FILE="/tmp/crontab_$USERNAME"

# 기존 crontab 내용 확인
sudo -u "$USERNAME" crontab -l > "$CRON_FILE" 2>/dev/null || true

# 중복 방지
if ! grep -q "deploy.sh" "$CRON_FILE" 2>/dev/null; then
    echo "*/10 * * * * $DEPLOY_SCRIPT >> $LOG_FILE 2>&1" >> "$CRON_FILE"
    sudo -u "$USERNAME" crontab "$CRON_FILE"
    print_success "Cron 설정 완료 (10분마다 배포 체크)"
else
    print_success "Cron이 이미 설정되어 있습니다"
fi

rm -f "$CRON_FILE"
echo ""

### 6) 배포 로그 디렉토리 생성
print_header "6️⃣ 배포 로그 디렉토리 생성"

mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chown "$USERNAME:$USERNAME" "$LOG_FILE"
print_success "배포 로그 디렉토리 생성: $(dirname "$LOG_FILE")"
echo ""

### 7) 최종 확인
print_header "7️⃣ 최종 설정 확인"

echo "사용자 정보:"
id "$USERNAME"
echo ""

echo "그룹 정보:"
groups "$USERNAME"
echo ""

echo "프로젝트 경로:"
ls -la "$PROJECT_ROOT"
echo ""

print_header "✓ 모든 작업 완료!"
echo ""
echo -e "${GREEN}✅ 초기화 요약:${NC}"
echo "  • 실행 사용자: root (필수)"
echo "  • 생성된 배포 사용자: $USERNAME"
echo "  • 배포 방식: Cron 자동 배포 (10분마다)"
echo ""
echo "설정 정보:"
echo "  • 사용자: $USERNAME"
echo "  • 홈 디렉토리: $USERHOME"
echo "  • GitHub 저장소: $GITHUB_REPO"
echo "  • 브랜치: $GITHUB_BRANCH"
echo "  • 프로젝트 경로: $REPO_PATH"
echo "  • 배포 스크립트: $DEPLOY_SCRIPT"
echo "  • 배포 로그: $LOG_FILE"
echo ""
echo "📋 Cron 자동 배포 설정:"
echo "  • 실행 주기: 10분마다"
echo "  • 명령어: $DEPLOY_SCRIPT"
echo "  • 확인 방법: crontab -u $USERNAME -l"
echo ""
echo "다음 단계:"
echo ""
echo "1️⃣ 배포 로그 확인:"
echo "   tail -f $LOG_FILE"
echo ""
echo "2️⃣ Cron 설정 확인:"
echo "   crontab -u $USERNAME -l"
echo ""
echo "3️⃣ 저장소 상태 확인:"
echo "   cd $REPO_PATH && git status"
echo ""
echo "4️⃣ 배포 스크립트 수동 실행:"
echo "   $DEPLOY_SCRIPT"
echo ""
echo "5️⃣ (선택사항) GitHub Actions 빠른 배포 추가:"
echo "   docs/GITHUB_ACTIONS_SSH_DEPLOY.md 참고"
echo ""
echo "⚠️  권장사항:"
echo "  • 서버를 재부팅하세요: sudo reboot"
echo "  • SSH 포트 (기본: 22)가 열려있는지 확인하세요"
echo "  • 방화벽에서 SSH 연결을 허용하세요"
echo "  • 10분마다 자동으로 git pull이 실행됩니다"
echo "======================================"

