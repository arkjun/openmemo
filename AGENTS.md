# AGENTS.md - openmemo 프로젝트 가이드라인

## 프로젝트 개요

**openmemo**는 mattn/memo에서 영감을 받은 OpenTUI 기반 터미널 메모 애플리케이션입니다.

### 기술 스택
- **Language**: TypeScript (ES2022, ESNext modules)
- **Runtime**: Bun / Node.js
- **TUI**: @opentui/core
- **Test**: Vitest
- **Package Manager**: pnpm

### 프로젝트 구조
```
openmemo/
├── src/
│   ├── cli.ts      # CLI 진입점 및 명령어 핸들러
│   ├── tui.ts      # 터미널 UI 구현
│   ├── storage.ts  # 파일 스토리지 레이어
│   ├── config.ts   # 설정 관리
│   ├── editor.ts   # 외부 에디터 통합
│   └── utils.ts    # 유틸리티 함수
├── tests/
│   ├── unit/       # 단위 테스트
│   ├── integration/# 통합 테스트
│   ├── fixtures/   # 테스트 데이터
│   └── setup.ts    # 테스트 설정
└── dist/           # 빌드 출력
```

---

## 개발 규칙

### TDD (Test-Driven Development) 필수

**모든 새로운 기능과 버그 수정은 TDD 방식으로 개발합니다.**

#### TDD 사이클
1. **Red**: 실패하는 테스트를 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 (테스트는 계속 통과해야 함)

#### 테스트 작성 순서
```typescript
// 1. 먼저 테스트 파일에 테스트 케이스 작성
describe('newFeature', () => {
  it('should do X when Y', () => {
    const result = newFeature(input)
    expect(result).toBe(expectedOutput)
  })
})

// 2. 테스트 실행하여 실패 확인
// pnpm test:run

// 3. 기능 구현

// 4. 테스트 통과 확인

// 5. 리팩토링 (필요시)
```

#### 테스트 커버리지 목표
- 새로운 코드: 최소 80% 커버리지
- Pure functions: 100% 커버리지 권장

---

## 테스트 가이드

### 명령어
```bash
pnpm test         # Watch 모드로 테스트 실행
pnpm test:run     # 단일 실행
pnpm test:watch   # Watch 모드
pnpm test:coverage # 커버리지 리포트
```

### 테스트 파일 네이밍
- 단위 테스트: `*.test.ts`
- 통합 테스트: `*.integration.test.ts`
- E2E 테스트: `*.e2e.test.ts`

### 테스트 패턴

#### Pure Function 테스트
```typescript
describe('functionName', () => {
  it('should [expected behavior] when [condition]', () => {
    expect(functionName(input)).toBe(expected)
  })
})
```

#### 환경 변수 테스트
```typescript
describe('configFunction', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.TARGET_VAR
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should use env var when set', async () => {
    process.env.TARGET_VAR = 'value'
    const { configFunction } = await import('../src/config.js')
    expect(configFunction()).toBe('value')
  })
})
```

#### 파일시스템 테스트 (Integration)
```typescript
describe('Storage Integration', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openmemo-test-${Date.now()}`)
    await fs.mkdir(testDir, { recursive: true })
    process.env.OPEN_MEMO_DIR = testDir
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
    delete process.env.OPEN_MEMO_DIR
  })
})
```

---

## 코드 스타일

### TypeScript 규칙
- `strict: true` 모드 사용
- 명시적 타입 선언 권장
- `any` 타입 사용 지양

### 네이밍 컨벤션
- 함수: `camelCase` (예: `getMemoDir`, `formatDate`)
- 타입/인터페이스: `PascalCase` (예: `MemoRecord`)
- 상수: `SCREAMING_SNAKE_CASE` (예: `DEFAULT_EDITOR`)
- 파일: `kebab-case.ts` 또는 `camelCase.ts`

### 함수 설계 원칙
- **Single Responsibility**: 하나의 함수는 하나의 역할만
- **Pure Functions 선호**: 부작용 최소화, 테스트 용이성 확보
- **의존성 주입**: 테스트 가능한 구조 설계

---

## 커밋 규칙

### Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `test`: 테스트 추가/수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `chore`: 빌드, 설정 등

### 예시
```
feat(storage): add memo search by tag

- Implement filterByTag function
- Add unit tests for tag filtering

Closes #123
```

---

## 빌드 및 실행

```bash
# 빌드
pnpm build

# 로컬 실행
pnpm start

# 또는 직접 실행
bun dist/cli.js
node dist/cli.js
```

---

## 주의사항

1. **테스트 없이 코드 머지 금지**: PR에는 반드시 관련 테스트 포함
2. **TUI 코드 (tui.ts)**: 단위 테스트 제외 대상, 수동 테스트로 검증
3. **환경 변수**: 테스트 후 반드시 원복
4. **비동기 코드**: 항상 `async/await` 사용
