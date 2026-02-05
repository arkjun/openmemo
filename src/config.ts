import os from 'node:os';
import path from 'node:path';

export function getMemoDir(): string {
  const fromEnv = process.env.OPEN_MEMO_DIR;
  if (fromEnv && fromEnv.trim() !== '') {
    return fromEnv;
  }
  return path.join(os.homedir(), '.openmemo', 'memos');
}

export function getEditorCommand(): string {
  return process.env.OPEN_MEMO_EDITOR || process.env.VISUAL || process.env.EDITOR || 'vi';
}
