# openmemo

mattn/memo に着想を得た OpenTUI ベースのメモアプリです。

## 特長
- ターミナル UI でメモを閲覧・開く。
- new / list / edit / delete / grep / cat コマンドに対応。
- title, date, tags を含む軽量なフロントマター付き Markdown 保存。
- 環境変数でエディタを指定可能。

## 要件
- `readline/promises` をサポートする Node.js（Node 17+）。

## インストール
```bash
npm install
npm run build
```

CLI を有効化:
```bash
npm link
# または
npm install -g .
```

## 使い方
TUI を起動:
```bash
openmemo
```

メモを作成:
```bash
openmemo new
```

その他のコマンド:
```bash
openmemo list
openmemo edit <query>
openmemo delete <query>
openmemo grep <pattern>
openmemo cat <query>
openmemo help
```

メモ:
- `<query>` はメモの id またはタイトル（部分一致）で検索します。複数一致した場合は選択を促します。
- `grep` は有効な場合は大文字小文字を無視した JavaScript 正規表現、無効な場合は大文字小文字を無視した部分一致検索として動作します。
- TUI 終了: `q` または `Esc`。

## 設定
環境変数:
- `OPEN_MEMO_DIR`: メモ保存ディレクトリを指定。
- `OPEN_MEMO_EDITOR`: 使用するエディタのコマンド。
- `VISUAL` / `EDITOR`: `OPEN_MEMO_EDITOR` が未設定の場合のフォールバック。

エディタ優先順位:
1. `OPEN_MEMO_EDITOR`
2. `VISUAL`
3. `EDITOR`
4. `vi`

## データ保存
デフォルト保存先:
```
~/.openmemo/memos
```

ファイル名形式:
```
YYYY-MM-DD-<slug>.md
```

テンプレート例:
```markdown
---
title: Your Title
date: 2026-01-29 12:34
tags: tag1, tag2
---

# Your Title
```

## 開発
ビルド:
```bash
npm run build
```

ソースから実行:
```bash
npm start
```
