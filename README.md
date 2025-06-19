# Line Vibrancy

Line Vibrancy adds a overlay background to Visual Studio Code and allows you to highlight the current line with a shortcut (`Cmd+Alt+Z`). The Overlay effect creates a modern, vibrant look, while the highlight feature dims all lines except the current one for better focus.

## Features

- **Overlay Background**: Applies a glass-like effect to VSCode’s window (requires a restart).
- **Current Line Highlight**: Toggle dimming of non-current lines with `Cmd+Alt+Z` (real-time).
- **Platform Support**: Best on macOS and Windows (Acrylic); limited on Linux.

## Installation

1. Install from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=tiennsloit.line-vibrancy).
2. Enable the extension. You’ll be prompted to restart VSCode to apply the Overlay effect.
3. (Optional) Install the [Fix VSCode Checksums](https://marketplace.visualstudio.com/items?itemName=lehni.vscode-fix-checksums) extension to suppress the `[Unsupported]` warning caused by custom CSS.

## Usage

- **Enable Overlay**: Run `Line Vibrancy: Enable Overlay` from the Command Palette (`Cmd+Alt+P`) or enable automatically on activation. Restart VSCode to apply.
- **Disable Overlay**: Run `Line Vibrancy: Disable Overlay` and restart VSCode.
- **Toggle Highlight**: Press `Cmd+Alt+Z` (or `Ctrl+Shift+Z` on Windows/Linux) in an editor to dim all lines except the current one.
- **Settings**:
  - `lineVibrancy.enableVibrancy`: Enable/disable the Overlay effect (default: `true`).
  - `lineVibrancy.customCSS`: Path to the CSS file (set automatically).

## Platform Notes

- **macOS**: Full support for Overlay.
- **Windows**: Requires Acrylic (Windows 10/11). Enable Overlay effects in Settings > Personalization > Colors.
- **Linux**: Overlay may not work due to limited `backdrop-filter` support. The highlight feature works normally.

## Troubleshooting

- **Restart Required**: Overlay changes require a VSCode restart.
- **[Unsupported] Warning**: Install **Fix VSCode Checksums** to resolve.
- **No Overlay**: Ensure your platform supports `backdrop-filter` and restart VSCode after enabling.

## Contributing
File issues or contribute at [GitHub](https://github.com/yourusername/line-vibrancy).

## License
MIT