#!/usr/bin/env node
import readline from "node:readline/promises"
import process from "node:process"
import { openEditor } from "./editor.js"
import {
  createMemo,
  deleteMemo,
  listMemos,
  type MemoRecord,
} from "./storage.js"
import { runTui } from "./tui.js"

const COLUMN_WIDTH = 30
const COMMANDS = ["new", "list", "edit", "delete", "grep", "cat", "help"]

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2)

  if (!command) {
    await runTui()
    return
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp()
    return
  }

  if (!COMMANDS.includes(command)) {
    console.error("Unknown command: " + command)
    printHelp()
    process.exit(1)
  }

  switch (command) {
    case "new":
      await handleNew()
      return
    case "list":
      await handleList()
      return
    case "edit":
      await handleEdit(args.join(" ").trim())
      return
    case "delete":
      await handleDelete(args.join(" ").trim())
      return
    case "grep":
      await handleGrep(args.join(" ").trim())
      return
    case "cat":
      await handleCat(args.join(" ").trim())
      return
    default:
      printHelp()
      return
  }
}

async function handleNew(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const title = (await rl.question("Title: ")).trim()
    if (!title) {
      console.error("Title is required.")
      process.exit(1)
    }
    const tagsRaw = (await rl.question("Tags (comma separated, optional): ")).trim()
    const tags = tagsRaw ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean) : []
    const memo = await createMemo(title, tags)
    openEditor(memo.filePath)
  } finally {
    rl.close()
  }
}

async function handleList(): Promise<void> {
  const memos = await listMemos()
  if (memos.length === 0) {
    console.log("No memos found.")
    return
  }
  memos.forEach((memo) => {
    const name = memo.id.padEnd(COLUMN_WIDTH, " ")
    console.log(name + " : " + memo.title)
  })
}

async function handleEdit(query: string): Promise<void> {
  const memo = await selectMemo(query)
  openEditor(memo.filePath)
}

async function handleDelete(query: string): Promise<void> {
  const memo = await selectMemo(query)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = (await rl.question('Delete "' + memo.title + '"? [y/N]: ')).trim().toLowerCase()
    if (answer === "y" || answer === "yes") {
      await deleteMemo(memo.id)
      console.log("Deleted " + memo.id)
    } else {
      console.log("Canceled.")
    }
  } finally {
    rl.close()
  }
}

async function handleCat(query: string): Promise<void> {
  const memo = await selectMemo(query)
  console.log(memo.content)
}

async function handleGrep(pattern: string): Promise<void> {
  if (!pattern) {
    console.error("Pattern is required for grep.")
    process.exit(1)
  }
  const memos = await listMemos()
  if (memos.length === 0) {
    console.log("No memos found.")
    return
  }

  const matcher = buildMatcher(pattern)
  memos.forEach((memo) => {
    const lines = memo.content.split("\n")
    lines.forEach((line, index) => {
      const match = matcher ? matcher.test(line) : line.toLowerCase().includes(pattern.toLowerCase())
      if (match) {
        console.log(memo.id + ":" + String(index + 1) + ":" + line)
      }
    })
  })
}

async function selectMemo(query: string): Promise<MemoRecord> {
  const memos = await listMemos()
  if (memos.length === 0) {
    console.error("No memos found.")
    process.exit(1)
  }

  if (!query) {
    return promptSelect(memos, "Select memo")
  }

  const normalized = query.toLowerCase()
  const exact = memos.find((memo) => memo.id === query)
  if (exact) return exact

  const matches = memos.filter(
    (memo) => memo.title.toLowerCase().includes(normalized) || memo.id.toLowerCase().includes(normalized),
  )

  if (matches.length === 1) return matches[0]
  if (matches.length === 0) {
    console.error('No memo matches "' + query + '".')
    process.exit(1)
  }

  return promptSelect(matches, 'Multiple matches for "' + query + '"')
}

async function promptSelect(memos: MemoRecord[], label: string): Promise<MemoRecord> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    console.log(label)
    memos.forEach((memo, index) => {
      console.log(String(index + 1) + ". " + memo.title + " (" + memo.id + ")")
    })
    const answer = (await rl.question("Choose number: ")).trim()
    const index = Number(answer) - 1
    if (Number.isNaN(index) || index < 0 || index >= memos.length) {
      console.error("Invalid selection.")
      process.exit(1)
    }
    return memos[index]
  } finally {
    rl.close()
  }
}

function buildMatcher(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern, "i")
  } catch {
    return null
  }
}

function printHelp(): void {
  console.log(
    [
      "openmemo - OpenTUI-based memo app",
      "",
      "Usage:",
      "  openmemo               Launch TUI",
      "  openmemo new           Create memo",
      "  openmemo list          List memos",
      "  openmemo edit <query>  Edit memo",
      "  openmemo delete <query> Delete memo",
      "  openmemo grep <pattern> Search memo contents",
      "  openmemo cat <query>   View memo",
      "  openmemo help          Show help",
      "",
    ].join("\n"),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
