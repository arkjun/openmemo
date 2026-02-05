import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, pad2, slugify, truncateLines } from '../../src/utils.js';

describe('pad2', () => {
  it('should pad single digit numbers with leading zero', () => {
    expect(pad2(1)).toBe('01');
    expect(pad2(9)).toBe('09');
  });

  it('should not pad double digit numbers', () => {
    expect(pad2(10)).toBe('10');
    expect(pad2(99)).toBe('99');
  });

  it('should handle zero', () => {
    expect(pad2(0)).toBe('00');
  });
});

describe('formatDate', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2025-03-15T10:30:00');
    expect(formatDate(date)).toBe('2025-03-15');
  });

  it('should pad single digit months and days', () => {
    const date = new Date('2025-01-05T00:00:00');
    expect(formatDate(date)).toBe('2025-01-05');
  });
});

describe('formatDateTime', () => {
  it('should format date and time as YYYY-MM-DD HH:MM', () => {
    const date = new Date('2025-03-15T14:05:00');
    expect(formatDateTime(date)).toBe('2025-03-15 14:05');
  });

  it('should pad single digit hours and minutes', () => {
    const date = new Date('2025-01-01T05:03:00');
    expect(formatDateTime(date)).toBe('2025-01-01 05:03');
  });
});

describe('slugify', () => {
  it('should convert to lowercase and replace spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('Hello   World---Test')).toBe('hello-world-test');
  });

  it('should trim whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('should handle Korean characters by removing them', () => {
    expect(slugify('Hello 한글 World')).toBe('hello-world');
  });
});

describe('truncateLines', () => {
  it('should return original content if under maxLines', () => {
    const input = 'line1\nline2\nline3';
    expect(truncateLines(input, 5)).toBe(input);
  });

  it('should truncate and add ellipsis when over maxLines', () => {
    const input = 'line1\nline2\nline3\nline4\nline5';
    expect(truncateLines(input, 3)).toBe('line1\nline2\nline3\n...');
  });

  it('should handle exactly maxLines', () => {
    const input = 'line1\nline2\nline3';
    expect(truncateLines(input, 3)).toBe(input);
  });

  it('should handle single line', () => {
    expect(truncateLines('single line', 5)).toBe('single line');
  });

  it('should handle empty string', () => {
    expect(truncateLines('', 5)).toBe('');
  });
});
