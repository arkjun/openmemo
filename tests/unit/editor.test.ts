import { type SpawnSyncReturns, spawnSync } from 'node:child_process';
import { describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(() => ({ error: undefined })),
}));

vi.mock('../../src/config.js', () => ({
  getEditorCommand: vi.fn(() => 'test-editor'),
}));

describe('openEditor', () => {
  it('should call spawnSync with correct editor and file path', async () => {
    const { openEditor } = await import('../../src/editor.js');
    openEditor('/tmp/test.md');
    expect(spawnSync).toHaveBeenCalledWith('test-editor', ['/tmp/test.md'], { stdio: 'inherit' });
  });

  it('should use stdio: inherit', async () => {
    const { openEditor } = await import('../../src/editor.js');
    openEditor('/tmp/test.md');
    const call = vi.mocked(spawnSync).mock.calls[0];
    expect(call[2]).toEqual({ stdio: 'inherit' });
  });

  it('should throw when spawnSync returns an error', async () => {
    vi.mocked(spawnSync).mockReturnValueOnce({
      error: new Error('editor not found'),
    } as unknown as SpawnSyncReturns<Buffer>);
    const { openEditor } = await import('../../src/editor.js');
    expect(() => openEditor('/tmp/test.md')).toThrow('editor not found');
  });

  it('should use editor from getEditorCommand', async () => {
    const config = await import('../../src/config.js');
    vi.mocked(config.getEditorCommand).mockReturnValue('custom-vim');
    const { openEditor } = await import('../../src/editor.js');
    openEditor('/tmp/file.md');
    expect(spawnSync).toHaveBeenCalledWith('custom-vim', ['/tmp/file.md'], { stdio: 'inherit' });
  });
});
