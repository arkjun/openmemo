# AGENTS.md - openmemo Project Guidelines

## Project Overview

**openmemo** is an OpenTUI-based terminal memo application inspired by mattn/memo.

### Tech Stack
- **Language**: TypeScript (ES2022, ESNext modules)
- **Runtime**: Bun / Node.js
- **TUI**: @opentui/core
- **Test**: Vitest
- **Package Manager**: pnpm

### Project Structure
```
openmemo/
├── src/
│   ├── cli.ts      # CLI entry point and command handlers
│   ├── tui.ts      # Terminal UI implementation
│   ├── storage.ts  # File storage layer
│   ├── config.ts   # Configuration management
│   ├── editor.ts   # External editor integration
│   └── utils.ts    # Utility functions
├── tests/
│   ├── unit/       # Unit tests
│   ├── integration/# Integration tests
│   ├── fixtures/   # Test data
│   └── setup.ts    # Test setup
└── dist/           # Build output
```

---

## Development Rules

### TDD (Test-Driven Development) Required

**All new features and bug fixes must be developed using TDD.**

#### TDD Cycle
1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve the code (tests must continue to pass)

#### Test Writing Order
```typescript
// 1. First write test cases in the test file
describe('newFeature', () => {
  it('should do X when Y', () => {
    const result = newFeature(input)
    expect(result).toBe(expectedOutput)
  })
})

// 2. Run tests to confirm failure
// pnpm test:run

// 3. Implement the feature

// 4. Confirm tests pass

// 5. Refactor (if needed)
```

#### Test Coverage Goals
- New code: Minimum 80% coverage
- Pure functions: 100% coverage recommended

---

## Testing Guide

### Commands
```bash
pnpm test         # Run tests in watch mode
pnpm test:run     # Single run
pnpm test:watch   # Watch mode
pnpm test:coverage # Coverage report
```

### Test File Naming
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Test Patterns

#### Pure Function Tests
```typescript
describe('functionName', () => {
  it('should [expected behavior] when [condition]', () => {
    expect(functionName(input)).toBe(expected)
  })
})
```

#### Environment Variable Tests
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

#### File System Tests (Integration)
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

## Code Style

### TypeScript Rules
- Use `strict: true` mode
- Explicit type declarations recommended
- Avoid using `any` type

### Naming Conventions
- Functions: `camelCase` (e.g., `getMemoDir`, `formatDate`)
- Types/Interfaces: `PascalCase` (e.g., `MemoRecord`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_EDITOR`)
- Files: `kebab-case.ts` or `camelCase.ts`

### Function Design Principles
- **Single Responsibility**: Each function should have only one purpose
- **Prefer Pure Functions**: Minimize side effects, ensure testability
- **Dependency Injection**: Design for testable structures

---

## Commit Rules

### Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/modify tests
- `refactor`: Refactoring
- `docs`: Documentation changes
- `chore`: Build, configuration, etc.

### Example
```
feat(storage): add memo search by tag

- Implement filterByTag function
- Add unit tests for tag filtering

Closes #123
```

---

## Build & Run

```bash
# Build
pnpm build

# Local run
pnpm start

# Or run directly
bun dist/cli.js
node dist/cli.js
```

---

## Release & npm Publish

### Release Process

npm 배포는 **Git 태그 푸시**로 트리거됩니다. 커밋만 푸시해서는 npm에 게시되지 않습니다.

```bash
# 1. 버전 업데이트 (모든 패키지)
#    - packages/openmemo/package.json
#    - packages/openmemo-darwin-arm64/package.json
#    - packages/openmemo-linux-x64/package.json
#    - packages/openmemo-linux-arm64/package.json
#    - packages/openmemo-windows-x64/package.json

# 2. 커밋 & 푸시
git add .
git commit -m "chore: bump version to X.Y.Z for npm publish"
git push

# 3. 태그 생성 & 푸시 (이 단계가 npm publish를 트리거)
git tag vX.Y.Z
git push origin vX.Y.Z
```

### What Happens on Tag Push

`.github/workflows/release.yml`이 실행됩니다:

1. **Build**: 모든 플랫폼(darwin-arm64, linux-x64, linux-arm64, windows-x64)에서 바이너리 빌드
2. **Publish**: 플랫폼별 패키지 + 메인 패키지를 npm에 게시
3. **GitHub Release**: 바이너리를 첨부한 릴리스 생성

### Version Check

```bash
# 현재 npm에 게시된 버전 확인
npm view openmemo version

# 로컬 버전 확인
cat packages/openmemo/package.json | grep version
```

### Troubleshooting

- **npm 버전이 안 바뀜**: 태그를 푸시했는지 확인 (`git push origin vX.Y.Z`)
- **이미 존재하는 버전**: npm은 같은 버전을 다시 게시할 수 없음. 버전을 올려야 함
- **CI 실패**: GitHub Actions 탭에서 로그 확인

---

## Important Notes

1. **No code merge without tests**: PRs must include related tests
2. **TUI code (tui.ts)**: Excluded from unit tests, verify with manual testing
3. **Environment variables**: Must be restored after tests
4. **Async code**: Always use `async/await`
