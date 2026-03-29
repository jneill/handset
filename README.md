# Handset

A frameless, always-on-top mobile viewport browser. Open any URL in a 465x722 window that emulates an iPhone — perfect for demos and presentations.

## Install & Run

```bash
# Run directly (no install needed)
npx handset

# Open a specific URL
npx handset example.com

# Install globally
npm install -g handset
handset
handset example.com
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+L` | Change URL |
| `Cmd+R` | Reload |
| `Cmd+Shift+R` | Clear all cache & data, then reload |
| `Cmd+0` | Reset window to default size (465x722) |
| `Cmd+Shift+I` | Toggle DevTools |

## Menu Options

All options are available from the macOS menu bar:

- **Navigate > Change URL...** — Enter a new URL to display
- **Navigate > Reload** — Refresh the current page
- **View > Always on Top** — Toggle window floating (default: on)
- **View > Reset Window Size** — Snap back to 465x722
- **View > Clear Cache & Data** — Wipe cookies, localStorage, cache, and reload

## Features

- Frameless window — no chrome, just content
- Mobile user agent (iPhone Safari) — sites serve their mobile layout
- URL persisted between sessions
- Resizable window with one-click reset
- Always-on-top by default for overlay during presentations

## License

MIT
