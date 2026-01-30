# openmemo

OpenTUI-based memo app inspired by [mattn/memo](https://github.com/mattn/memo).

## Installation

```bash
npm install -g openmemo
```

Or with other package managers:
```bash
pnpm add -g openmemo
yarn global add openmemo
```

## Usage

Launch the TUI:
```bash
openmemo
```

Create a memo:
```bash
openmemo new
```

Other commands:
```bash
openmemo list           # List memos
openmemo edit <query>   # Edit memo
openmemo delete <query> # Delete memo
openmemo grep <pattern> # Search memo contents
openmemo cat <query>    # View memo
openmemo help           # Show help
```

## Configuration

Environment variables:
- `OPEN_MEMO_DIR`: Override memo storage directory
- `OPEN_MEMO_EDITOR`: Preferred editor command
- `VISUAL` / `EDITOR`: Fallbacks if `OPEN_MEMO_EDITOR` is not set

## Supported Platforms

- macOS (Apple Silicon & Intel)
- Linux (x64 & ARM64)
- Windows (x64)

## Links

- [GitHub Repository](https://github.com/arkjun/openmemo)
- [Report Issues](https://github.com/arkjun/openmemo/issues)

## License

MIT
