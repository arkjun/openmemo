import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildMemoTemplate,
  createMemo,
  deleteMemo,
  ensureMemoDir,
  listMemos,
  loadMemo,
  parseMemoMetadata,
} from '../../src/storage.js';

describe('buildMemoTemplate', () => {
  it('should build template with title, tags, and date', () => {
    const date = new Date('2025-03-15T14:30:00');
    const result = buildMemoTemplate('Test Memo', ['tag1', 'tag2'], date);

    expect(result).toContain('title: Test Memo');
    expect(result).toContain('date: 2025-03-15 14:30');
    expect(result).toContain('tags: tag1, tag2');
    expect(result).toContain('# Test Memo');
    expect(result).toMatch(/^---\n/);
  });

  it('should handle empty tags', () => {
    const date = new Date('2025-03-15T14:30:00');
    const result = buildMemoTemplate('Test Memo', [], date);

    expect(result).toContain('tags: ');
    expect(result).not.toContain('tags: tag');
  });

  it('should handle single tag', () => {
    const date = new Date('2025-03-15T14:30:00');
    const result = buildMemoTemplate('Test Memo', ['work'], date);

    expect(result).toContain('tags: work');
  });

  it('should create valid frontmatter structure', () => {
    const date = new Date('2025-03-15T14:30:00');
    const result = buildMemoTemplate('Test', [], date);
    const lines = result.split('\n');

    expect(lines[0]).toBe('---');
    expect(lines[4]).toBe('---');
  });
});

describe('parseMemoMetadata', () => {
  it('should parse valid frontmatter', () => {
    const content = `---
title: My Memo
date: 2025-03-15 14:30
tags: work, notes
---

# My Memo

Content here.`;

    const result = parseMemoMetadata(content, 'fallback.md');

    expect(result.title).toBe('My Memo');
    expect(result.date.getFullYear()).toBe(2025);
    expect(result.date.getMonth()).toBe(2); // March (0-indexed)
    expect(result.date.getDate()).toBe(15);
    expect(result.tags).toEqual(['work', 'notes']);
  });

  it('should use heading as title when frontmatter title missing', () => {
    const content = `# Some Heading

Content without frontmatter.`;

    const result = parseMemoMetadata(content, '2025-03-15-fallback.md');

    expect(result.title).toBe('Some Heading');
  });

  it('should use first line as title when no heading found', () => {
    const content = `Just plain content without title.`;

    const result = parseMemoMetadata(content, '2025-03-15-my-memo.md');

    // extractTitleFromBody returns first non-empty line when no heading
    expect(result.title).toBe('Just plain content without title.');
  });

  it('should use fallback filename when content is empty', () => {
    const content = ``;

    const result = parseMemoMetadata(content, '2025-03-15-my-memo.md');

    expect(result.title).toBe('2025-03-15-my-memo');
  });

  it('should extract date from filename when not in frontmatter', () => {
    const content = `# Test

No frontmatter date.`;

    const result = parseMemoMetadata(content, '2025-03-15-test.md');

    expect(result.date.getFullYear()).toBe(2025);
    expect(result.date.getMonth()).toBe(2); // March
    expect(result.date.getDate()).toBe(15);
  });

  it('should handle invalid date gracefully', () => {
    const content = `---
title: Test
date: invalid-date
---`;

    const result = parseMemoMetadata(content, 'test.md');

    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getTime()).not.toBeNaN();
  });

  it('should parse tags in bracket format', () => {
    const content = `---
title: Test
tags: [tag1, tag2, tag3]
---`;

    const result = parseMemoMetadata(content, 'test.md');

    expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should handle empty tags', () => {
    const content = `---
title: Test
tags:
---`;

    const result = parseMemoMetadata(content, 'test.md');

    expect(result.tags).toEqual([]);
  });

  it('should handle content without frontmatter', () => {
    const content = `# Regular Markdown

Some content here.`;

    const result = parseMemoMetadata(content, '2025-01-01-test.md');

    expect(result.title).toBe('Regular Markdown');
    expect(result.tags).toEqual([]);
  });
});

describe('FS operations', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openmemo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(testDir, { recursive: true });
    process.env.OPEN_MEMO_DIR = testDir;
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env.OPEN_MEMO_DIR;
  });

  describe('ensureMemoDir', () => {
    it('should create directory and return path', async () => {
      // Remove testDir so ensureMemoDir actually creates it
      await fs.rm(testDir, { recursive: true, force: true });
      const result = await ensureMemoDir();
      expect(result).toBe(testDir);
      const stat = await fs.stat(testDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it('should be idempotent', async () => {
      const first = await ensureMemoDir();
      const second = await ensureMemoDir();
      expect(first).toBe(second);
    });
  });

  describe('createMemo', () => {
    it('should create a .md file', async () => {
      const memo = await createMemo('Test Title', ['tag1']);
      expect(memo.id).toMatch(/^\d{4}-\d{2}-\d{2}-test-title\.md$/);
      const stat = await fs.stat(memo.filePath);
      expect(stat.isFile()).toBe(true);
    });

    it('should write correct frontmatter', async () => {
      const memo = await createMemo('Hello World', ['dev', 'notes']);
      const content = await fs.readFile(memo.filePath, 'utf8');
      expect(content).toContain('title: Hello World');
      expect(content).toContain('tags: dev, notes');
      expect(content).toContain('# Hello World');
    });

    it('should return a valid MemoRecord', async () => {
      const memo = await createMemo('Record Test', ['a']);
      expect(memo.title).toBe('Record Test');
      expect(memo.tags).toEqual(['a']);
      expect(memo.date).toBeInstanceOf(Date);
      expect(memo.content).toContain('title: Record Test');
    });

    it("should use 'memo' as slug when title produces empty slug", async () => {
      const memo = await createMemo('!!!###', []);
      expect(memo.id).toMatch(/^\d{4}-\d{2}-\d{2}-memo\.md$/);
    });
  });

  describe('listMemos', () => {
    it('should return empty array for empty directory', async () => {
      const memos = await listMemos();
      expect(memos).toEqual([]);
    });

    it('should return sorted MemoRecords', async () => {
      await createMemo('First', []);
      // Ensure different timestamps by creating files with different date content
      await fs.writeFile(
        path.join(testDir, '2025-01-01-old.md'),
        '---\ntitle: Old\ndate: 2025-01-01 10:00\ntags:\n---\n\n# Old\n'
      );
      const memos = await listMemos();
      expect(memos.length).toBe(2);
      // Most recent first
      expect(memos[0].date.getTime()).toBeGreaterThanOrEqual(memos[1].date.getTime());
    });

    it('should ignore non-.md files', async () => {
      await createMemo('Test', []);
      await fs.writeFile(path.join(testDir, 'notes.txt'), 'not a memo');
      const memos = await listMemos();
      expect(memos.length).toBe(1);
    });
  });

  describe('loadMemo', () => {
    it('should load an existing memo', async () => {
      const created = await createMemo('Load Test', ['x']);
      const loaded = await loadMemo(created.id);
      expect(loaded).not.toBeNull();
      expect(loaded?.title).toBe('Load Test');
      expect(loaded?.tags).toEqual(['x']);
    });

    it('should return null for missing memo', async () => {
      const result = await loadMemo('nonexistent.md');
      expect(result).toBeNull();
    });

    it('should re-throw non-ENOENT errors', async () => {
      // Create a directory with the same name as the memo file to trigger EISDIR
      await fs.mkdir(path.join(testDir, 'bad-file.md'), { recursive: true });
      await expect(loadMemo('bad-file.md')).rejects.toThrow();
    });
  });

  describe('deleteMemo', () => {
    it('should delete an existing memo', async () => {
      const memo = await createMemo('To Delete', []);
      await deleteMemo(memo.id);
      const files = await fs.readdir(testDir);
      expect(files).not.toContain(memo.id);
    });

    it('should throw for missing file', async () => {
      await expect(deleteMemo('no-such-file.md')).rejects.toThrow();
    });
  });
});
