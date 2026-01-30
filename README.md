# openmemo

OpenTUI-based memo app inspired by mattn/memo.

## Features
- Terminal UI for browsing and opening memos.
- Create, list, edit, delete, grep, and cat commands.
- Markdown storage with lightweight frontmatter (title, date, tags).
- Uses your preferred editor via environment variables.

## Requirements
- Node.js with `readline/promises` support (Node 17+).

## Install
```bash
npm install
npm run build
```

Expose the CLI:
```bash
npm link
# or
npm install -g .
```

## Usage
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

## Configuration
Environment variables:
- `OPEN_MEMO_DIR`: override memo storage directory.
- `OPEN_MEMO_EDITOR`: preferred editor command.
- `VISUAL` / `EDITOR`: fallbacks if `OPEN_MEMO_EDITOR` is not set.

Editor resolution order:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

## Data storage
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
date: 2026-01-29 12:34
tags: tag1, tag2
---

# Your Title
```

## Development
Build:
```bash
npm run build
```

Run from source:
```bash
npm start
```
