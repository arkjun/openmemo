import { spawnSync } from "node:child_process"
import { getEditorCommand } from "./config.js"

export function openEditor(filePath: string): void {
  const editor = getEditorCommand()
  const result = spawnSync(editor, [filePath], {
    stdio: "inherit",
  })

  if (result.error) {
    throw result.error
  }
}
