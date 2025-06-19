Line Vibrancy
Line Vibrancy adds a transparent background to Visual Studio Code and allows you to highlight the current line(s) with a shortcut (Cmd+Shift+Z). The transparency effect creates a modern, vibrant look, while the highlight feature dims all lines except those with active cursors for better focus.
Features

Transparent Background: Applies a glass-like effect to VSCode’s window (requires a restart).
Current Line(s) Highlight: Toggle dimming of non-current lines with Cmd+Shift+Z (real-time). Supports multiple cursors (Cmd+Alt+Up/Down or Ctrl+Alt+Up/Down).
Platform Support: Best on macOS and Windows (Acrylic); limited on Linux.

Installation

Install from the VSCode Marketplace.
Enable the extension. You’ll be prompted to restart VSCode to apply the transparency effect.
(Optional) Install the Fix VSCode Checksums extension to suppress the [Unsupported] warning caused by custom CSS.

Usage

Enable Transparency: Run Line Vibrancy: Enable Transparency from the Command Palette (Cmd+Shift+P) or enable automatically on startup. Restart VSCode to apply.
Disable Transparency: Run Line Vibrancy: Disable Transparency and restart VSCode.
Toggle Highlight: Press Cmd+Shift+Z (or Ctrl+Shift+Z on Windows/Linux) in an editor to dim all lines except those with active cursors. Use Cmd+Alt+Up/Down (or Ctrl+Alt+Up/Down) to add multiple cursors for multi-line highlighting.
Settings:
lineVibrancy.enableVibrancy: Enable/disable the transparent background effect (default: true).
lineVibrancy.customCSS: Path to the CSS file (set automatically).
lineVibrancy.disableTerminalGpuAcceleration: Disable GPU acceleration for the terminal to prevent rendering issues with transparency. Requires a restart (default: false).
lineVibrancy.dimOpacity: Opacity for non-active lines when highlighting is enabled (0.0 to 1.0, default: 0.5). Lower values make non-active lines more transparent.



Platform Notes

macOS: Full support for transparency.
Windows: Requires Acrylic (Windows 10/11). Enable Transparency effects in Settings > Personalization > Colors.
Linux: Transparency may not work due to limited backdrop-filter support. The highlight feature works normally.

Troubleshooting

Restart Required: Transparency and terminal GPU acceleration changes require a VSCode restart.
[Unsupported] Warning: Install Fix VSCode Checksums to resolve.
No Transparency: Ensure your platform supports backdrop-filter and restart VSCode after enabling.
Terminal Rendering Issues: Enable lineVibrancy.disableTerminalGpuAcceleration in settings or manually set:
Open VSCode settings (Cmd+, or Ctrl+,).
Search for terminal.integrated.gpuAcceleration.
Set it to "off".
Restart VSCode.


Highlight Too Subtle/Strong: Adjust lineVibrancy.dimOpacity (e.g., 0.3 for stronger dimming, 0.7 for subtler dimming).

Contributing
File issues or contribute at GitHub.
License
MIT
