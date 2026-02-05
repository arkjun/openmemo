import {
  BoxRenderable,
  createCliRenderer,
  MarkdownRenderable,
  RGBA,
  SelectRenderable,
  SelectRenderableEvents,
  SyntaxStyle,
  type SelectOption,
  type KeyEvent,
} from "@opentui/core"
import process from "node:process"
import { openEditor } from "./editor.js"
import { listMemos, type MemoRecord } from "./storage.js"

const EMPTY_MESSAGE = "No memos yet. Run openmemo new to create one."

const markdownStyle = SyntaxStyle.fromStyles({
  "default":              { fg: RGBA.fromHex("#cbd5e1") },

  // Headings — per-level colors
  "markup.heading":       { fg: RGBA.fromHex("#f97316"), bold: true },
  "markup.heading.1":     { fg: RGBA.fromHex("#f97316"), bold: true },
  "markup.heading.2":     { fg: RGBA.fromHex("#38bdf8"), bold: true },
  "markup.heading.3":     { fg: RGBA.fromHex("#a78bfa"), bold: true },
  "markup.heading.4":     { fg: RGBA.fromHex("#4ade80"), bold: true },
  "markup.heading.5":     { fg: RGBA.fromHex("#fbbf24"), bold: true },
  "markup.heading.6":     { fg: RGBA.fromHex("#f472b6"), bold: true },

  // Inline
  "markup.strong":        { bold: true },
  "markup.italic":        { italic: true },
  "markup.strikethrough": { dim: true },
  "markup.raw":           { fg: RGBA.fromHex("#fbbf24") },
  "markup.link":          { fg: RGBA.fromHex("#38bdf8"), underline: true },
  "markup.link.url":      { fg: RGBA.fromHex("#64748b") },
  "markup.list":          { fg: RGBA.fromHex("#f97316") },
  "punctuation.special":  { fg: RGBA.fromHex("#64748b") },

  // Code block syntax highlighting (Monokai-inspired)
  "keyword":              { fg: RGBA.fromHex("#f97316") },
  "string":               { fg: RGBA.fromHex("#a6e22e") },
  "comment":              { fg: RGBA.fromHex("#75715e"), italic: true },
  "function":             { fg: RGBA.fromHex("#66d9ef") },
  "variable":             { fg: RGBA.fromHex("#e2e8f0") },
  "type":                 { fg: RGBA.fromHex("#a78bfa") },
  "number":               { fg: RGBA.fromHex("#ae81ff") },
  "operator":             { fg: RGBA.fromHex("#f92672") },
  "constant":             { fg: RGBA.fromHex("#ae81ff") },
  "property":             { fg: RGBA.fromHex("#66d9ef") },
  "punctuation":          { fg: RGBA.fromHex("#cbd5e1") },
})

export async function runTui(): Promise<void> {
  const memos = await listMemos()
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
  })

  renderer.setBackgroundColor("#0f172a")

  const container = new BoxRenderable(renderer, {
    id: "openmemo-container",
    flexDirection: "row",
    width: "100%",
    height: "100%",
    padding: 1,
  })
  renderer.root.add(container)

  const listBox = new BoxRenderable(renderer, {
    id: "openmemo-list",
    flexGrow: 1,
    marginRight: 1,
    border: true,
    borderStyle: "single",
    borderColor: "#334155",
    title: "Memos",
    titleAlignment: "left",
    backgroundColor: "#0b1220",
    shouldFill: true,
  })

  const previewBox = new BoxRenderable(renderer, {
    id: "openmemo-preview",
    flexGrow: 2,
    border: true,
    borderStyle: "single",
    borderColor: "#334155",
    title: "Preview",
    titleAlignment: "left",
    backgroundColor: "#0b1220",
    shouldFill: true,
  })

  container.add(listBox)
  container.add(previewBox)

  const previewMarkdown = new MarkdownRenderable(renderer, {
    id: "openmemo-preview-text",
    width: "100%",
    height: "100%",
    content: "",
    syntaxStyle: markdownStyle,
    conceal: true,
  })
  previewBox.add(previewMarkdown)

  if (memos.length === 0) {
    previewMarkdown.content = EMPTY_MESSAGE
    renderer.start()
    return
  }

  const options: SelectOption[] = memos.map((memo) => ({
    name: memo.title,
    description: memo.id,
    value: memo,
  }))

  const selectElement = new SelectRenderable(renderer, {
    id: "openmemo-select",
    height: "100%",
    options,
    backgroundColor: "transparent",
    focusedBackgroundColor: "transparent",
    selectedBackgroundColor: "#1e293b",
    textColor: "#e2e8f0",
    selectedTextColor: "#38bdf8",
    descriptionColor: "#94a3b8",
    selectedDescriptionColor: "#cbd5e1",
    showDescription: true,
    showScrollIndicator: true,
    wrapSelection: false,
    fastScrollStep: 5,
  })

  listBox.add(selectElement)
  selectElement.focus()

  const updatePreview = (memo: MemoRecord | null) => {
    if (!memo) {
      previewMarkdown.content = EMPTY_MESSAGE
      return
    }
    previewMarkdown.content = stripFrontmatter(memo.content)
  }

  updatePreview(memos[0])

  selectElement.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number, option: SelectOption) => {
    updatePreview(option.value as MemoRecord)
  })

  selectElement.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: SelectOption) => {
    const memo = option.value as MemoRecord
    renderer.destroy()
    openEditor(memo.filePath)
    process.exit(0)
  })

  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    if (key.name === "q" || key.name === "escape") {
      renderer.destroy()
    }
  })

  renderer.start()
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) return content
  const endIndex = content.indexOf("\n---", 4)
  if (endIndex === -1) return content
  return content.slice(endIndex + 4).replace(/^\s*\n/, "")
}
