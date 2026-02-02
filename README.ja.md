# openmemo

[English](README.md) | [한국어](README.ko.md)

mattn/memo に着想を得た OpenTUI ベースのメモアプリです。

## 特長
- ターミナル UI でメモを閲覧・開く
- new / list / edit / delete / grep / cat コマンドに対応
- title, date, tags を含む軽量なフロントマター付き Markdown 保存
- 環境変数でエディタを指定可能

## インストール

```bash
npm install -g openmemo
```

または:
```bash
pnpm add -g openmemo
yarn global add openmemo
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
openmemo list           # メモ一覧
openmemo edit <query>   # メモ編集
openmemo delete <query> # メモ削除
openmemo grep <pattern> # 内容検索
openmemo cat <query>    # メモ表示
openmemo help           # ヘルプ
```

メモ:
- `<query>` はメモの id またはタイトル（部分一致）で検索します。複数一致した場合は選択を促します。
- `grep` は有効な場合は大文字小文字を無視した JavaScript 正規表現、無効な場合は大文字小文字を無視した部分一致検索として動作します。
- TUI 終了: `q` または `Esc`。

## 設定
環境変数:
- `OPEN_MEMO_DIR`: メモ保存ディレクトリを指定
- `OPEN_MEMO_EDITOR`: 使用するエディタのコマンド
- `VISUAL` / `EDITOR`: `OPEN_MEMO_EDITOR` が未設定の場合のフォールバック

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
date: 2026-01-30 12:34
tags: tag1, tag2
---

# Your Title
```

## コントリビュート

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
