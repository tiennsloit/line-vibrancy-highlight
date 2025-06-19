# Line Vibrancy

Line Vibrancy adds a transparent background to Visual Studio Code and allows you to highlight the current line with a shortcut (`Cmd+Shift+Z`). The transparency effect creates a modern, vibrant look, while the highlight feature dims all lines except the current one for better focus.

## Features

- **Transparent Background**: Applies a glass-like effect to VSCode’s window (requires a restart).
- **Current Line Highlight**: Toggle dimming of non-current lines with `Cmd+Shift+Z` (real-time).
- **Platform Support**: Best on macOS and Windows (Acrylic); limited on Linux.

## Installation

1. Install from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=tiennsloit.line-vibrancy).
2. Enable the extension. You’ll be prompted to restart VSCode to apply the transparency effect.
3. (Optional) Install the [Fix VSCode Checksums](https://marketplace.visualstudio.com/items?itemName=lehni.vscode-fix-checksums) extension to suppress the `[Unsupported]` warning caused by custom CSS.

## Usage

- **Enable Transparency**: Run `Line Vibrancy: Enable Transparency` from the Command Palette (`Cmd+Shift+P`) or enable automatically on activation. Restart VSCode to apply.
- **Disable Transparency**: Run `Line Vibrancy: Disable Transparency` and restart VSCode.
- **Toggle Highlight**: Press `Cmd+Shift+Z` (or `Ctrl+Shift+Z` on Windows/Linux) in an editor to dim all lines except the current one.
- **Settings**:
  - `lineVibrancy.enableVibrancy`: Enable/disable the transparency effect (default: `true`).
  - `lineVibrancy.customCSS`: Path to the CSS file (set automatically).

## Platform Notes

- **macOS**: Full support for transparency.
- **Windows**: Requires Acrylic (Windows 10/11). Enable Transparency effects in Settings > Personalization > Colors.
- **Linux**: Transparency may not work due to limited `backdrop-filter` support. The highlight feature works normally.

## Troubleshooting

- **Restart Required**: Transparency changes require a VSCode restart.
- **[Unsupported] Warning**: Install **Fix VSCode Checksums** to resolve.
- **No Transparency**: Ensure your platform supports `backdrop-filter` and restart VSCode after enabling.

## Contributing
File issues or contribute at [GitHub](https://github.com/yourusername/line-vibrancy).

## License
MIT