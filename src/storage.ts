import fs from "node:fs/promises"
import path from "node:path"
import { getMemoDir } from "./config.js"
import { formatDate, formatDateTime, slugify } from "./utils.js"

export interface MemoRecord {
  id: string
  title: string
  date: Date
  tags: string[]
  filePath: string
  content: string
}

export async function ensureMemoDir(): Promise<string> {
  const memoDir = getMemoDir()
  await fs.mkdir(memoDir, { recursive: true })
  return memoDir
}

export async function listMemos(): Promise<MemoRecord[]> {
  const memoDir = await ensureMemoDir()
  const entries = await fs.readdir(memoDir, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))

  const memos = await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(memoDir, entry.name)
      const content = await fs.readFile(filePath, "utf8")
      const { title, date, tags } = parseMemoMetadata(content, entry.name)
      return {
        id: entry.name,
        title,
        date,
        tags,
        filePath,
        content,
      }
    }),
  )

  return memos.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export async function loadMemo(id: string): Promise<MemoRecord | null> {
  const memoDir = await ensureMemoDir()
  const filePath = path.join(memoDir, id)
  try {
    const content = await fs.readFile(filePath, "utf8")
    const { title, date, tags } = parseMemoMetadata(content, id)
    return { id, title, date, tags, filePath, content }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    throw error
  }
}

export async function createMemo(title: string, tags: string[]): Promise<MemoRecord> {
  const memoDir = await ensureMemoDir()
  const now = new Date()
  const slug = slugify(title) || "memo"
  const fileName = `${formatDate(now)}-${slug}.md`
  const filePath = path.join(memoDir, fileName)
  const content = buildMemoTemplate(title, tags, now)

  await fs.writeFile(filePath, content, "utf8")

  return {
    id: fileName,
    title,
    date: now,
    tags,
    filePath,
    content,
  }
}

export async function deleteMemo(id: string): Promise<void> {
  const memoDir = await ensureMemoDir()
  const filePath = path.join(memoDir, id)
  await fs.unlink(filePath)
}

export function buildMemoTemplate(title: string, tags: string[], date: Date): string {
  const tagValue = tags.length ? tags.join(", ") : ""
  return [
    "---",
    `title: ${title}`,
    `date: ${formatDateTime(date)}`,
    `tags: ${tagValue}`,
    "---",
    "",
    `# ${title}`,
    "",
  ].join("\n")
}

export function parseMemoMetadata(
  content: string,
  fallbackName: string,
): { title: string; date: Date; tags: string[] } {
  const frontmatter = parseFrontmatter(content)
  const fallbackTitle = fallbackName.replace(/\.md$/, "")
  const title = frontmatter.meta.title || extractTitleFromBody(frontmatter.body) || fallbackTitle
  const date = frontmatter.meta.date ? new Date(frontmatter.meta.date) : dateFromFilename(fallbackName)
  const tags = parseTags(frontmatter.meta.tags)

  return {
    title,
    date: isNaN(date.getTime()) ? new Date() : date,
    tags,
  }
}

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  if (!content.startsWith("---\n")) {
    return { meta: {}, body: content }
  }

  const endIndex = content.indexOf("\n---", 4)
  if (endIndex === -1) {
    return { meta: {}, body: content }
  }

  const raw = content.slice(4, endIndex).trim()
  const body = content.slice(endIndex + 4).replace(/^\s*\n/, "")
  const meta: Record<string, string> = {}

  raw.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":")
    const normalizedKey = key?.trim()
    if (!normalizedKey) return
    meta[normalizedKey] = rest.join(":").trim()
  })

  return { meta, body }
}

function extractTitleFromBody(body: string): string {
  const lines = body.split("\n").map((line) => line.trim())
  const heading = lines.find((line) => line.startsWith("#"))
  if (heading) {
    return heading.replace(/^#+\s*/, "").trim()
  }
  return lines.find((line) => line.length > 0) || ""
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.replace(/^[\[]|[\]]$/g, "")
  return trimmed
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function dateFromFilename(fileName: string): Date {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-/)
  if (!match) return new Date()
  return new Date(`${match[1]}T00:00:00`)
}
