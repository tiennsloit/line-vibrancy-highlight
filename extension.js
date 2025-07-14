const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let constants;
try {
    constants = require('./constants');
} catch (error) {
    console.error('LineVibrancy: Failed to load constants:', error.message);
    constants = {
        DIM_OPACITY: '0.2',
        DIM_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0)',
        CSS_VIEW_LINES_OPACITY: '0.2',
        CSS_VIEW_LINES_BACKGROUND: 'rgba(0, 0, 0, 0)',
        CSS_CURRENT_LINE_OPACITY: '1',
        CSS_CURRENT_LINE_BACKGROUND: 'transparent'
    };
}
const {
    DIM_OPACITY,
    DIM_BACKGROUND_COLOR,
    CSS_VIEW_LINES_OPACITY,
    CSS_VIEW_LINES_BACKGROUND,
    CSS_CURRENT_LINE_OPACITY,
    CSS_CURRENT_LINE_BACKGROUND
} = constants;

function activate(context) {
    const isDebugMode = process.env.VSCODE_PID !== undefined;
    const log = (...args) => {
        if (isDebugMode) {
            console.log(...args);
        }
    };

    log('LineVibrancy: Extension activating...');
    const cssFilePath = path.join(context.extensionPath, 'vibrancy.css');
    log('LineVibrancy: CSS file path:', cssFilePath);
    let isHighlightActive = false;
    let dimDecorationType = null;

    const baseVibrancyCSS = `
        .monaco-workbench {
            background: rgba(255, 255, 255, 0.2) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
        }
        .monaco-workbench .part.titlebar {
            background: transparent !important;
        }
    `;

    log('LineVibrancy: Debug mode:', isDebugMode);

    const updateHighlightDecorations = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        if (isHighlightActive) {
            if (dimDecorationType) {
                dimDecorationType.dispose();
            }

            const config = vscode.workspace.getConfiguration('lineVibrancy');
            const dimOpacity = config.get('dimOpacity', DIM_OPACITY);

            dimDecorationType = vscode.window.createTextEditorDecorationType({
                opacity: dimOpacity,
                backgroundColor: DIM_BACKGROUND_COLOR
            });

            // Get all lines in selections (supporting multi-line selections and multiple cursors)
            const vibrantLines = new Set();
            editor.selections.forEach(selection => {
                const start = Math.min(selection.start.line, selection.end.line);
                const end = Math.max(selection.start.line, selection.end.line);
                for (let line = start; line <= end; line++) {
                    vibrantLines.add(line);
                }
            });

            // Dim all lines except those in selections
            const ranges = [];
            for (let i = 0; i < editor.document.lineCount; i++) {
                if (!vibrantLines.has(i)) {
                    const range = new vscode.Range(i, 0, i, editor.document.lineAt(i).text.length);
                    ranges.push(range);
                }
            }
            editor.setDecorations(dimDecorationType, ranges);
            log('LineVibrancy: Highlight decorations applied for', vibrantLines.size, 'vibrant line(s)');
        } else {
            if (dimDecorationType) {
                editor.setDecorations(dimDecorationType, []);
                dimDecorationType.dispose();
                dimDecorationType = null;
                log('LineVibrancy: Highlight decorations cleared');
            }
        }
    };

    log('LineVibrancy: Calling enableVibrancy');

    let toggleHighlight = vscode.commands.registerCommand('lineVibrancy.toggleHighlight', async () => {
        try {
            isHighlightActive = !isHighlightActive;
            log('LineVibrancy: Highlight toggled, highlightActive:', isHighlightActive);
            updateHighlightDecorations();

            const config = vscode.workspace.getConfiguration('lineVibrancy');
            const dimOpacity = config.get('dimOpacity', CSS_VIEW_LINES_OPACITY);

            const cssContent = isHighlightActive ? baseVibrancyCSS + `
                .monaco-editor .view-lines {
                    background: ${CSS_VIEW_LINES_BACKGROUND} !important;
                }
                .monaco-editor .view-line {
                    opacity: ${dimOpacity} !important;
                }
                .monaco-editor .current-line {
                    opacity: ${CSS_CURRENT_LINE_OPACITY} !important;
                    background: ${CSS_CURRENT_LINE_BACKGROUND} !important;
                }
            ` : baseVibrancyCSS;
            fs.writeFileSync(cssFilePath, cssContent);
            log('LineVibrancy: vibrancy.css updated');
            
        } catch (error) {
            console.error('LineVibrancy: Failed to toggle highlight:', error.message);
            vscode.window.showErrorMessage(`LineVibrancy: Failed to toggle highlight - ${error.message}`);
        }
    });

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateHighlightDecorations),
        vscode.window.onDidChangeTextEditorSelection(updateHighlightDecorations)
    );

    context.subscriptions.push(toggleHighlight);
    log('LineVibrancy: Extension activated successfully');
}

function deactivate() {
    console.log('LineVibrancy: Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};