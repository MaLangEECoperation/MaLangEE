# 디자인 가이드

MaLangEE 프론트엔드 디자인 시스템 및 Figma 참조 문서입니다.

---

## Figma 디자인 URL

### 사용자 플로우

**신규 사용자**

```
로그인 랜딩 → 무료 이용 → 대화 주제 선정 → 대화 → (로그인 유도 팝업) → 종료 → 잘했어요 페이지 → 로그인 랜딩
```

**기존 사용자**

```
로그인 랜딩 → 대화 주제 선정 → 대화 → 종료 → 잘했어요 페이지 → 회원 전용 랜딩 → 이력 확인/새로운 대화
```

### 페이지별 Figma 링크

| 페이지                 | Figma URL                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 랜딩페이지 (비회원)    | [node-id=890-91](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=890-91)       |
| 회원가입               | [node-id=1263-139](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1263-139)   |
| 회원가입 (추가)        | [node-id=1069-91](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1069-91)     |
| 회원가입 (추가)        | [node-id=1263-176](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1263-176)   |
| 회원가입 완료 팝업     | [node-id=1504-109](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1504-109)   |
| 랜딩페이지 (회원)      | [node-id=1316-723](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1316-723)   |
| 랜딩페이지 (회원 추가) | [node-id=1300-399](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1300-399)   |
| 랜딩페이지 (회원 추가) | [node-id=1819-1011](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1819-1011) |
| 이전 대화 이력 상세    | [node-id=1300-796](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1300-796)   |
| 대화 전문보기          | [node-id=1674-344](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1674-344)   |
| 로그아웃 확인          | [node-id=1819-1288](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/%EC%9D%B4%EB%84%88%EC%8D%A8%ED%81%B4?node-id=1819-1288) |

---

## Figma 텍스트 요구사항

### 비회원 랜딩페이지

| 요소          | 텍스트 (한글)                       | 텍스트 (영문)            |
| ------------- | ----------------------------------- | ------------------------ |
| 로고          | -                                   | MalangEE                 |
| 인사말        | -                                   | Hello, I'm MalangEE      |
| 슬로건        | 해외 원어민과 대화하는 느낌 그대로! | Free Talking AI Chat-bot |
| 아이디 입력   | 아이디                              | -                        |
| 비밀번호 입력 | 비밀번호                            | -                        |
| 로그인 버튼   | 로그인                              | -                        |
| 회원가입 버튼 | 회원가입                            | -                        |

### 회원가입 페이지

| 요소                 | 텍스트                                   |
| -------------------- | ---------------------------------------- |
| 뒤로가기             | ← (아이콘)                               |
| 제목                 | 회원가입                                 |
| 아이디 라벨          | 아이디                                   |
| 아이디 placeholder   | 아이디를 입력해 주세요                   |
| 비밀번호 라벨        | 비밀번호                                 |
| 비밀번호 placeholder | 영문+숫자 조합 10자리 이상 입력해 주세요 |
| 닉네임 라벨          | 닉네임                                   |
| 닉네임 placeholder   | 닉네임을 입력해 주세요                   |
| 가입 버튼            | 회원가입                                 |

### 공통 네비게이션

| 요소          | 텍스트                 |
| ------------- | ---------------------- |
| 뒤로가기 버튼 | ← (ChevronLeft 아이콘) |
| 대화 기록     | 대화 기록              |
| 로그아웃      | 로그아웃               |
| 닫기 버튼     | × (X 아이콘)           |

### 대화 완료 페이지

| 요소             | 텍스트                          |
| ---------------- | ------------------------------- |
| 제목             | 잘했어요!                       |
| 총 대화 시간     | 총 대화 시간: {분}분 {초}초     |
| 사용자 발화 시간 | 사용자 발화 시간: {분}분 {초}초 |
| 홈 버튼          | 홈으로 돌아가기                 |

### 로그아웃 확인 팝업

| 요소      | 텍스트                      |
| --------- | --------------------------- |
| 제목      | 로그아웃                    |
| 메시지    | 정말 로그아웃 하시겠습니까? |
| 취소 버튼 | 취소                        |
| 확인 버튼 | 로그아웃                    |

---

## Tailwind CSS v4 설정

모든 설정은 `src/app/globals.css`에 정의되어 있습니다.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* 테마 변수 정의 */
}
```

---

## 색상 시스템

### Brand Colors

| 변수               | oklch                  | hex       | 용도             |
| ------------------ | ---------------------- | --------- | ---------------- |
| `brand`            | `oklch(0.55 0.2 280)`  | `#7B6CF6` | 기본 브랜드      |
| `brand-foreground` | `oklch(1 0 0)`         | `#FFFFFF` | 브랜드 위 텍스트 |
| `brand-700`        | `oklch(0.35 0.15 280)` | `#4b3f74` | 헤더/강조        |
| `brand-200`        | `oklch(0.85 0.08 280)` | `#cfc5ff` | 연한 브랜드      |
| `brand-50`         | `oklch(0.95 0.02 280)` | `#f0e8ff` | 매우 연한 배경   |

### Text Colors

| 변수             | oklch                  | hex       | 용도        |
| ---------------- | ---------------------- | --------- | ----------- |
| `text-primary`   | `oklch(0.15 0.01 280)` | `#1F1C2B` | 주요 텍스트 |
| `text-secondary` | `oklch(0.45 0.03 280)` | `#625a75` | 보조 텍스트 |

### Gradient Colors

| 변수              | oklch                  | hex       | 용도            |
| ----------------- | ---------------------- | --------- | --------------- |
| `gradient-purple` | `oklch(0.88 0.08 310)` | `#F6D7FF` | 그라디언트 시작 |
| `gradient-blue`   | `oklch(0.92 0.03 250)` | `#DCE9FF` | 그라디언트 끝   |

### Primary Scale (버튼/포인트)

| 변수          | hex       | oklch                  | 용도          |
| ------------- | --------- | ---------------------- | ------------- |
| `primary-900` | `#5F51D9` | `oklch(0.45 0.23 280)` | pressed 상태  |
| `primary-800` | `#6F60EB` | `oklch(0.50 0.22 280)` | hover 상태    |
| `primary-700` | `#7B6CF6` | `oklch(0.55 0.2 280)`  | default 상태  |
| `primary-600` | `#B6AEFF` | `oklch(0.75 0.12 280)` | focus 링      |
| `primary-500` | `#C9C5F3` | `oklch(0.82 0.06 280)` | disabled 상태 |

```tsx
// 상태별 색상 사용 예시
<button
  className="
  bg-primary-700
  hover:bg-primary-800
  active:bg-primary-900
  focus:ring-primary-600 disabled:bg-primary-500
  focus:ring-2 disabled:cursor-not-allowed
"
>
  버튼
</button>
```

### Gray Scale (Purple tone)

| 변수       | hex       | 용도                  |
| ---------- | --------- | --------------------- |
| `gray-900` | `#1F1C2B` | 타이틀, 다크모드 배경 |
| `gray-800` | `#2B2F35` | 다크모드 카드 배경    |
| `gray-700` | `#4A4658` | 다크모드 보더         |
| `gray-600` | `#6A667A` | muted 텍스트          |
| `gray-500` | `#8B879B` | 비활성 텍스트         |
| `gray-400` | `#A9A6B5` | 다크모드 muted        |
| `gray-300` | `#D5D2DE` | 구분선                |
| `gray-200` | `#ECEAF2` | 보더                  |
| `gray-100` | `#F5F4F9` | secondary 배경        |
| `gray-70`  | `#FAF9FD` | 사이드바 배경         |
| `gray-50`  | `#FDFDFF` | 다크모드 텍스트       |

### Dim Colors (오버레이)

| 변수        | 값                   | 용도          |
| ----------- | -------------------- | ------------- |
| `dim`       | `rgba(0, 0, 0, 0.7)` | 강한 오버레이 |
| `dim-light` | `rgba(0, 0, 0, 0.4)` | 약한 오버레이 |

### 시맨틱 색상 (shadcn/ui 호환)

| 변수               | 라이트    | 다크      | 용도          |
| ------------------ | --------- | --------- | ------------- |
| `background`       | `#FFFFFF` | `#1F1C2B` | 페이지 배경   |
| `foreground`       | `#1F1C2B` | `#FDFDFF` | 기본 텍스트   |
| `primary`          | `#7B6CF6` | `#7B6CF6` | 주요 액션     |
| `secondary`        | `#F5F4F9` | `#4A4658` | 보조 배경     |
| `muted`            | `#F5F4F9` | `#4A4658` | 비활성 배경   |
| `muted-foreground` | `#6A667A` | `#A9A6B5` | 비활성 텍스트 |
| `accent`           | `#B6AEFF` | `#6F60EB` | 강조          |
| `border`           | `#ECEAF2` | `#4A4658` | 테두리        |
| `ring`             | `#7B6CF6` | `#7B6CF6` | 포커스 링     |

---

## 그라디언트 유틸리티

| 클래스                      | 색상값                        |
| --------------------------- | ----------------------------- |
| `gradient-primary`          | `#F6D7FF → #DCE9FF`           |
| `gradient-primary-extended` | `#F6D7FF → #DCE9FF → #FFFDE2` |
| `gradient-warm`             | `#FFFCDC → #FFD8FC`           |
| `gradient-cool`             | `#F6D7FF → #DCE9FF`           |
| `gradient-vibrant`          | `#A770EF → #CF8BF3 → #FDB99B` |
| `gradient-soft`             | `#F3EFFF → #EAD7F8`           |
| `gradient-blush`            | `#FADADD → #E6D9FF`           |

```tsx
<div className="gradient-primary" />
<div className="gradient-vibrant" />
```

---

## Border Radius

CSS 변수 `--radius` 기준 (기본값: `0.625rem` = 10px)

| 변수         | 계산식            | 기본값 |
| ------------ | ----------------- | ------ |
| `radius-sm`  | `--radius - 4px`  | 6px    |
| `radius-md`  | `--radius - 2px`  | 8px    |
| `radius-lg`  | `--radius`        | 10px   |
| `radius-xl`  | `--radius + 4px`  | 14px   |
| `radius-2xl` | `--radius + 8px`  | 18px   |
| `radius-3xl` | `--radius + 12px` | 22px   |
| `radius-4xl` | `--radius + 16px` | 26px   |

---

## 공용 UI 컴포넌트

### 레이아웃 컴포넌트

| 컴포넌트           | 용도        | 주요 props                            |
| ------------------ | ----------- | ------------------------------------- |
| `PopupLayout`      | 팝업 UI     | maxWidth (sm~4xl), title, onClose     |
| `SplitViewLayout`  | 좌우 분할   | leftColSpan, rightColSpan, showHeader |
| `FullLayout`       | 전체 화면   | maxWidth, showHeader                  |
| `GlassmorphicCard` | 글래스 카드 | 인증 페이지용                         |
| `PageBackground`   | 페이지 배경 | gradient + decorations                |

### UI 컴포넌트

| 컴포넌트           | 용도      | variants                                  |
| ------------------ | --------- | ----------------------------------------- |
| `Button`           | 버튼      | primary, secondary, outline, ghost, brand |
| `DecorativeCircle` | 배경 장식 | size, color, blur, opacity                |
| `Logo`             | 로고      | -                                         |
| `Mascot`           | 마스코트  | glow effect                               |
| `GlassCard`        | 카드      | showHeader                                |

---

## 사용 예시

### 버튼

```tsx
// Brand 버튼 (권장)
<button className="bg-brand hover:bg-brand/90 text-brand-foreground">
  브랜드 버튼
</button>

// Primary 버튼
<button className="bg-primary-700 hover:bg-primary-800">
  버튼
</button>

// 그라디언트 버튼
<button className="gradient-vibrant rounded-lg px-4 py-2 text-white">
  Gradient
</button>
```

### 카드

```tsx
<div className="border-border bg-card rounded-xl border p-6 shadow-sm">
  <h3 className="text-card-foreground text-lg font-semibold">카드 타이틀</h3>
  <p className="text-muted-foreground mt-2">카드 설명 텍스트</p>
</div>
```

### 입력 필드

```tsx
<input
  type="text"
  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
  placeholder="입력하세요"
/>
```

### 사이드바

```tsx
<aside className="bg-sidebar text-sidebar-foreground border-sidebar-border border-r">
  <nav>
    <a className="hover:bg-sidebar-accent">메뉴 1</a>
  </nav>
</aside>
```

---

## 다크모드

```tsx
// 자동 전환
<div className="bg-background text-foreground">
  라이트/다크 자동 적용
</div>

// 수동 지정
<div className="bg-white dark:bg-gray-900">
  명시적 다크모드
</div>
```

### 토글 구현

```tsx
const toggleDarkMode = () => {
  document.documentElement.classList.toggle("dark");
};
```

---

## Chart 색상

| 변수      | 라이트    | 다크      |
| --------- | --------- | --------- |
| `chart-1` | `#7B6CF6` | `#7B6CF6` |
| `chart-2` | `#B6AEFF` | `#B6AEFF` |
| `chart-3` | `#F6D7FF` | `#6F60EB` |
| `chart-4` | `#DCE9FF` | `#5F51D9` |
| `chart-5` | `#FFFDE2` | `#C9C5F3` |

---

## Sidebar 색상

| 변수                 | 라이트    | 다크      |
| -------------------- | --------- | --------- |
| `sidebar`            | `#FAF9FD` | `#2B2F35` |
| `sidebar-foreground` | `#1F1C2B` | `#FDFDFF` |
| `sidebar-primary`    | `#7B6CF6` | `#7B6CF6` |
| `sidebar-accent`     | `#F5F4F9` | `#4A4658` |
| `sidebar-border`     | `#ECEAF2` | `#4A4658` |

---

## 참고 자료

- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [이너써클 Figma](https://www.figma.com/design/Fl5FSDITnfaalJhepW2p1d/)
