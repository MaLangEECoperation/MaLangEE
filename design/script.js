// 화면 전환 함수
function showScreen(screenId) {
    // 모든 화면 숨기기
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // 선택한 화면 표시
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        // 스크롤을 최상단으로
        targetScreen.scrollTop = 0;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('영어 학습 앱 프로토타입 로드 완료');
    
    // 로딩 애니메이션 시뮬레이션 (2초 후 온보딩으로)
    setTimeout(() => {
        // showScreen('onboarding1'); // 자동 전환 비활성화 (수동 네비게이션 사용)
    }, 2000);
});

// 네비게이션 바 활성화 상태 업데이트
function updateBottomNav(activeIndex) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 상황 카드 클릭 이벤트
document.addEventListener('click', function(e) {
    // 상황 카드 클릭 시 대화 화면으로
    if (e.target.closest('.situation-card') || e.target.closest('.situation-card-large')) {
        console.log('상황 카드 클릭됨');
        // 실제 앱에서는 선택된 상황 저장 후 대화 화면으로
    }
    
    // 대화 카드 클릭 시 리포트 화면으로
    if (e.target.closest('.conversation-card') || e.target.closest('.conversation-list-card')) {
        console.log('대화 카드 클릭됨');
    }
});

// 마이크 버튼 애니메이션
const micButton = document.querySelector('.mic-button');
if (micButton) {
    micButton.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        console.log('음성 녹음 시작 시뮬레이션');
        // 실제 앱에서는 음성 인식 API 호출
    });
}

// 힌트 카드 토글
let hintExpanded = false;
const hintCard = document.querySelector('.hint-card');
if (hintCard) {
    hintCard.addEventListener('click', function() {
        hintExpanded = !hintExpanded;
        if (hintExpanded) {
            this.style.maxHeight = '500px';
        } else {
            this.style.maxHeight = '200px';
        }
    });
}

// 폼 검증 시뮬레이션
const signupForm = document.querySelector('.signup-content');
if (signupForm) {
    const inputs = signupForm.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-color)';
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.style.borderColor = 'var(--bg-gray)';
            }
        });
    });
}

// 프로그레스 바 애니메이션
function animateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const targetWidth = progressFill.style.width;
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = targetWidth;
        }, 300);
    }
}

// 차트 바 애니메이션
function animateChart() {
    const bars = document.querySelectorAll('.chart .bar');
    bars.forEach((bar, index) => {
        const targetHeight = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, 100 * index);
    });
}

// 통계 카운터 애니메이션
function animateCounter(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// 화면 전환 시 애니메이션 트리거
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('active')) {
                // 통계 화면 활성화 시 애니메이션
                if (target.id === 'statistics') {
                    setTimeout(animateChart, 300);
                    setTimeout(animateProgress, 500);
                }
                
                // 리포트 화면 활성화 시 애니메이션
                if (target.id === 'report') {
                    setTimeout(animateProgress, 300);
                }
            }
        }
    });
});

// 모든 화면 감시
document.querySelectorAll('.screen').forEach(screen => {
    observer.observe(screen, { attributes: true });
});

// 터치 제스처 지원 (모바일)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 왼쪽 스와이프
            console.log('왼쪽 스와이프');
        } else {
            // 오른쪽 스와이프
            console.log('오른쪽 스와이프');
        }
    }
}

// 로컬 스토리지 활용 (프로토타입에서는 시뮬레이션)
const AppStorage = {
    saveConversation: function(conversation) {
        const conversations = this.getConversations();
        conversations.push(conversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
    },
    
    getConversations: function() {
        const data = localStorage.getItem('conversations');
        return data ? JSON.parse(data) : [];
    },
    
    saveUserProfile: function(profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
    },
    
    getUserProfile: function() {
        const data = localStorage.getItem('userProfile');
        return data ? JSON.parse(data) : null;
    },
    
    saveStats: function(stats) {
        localStorage.setItem('stats', JSON.stringify(stats));
    },
    
    getStats: function() {
        const data = localStorage.getItem('stats');
        return data ? JSON.parse(data) : {
            totalConversations: 0,
            totalTime: 0,
            streak: 0
        };
    }
};

// 샘플 데이터 로드
function loadSampleData() {
    const stats = AppStorage.getStats();
    if (stats.totalConversations === 0) {
        // 초기 샘플 데이터
        AppStorage.saveStats({
            totalConversations: 12,
            totalTime: 35, // 분
            streak: 5
        });
    }
}

// 페이지 로드 시 샘플 데이터 로드
loadSampleData();

// 디버그 로그
console.log('프로토타입 스크립트 로드 완료');
console.log('사용 가능한 화면:', [
    'splash', 'onboarding1', 'onboarding2', 'onboarding3', 'onboarding4',
    'home', 'situation-setup', 'chat', 'signup-modal', 'signup',
    'report', 'history', 'statistics', 'mypage'
]);
