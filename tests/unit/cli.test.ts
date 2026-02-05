import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MemoRecord } from '../../src/storage.js';

// Mock modules
const mockRunTui = vi.fn();
const mockOpenEditor = vi.fn();
const mockCreateMemo = vi.fn();
const mockDeleteMemo = vi.fn();
const mockListMemos = vi.fn();

// Mock readline question responses
let questionResponses: string[] = [];
const mockClose = vi.fn();
const mockQuestion = vi.fn(async () => {
  return questionResponses.shift() ?? '';
});

vi.mock('../../src/tui.js', () => ({ runTui: mockRunTui }));
vi.mock('../../src/editor.js', () => ({ openEditor: mockOpenEditor }));
vi.mock('../../src/storage.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../src/storage.js')>();
  return {
    ...actual,
    createMemo: mockCreateMemo,
    deleteMemo: mockDeleteMemo,
    listMemos: mockListMemos,
  };
});
vi.mock('node:readline/promises', () => ({
  default: {
    createInterface: () => ({
      question: mockQuestion,
      close: mockClose,
    }),
  },
}));

function makeMemo(overrides: Partial<MemoRecord> = {}): MemoRecord {
  return {
    id: '2025-03-15-test.md',
    title: 'Test Memo',
    date: new Date('2025-03-15'),
    tags: [],
    filePath: '/tmp/memos/2025-03-15-test.md',
    content: '---\ntitle: Test Memo\ndate: 2025-03-15\ntags:\n---\n\n# Test Memo\n',
    ...overrides,
  };
}

let exitCode: number | undefined;

// Helper to import cli.ts (which auto-runs main())
async function runCli(...argv: string[]) {
  process.argv = ['node', 'cli.js', ...argv];
  exitCode = undefined;
  await import('../../src/cli.js');
  // Allow the main() promise and .catch() handler to settle
  await new Promise(r => setTimeout(r, 20));
}

const originalExit = process.exit;

describe('CLI', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock process.exit to record exit code without throwing
    process.exit = ((code?: number) => {
      exitCode = code ?? 0;
    }) as never;
    questionResponses = [];
    mockRunTui.mockReset();
    mockOpenEditor.mockReset();
    mockCreateMemo.mockReset();
    mockDeleteMemo.mockReset();
    mockListMemos.mockReset();
    mockQuestion.mockClear();
    mockClose.mockClear();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  describe('no command', () => {
    it('should call runTui when no command given', async () => {
      mockRunTui.mockResolvedValue(undefined);
      await runCli();
      expect(mockRunTui).toHaveBeenCalled();
    });
  });

  describe('help', () => {
    it("should print help for 'help' command", async () => {
      await runCli('help');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('openmemo'));
    });

    it("should print help for '--help' flag", async () => {
      await runCli('--help');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });

    it("should print help for '-h' flag", async () => {
      await runCli('-h');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    });
  });

  describe('unknown command', () => {
    it('should print error and exit(1) for unknown command', async () => {
      await runCli('foobar');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command: foobar'));
      expect(exitCode).toBe(1);
    });
  });

  describe('new', () => {
    it('should prompt for title and tags, then create memo and open editor', async () => {
      questionResponses = ['My New Memo', 'tag1, tag2'];
      const memo = makeMemo({ title: 'My New Memo', tags: ['tag1', 'tag2'] });
      mockCreateMemo.mockResolvedValue(memo);

      await runCli('new');

      expect(mockCreateMemo).toHaveBeenCalledWith('My New Memo', ['tag1', 'tag2']);
      expect(mockOpenEditor).toHaveBeenCalledWith(memo.filePath);
    });

    it('should exit(1) when title is empty', async () => {
      questionResponses = [''];
      await runCli('new');
      expect(errorSpy).toHaveBeenCalledWith('Title is required.');
      expect(exitCode).toBe(1);
    });

    it('should handle empty tags', async () => {
      questionResponses = ['Title Only', ''];
      const memo = makeMemo({ title: 'Title Only' });
      mockCreateMemo.mockResolvedValue(memo);

      await runCli('new');
      expect(mockCreateMemo).toHaveBeenCalledWith('Title Only', []);
    });
  });

  describe('list', () => {
    it('should display memos', async () => {
      mockListMemos.mockResolvedValue([makeMemo()]);
      await runCli('list');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Test Memo'));
    });

    it("should print 'No memos found.' when empty", async () => {
      mockListMemos.mockResolvedValue([]);
      await runCli('list');
      expect(logSpy).toHaveBeenCalledWith('No memos found.');
    });
  });

  describe('edit', () => {
    it('should select memo and open editor', async () => {
      const memo = makeMemo();
      mockListMemos.mockResolvedValue([memo]);
      await runCli('edit', memo.id);
      expect(mockOpenEditor).toHaveBeenCalledWith(memo.filePath);
    });
  });

  describe('delete', () => {
    it("should delete memo on 'y' confirmation", async () => {
      const memo = makeMemo();
      mockListMemos.mockResolvedValue([memo]);
      questionResponses = ['y'];

      await runCli('delete', memo.id);
      expect(mockDeleteMemo).toHaveBeenCalledWith(memo.id);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Deleted'));
    });

    it('should cancel on non-y answer', async () => {
      const memo = makeMemo();
      mockListMemos.mockResolvedValue([memo]);
      questionResponses = ['n'];

      await runCli('delete', memo.id);
      expect(mockDeleteMemo).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Canceled.');
    });
  });

  describe('cat', () => {
    it('should print memo content', async () => {
      const memo = makeMemo({ content: 'Hello World' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('cat', memo.id);
      expect(logSpy).toHaveBeenCalledWith('Hello World');
    });
  });

  describe('grep', () => {
    it('should exit(1) when no pattern given', async () => {
      await runCli('grep');
      expect(errorSpy).toHaveBeenCalledWith('Pattern is required for grep.');
      expect(exitCode).toBe(1);
    });

    it('should print matching lines', async () => {
      const memo = makeMemo({ content: 'line1\nfind-me\nline3' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('grep', 'find-me');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('find-me'));
    });

    it("should print 'No memos found.' when memos are empty", async () => {
      mockListMemos.mockResolvedValue([]);
      await runCli('grep', 'pattern');
      expect(logSpy).toHaveBeenCalledWith('No memos found.');
    });

    it('should fall back to case-insensitive includes for invalid regex', async () => {
      const memo = makeMemo({ content: 'has [bracket' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('grep', '[bracket');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[bracket'));
    });
  });

  describe('selectMemo', () => {
    it('should return exact match by id', async () => {
      const memo = makeMemo();
      mockListMemos.mockResolvedValue([memo]);
      await runCli('cat', memo.id);
      expect(logSpy).toHaveBeenCalledWith(memo.content);
    });

    it('should return single fuzzy match', async () => {
      const memo = makeMemo({ id: '2025-03-15-unique.md', title: 'Unique Title' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('cat', 'Unique');
      expect(logSpy).toHaveBeenCalledWith(memo.content);
    });

    it('should prompt when multiple matches found', async () => {
      const memo1 = makeMemo({
        id: '2025-03-15-test-a.md',
        title: 'Test A',
        content: 'Content A',
      });
      const memo2 = makeMemo({
        id: '2025-03-15-test-b.md',
        title: 'Test B',
        content: 'Content B',
      });
      mockListMemos.mockResolvedValue([memo1, memo2]);
      questionResponses = ['1'];

      await runCli('cat', 'Test');
      expect(logSpy).toHaveBeenCalledWith('Content A');
    });

    it('should exit(1) when no match found', async () => {
      mockListMemos.mockResolvedValue([makeMemo()]);
      await runCli('cat', 'nonexistent');
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('No memo matches'));
      expect(exitCode).toBe(1);
    });

    it('should exit(1) when no memos exist', async () => {
      mockListMemos.mockResolvedValue([]);
      await runCli('edit', 'anything');
      expect(errorSpy).toHaveBeenCalledWith('No memos found.');
      expect(exitCode).toBe(1);
    });
  });

  describe('promptSelect', () => {
    it('should return selected memo', async () => {
      const memo1 = makeMemo({ id: 'a.md', title: 'A', content: 'Content A' });
      const memo2 = makeMemo({ id: 'b.md', title: 'B', content: 'Content B' });
      mockListMemos.mockResolvedValue([memo1, memo2]);
      questionResponses = ['2'];

      await runCli('cat');
      expect(logSpy).toHaveBeenCalledWith('Content B');
    });

    it('should exit(1) on invalid selection', async () => {
      const memo = makeMemo();
      mockListMemos.mockResolvedValue([memo]);
      questionResponses = ['999'];

      await runCli('cat');
      expect(errorSpy).toHaveBeenCalledWith('Invalid selection.');
      expect(exitCode).toBe(1);
    });
  });

  describe('buildMatcher', () => {
    it('should match with regex pattern', async () => {
      const memo = makeMemo({ content: 'foo123bar' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('grep', 'foo\\d+bar');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('foo123bar'));
    });

    it('should return null for invalid regex (tested via fallback)', async () => {
      const memo = makeMemo({ content: 'test (unclosed' });
      mockListMemos.mockResolvedValue([memo]);
      await runCli('grep', '(unclosed');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('(unclosed'));
    });
  });
});
