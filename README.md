# openmemo

[English](#english) | [한국어](#한국어) | [日本語](#日本語)

---

## English

OpenTUI-based memo app inspired by [mattn/memo](https://github.com/mattn/memo).

### Features
- Terminal UI for browsing and opening memos
- Create, list, edit, delete, grep, and cat commands
- Markdown storage with lightweight frontmatter (title, date, tags)
- Uses your preferred editor via environment variables

### Installation

```bash
npm install -g openmemo
```

Or with other package managers:
```bash
pnpm add -g openmemo
yarn global add openmemo
```

### Usage
Launch the TUI:
```bash
openmemo
```

Create a memo:
```bash
openmemo new
```

Other commands:
```bash
openmemo list
openmemo edit <query>
openmemo delete <query>
openmemo grep <pattern>
openmemo cat <query>
openmemo help
```

Notes:
- `<query>` matches the memo id or title (partial match). If multiple match, you will be prompted to select.
- `grep` uses a case-insensitive JavaScript regex when the pattern is valid; otherwise it falls back to a case-insensitive substring search.
- TUI: press `q` or `Esc` to quit.

### Configuration
Environment variables:
- `OPEN_MEMO_DIR`: override memo storage directory
- `OPEN_MEMO_EDITOR`: preferred editor command
- `VISUAL` / `EDITOR`: fallbacks if `OPEN_MEMO_EDITOR` is not set

Editor resolution order:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

### Data Storage
Default directory:
```
~/.openmemo/memos
```

File naming format:
```
YYYY-MM-DD-<slug>.md
```

Template content:
```markdown
---
title: Your Title
date: 2026-01-30 12:34
tags: tag1, tag2
---

# Your Title
```

### Contributing

```bash
git clone https://github.com/arkjun/openmemo
cd openmemo
pnpm install
pnpm dev              # Run from source
pnpm build            # Build TypeScript
pnpm build:binaries   # Build platform binaries (requires Bun)
pnpm test             # Run tests (watch mode)
pnpm test:run         # Run tests once
pnpm test:coverage    # Coverage report
```

---

## 한국어

[mattn/memo](https://github.com/mattn/memo)에서 영감을 받은 OpenTUI 기반 터미널 메모 앱입니다.

### 기능
- 메모 탐색 및 열기를 위한 터미널 UI
- 생성, 목록, 편집, 삭제, 검색, 출력 명령어 지원
- 마크다운 저장 (title, date, tags frontmatter 포함)
- 환경 변수를 통한 선호 에디터 설정

### 설치

```bash
npm install -g openmemo
```

또는:
```bash
pnpm add -g openmemo
yarn global add openmemo
```

### 사용법
TUI 실행:
```bash
openmemo
```

메모 생성:
```bash
openmemo new
```

기타 명령어:
```bash
openmemo list           # 메모 목록
openmemo edit <query>   # 메모 편집
openmemo delete <query> # 메모 삭제
openmemo grep <pattern> # 내용 검색
openmemo cat <query>    # 메모 출력
openmemo help           # 도움말
```

참고:
- `<query>`는 메모 ID 또는 제목과 부분 일치합니다. 여러 개가 일치하면 선택 프롬프트가 표시됩니다.
- `grep`은 유효한 정규식이면 대소문자 무시 정규식 검색을, 아니면 부분 문자열 검색을 수행합니다.
- TUI에서 `q` 또는 `Esc`를 눌러 종료합니다.

### 설정
환경 변수:
- `OPEN_MEMO_DIR`: 메모 저장 디렉토리 변경
- `OPEN_MEMO_EDITOR`: 선호 에디터 명령어
- `VISUAL` / `EDITOR`: `OPEN_MEMO_EDITOR` 미설정 시 대체

에디터 우선순위:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

### 데이터 저장
기본 디렉토리:
```
~/.openmemo/memos
```

파일명 형식:
```
YYYY-MM-DD-<slug>.md
```

템플릿:
```markdown
---
title: 제목
date: 2026-01-30 12:34
tags: 태그1, 태그2
---

# 제목
```

### 기여하기

```bash
git clone https://github.com/arkjun/openmemo
cd openmemo
pnpm install
pnpm dev              # 소스에서 실행
pnpm build            # TypeScript 빌드
pnpm build:binaries   # 플랫폼 바이너리 빌드 (Bun 필요)
pnpm test             # 테스트 (watch 모드)
pnpm test:run         # 테스트 단일 실행
pnpm test:coverage    # 커버리지 리포트
```

---

## 日本語

[mattn/memo](https://github.com/mattn/memo)にインスパイアされたOpenTUIベースのターミナルメモアプリです。

### 機能
- メモの閲覧・開くためのターミナルUI
- 作成、一覧、編集、削除、検索、表示コマンド
- マークダウン保存（title, date, tags frontmatter付き）
- 環境変数でお好みのエディターを設定

### インストール

```bash
npm install -g openmemo
```

または:
```bash
pnpm add -g openmemo
yarn global add openmemo
```

### 使い方
TUIを起動:
```bash
openmemo
```

メモを作成:
```bash
openmemo new
```

その他のコマンド:
```bash
openmemo list           # メモ一覧
openmemo edit <query>   # メモ編集
openmemo delete <query> # メモ削除
openmemo grep <pattern> # 内容検索
openmemo cat <query>    # メモ表示
openmemo help           # ヘルプ
```

備考:
- `<query>`はメモIDまたはタイトルに部分一致します。複数一致する場合は選択プロンプトが表示されます。
- `grep`は有効な正規表現なら大文字小文字無視の正規表現検索を、そうでなければ部分文字列検索を行います。
- TUIでは`q`または`Esc`で終了します。

### 設定
環境変数:
- `OPEN_MEMO_DIR`: メモ保存ディレクトリの変更
- `OPEN_MEMO_EDITOR`: お好みのエディターコマンド
- `VISUAL` / `EDITOR`: `OPEN_MEMO_EDITOR`未設定時の代替

エディター優先順位:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

### データ保存
デフォルトディレクトリ:
```
~/.openmemo/memos
```

ファイル名形式:
```
YYYY-MM-DD-<slug>.md
```

テンプレート:
```markdown
---
title: タイトル
date: 2026-01-30 12:34
tags: タグ1, タグ2
---

# タイトル
```

### コントリビュート

```bash
git clone https://github.com/arkjun/openmemo
cd openmemo
pnpm install
pnpm dev              # ソースから実行
pnpm build            # TypeScriptビルド
pnpm build:binaries   # プラットフォームバイナリビルド（Bun必要）
pnpm test             # テスト（watchモード）
pnpm test:run         # テスト単発実行
pnpm test:coverage    # カバレッジレポート
```
