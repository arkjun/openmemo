import { describe, it, expect } from 'vitest'
import { buildMemoTemplate, parseMemoMetadata } from '../../src/storage.js'

describe('buildMemoTemplate', () => {
  it('should build template with title, tags, and date', () => {
    const date = new Date('2025-03-15T14:30:00')
    const result = buildMemoTemplate('Test Memo', ['tag1', 'tag2'], date)

    expect(result).toContain('title: Test Memo')
    expect(result).toContain('date: 2025-03-15 14:30')
    expect(result).toContain('tags: tag1, tag2')
    expect(result).toContain('# Test Memo')
    expect(result).toMatch(/^---\n/)
  })

  it('should handle empty tags', () => {
    const date = new Date('2025-03-15T14:30:00')
    const result = buildMemoTemplate('Test Memo', [], date)

    expect(result).toContain('tags: ')
    expect(result).not.toContain('tags: tag')
  })

  it('should handle single tag', () => {
    const date = new Date('2025-03-15T14:30:00')
    const result = buildMemoTemplate('Test Memo', ['work'], date)

    expect(result).toContain('tags: work')
  })

  it('should create valid frontmatter structure', () => {
    const date = new Date('2025-03-15T14:30:00')
    const result = buildMemoTemplate('Test', [], date)
    const lines = result.split('\n')

    expect(lines[0]).toBe('---')
    expect(lines[4]).toBe('---')
  })
})

describe('parseMemoMetadata', () => {
  it('should parse valid frontmatter', () => {
    const content = `---
title: My Memo
date: 2025-03-15 14:30
tags: work, notes
---

# My Memo

Content here.`

    const result = parseMemoMetadata(content, 'fallback.md')

    expect(result.title).toBe('My Memo')
    expect(result.date.getFullYear()).toBe(2025)
    expect(result.date.getMonth()).toBe(2) // March (0-indexed)
    expect(result.date.getDate()).toBe(15)
    expect(result.tags).toEqual(['work', 'notes'])
  })

  it('should use heading as title when frontmatter title missing', () => {
    const content = `# Some Heading

Content without frontmatter.`

    const result = parseMemoMetadata(content, '2025-03-15-fallback.md')

    expect(result.title).toBe('Some Heading')
  })

  it('should use first line as title when no heading found', () => {
    const content = `Just plain content without title.`

    const result = parseMemoMetadata(content, '2025-03-15-my-memo.md')

    // extractTitleFromBody returns first non-empty line when no heading
    expect(result.title).toBe('Just plain content without title.')
  })

  it('should use fallback filename when content is empty', () => {
    const content = ``

    const result = parseMemoMetadata(content, '2025-03-15-my-memo.md')

    expect(result.title).toBe('2025-03-15-my-memo')
  })

  it('should extract date from filename when not in frontmatter', () => {
    const content = `# Test

No frontmatter date.`

    const result = parseMemoMetadata(content, '2025-03-15-test.md')

    expect(result.date.getFullYear()).toBe(2025)
    expect(result.date.getMonth()).toBe(2) // March
    expect(result.date.getDate()).toBe(15)
  })

  it('should handle invalid date gracefully', () => {
    const content = `---
title: Test
date: invalid-date
---`

    const result = parseMemoMetadata(content, 'test.md')

    expect(result.date).toBeInstanceOf(Date)
    expect(result.date.getTime()).not.toBeNaN()
  })

  it('should parse tags in bracket format', () => {
    const content = `---
title: Test
tags: [tag1, tag2, tag3]
---`

    const result = parseMemoMetadata(content, 'test.md')

    expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should handle empty tags', () => {
    const content = `---
title: Test
tags:
---`

    const result = parseMemoMetadata(content, 'test.md')

    expect(result.tags).toEqual([])
  })

  it('should handle content without frontmatter', () => {
    const content = `# Regular Markdown

Some content here.`

    const result = parseMemoMetadata(content, '2025-01-01-test.md')

    expect(result.title).toBe('Regular Markdown')
    expect(result.tags).toEqual([])
  })
})
