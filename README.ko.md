# openmemo

mattn/memo에서 영감을 받은 OpenTUI 기반 메모 앱입니다.

## 주요 기능
- 터미널 UI로 메모 목록을 탐색하고 열기.
- new, list, edit, delete, grep, cat 명령 지원.
- title, date, tags를 포함한 가벼운 프런트매터로 Markdown 저장.
- 환경 변수로 에디터 지정.

## 요구사항
- `readline/promises`를 지원하는 Node.js (Node 17+).

## 설치
```bash
npm install
npm run build
```

CLI 노출:
```bash
npm link
# 또는
npm install -g .
```

## 사용 방법
TUI 실행:
```bash
openmemo
```

메모 생성:
```bash
openmemo new
```

기타 명령:
```bash
openmemo list
openmemo edit <query>
openmemo delete <query>
openmemo grep <pattern>
openmemo cat <query>
openmemo help
```

참고:
- `<query>`는 메모 id 또는 제목(부분 일치)을 기준으로 검색합니다. 여러 개가 일치하면 선택을 요청합니다.
- `grep`는 유효한 경우 대소문자 무시 JavaScript 정규식을 사용하고, 그렇지 않으면 대소문자 무시 부분 문자열 검색으로 동작합니다.
- TUI 종료: `q` 또는 `Esc`.

## 설정
환경 변수:
- `OPEN_MEMO_DIR`: 메모 저장 경로를 지정합니다.
- `OPEN_MEMO_EDITOR`: 선호하는 에디터 명령.
- `VISUAL` / `EDITOR`: `OPEN_MEMO_EDITOR`가 없을 때의 대안.

에디터 우선순위:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

## 데이터 저장
기본 경로:
```
~/.openmemo/memos
```

파일 이름 형식:
```
YYYY-MM-DD-<slug>.md
```

템플릿 예시:
```markdown
---
title: Your Title
date: 2026-01-29 12:34
tags: tag1, tag2
---

# Your Title
```

## 개발
빌드:
```bash
npm run build
```

소스에서 실행:
```bash
npm start
```
