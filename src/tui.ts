import {
  BoxRenderable,
  createCliRenderer,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable,
  type SelectOption,
  type KeyEvent,
} from "@opentui/core"
import process from "node:process"
import { openEditor } from "./editor.js"
import { listMemos, type MemoRecord } from "./storage.js"
import { truncateLines } from "./utils.js"

const EMPTY_MESSAGE = "No memos yet. Run openmemo new to create one."

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

  const previewText = new TextRenderable(renderer, {
    id: "openmemo-preview-text",
    width: "100%",
    height: "100%",
    fg: "#e2e8f0",
    content: "",
  })
  previewBox.add(previewText)

  if (memos.length === 0) {
    previewText.content = EMPTY_MESSAGE
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
      previewText.content = EMPTY_MESSAGE
      return
    }
    const header = `${memo.title}\n${memo.id}\n`
    const body = truncateLines(stripFrontmatter(memo.content), 24)
    previewText.content = `${header}\n${body}`
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
