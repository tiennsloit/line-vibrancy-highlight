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
    console.log('LineVibrancy: Extension activating...');
    const cssFilePath = path.join(context.extensionPath, 'vibrancy.css');
    console.log('LineVibrancy: CSS file path:', cssFilePath);
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

    const isDebugMode = process.env.VSCODE_PID !== undefined;
    console.log('LineVibrancy: Debug mode:', isDebugMode);

    const enableVibrancy = async () => {
        try {
            const config = vscode.workspace.getConfiguration('lineVibrancy');
            const enableVibrancy = config.get('enableVibrancy', true);
            if (!enableVibrancy) {
                console.log('LineVibrancy: Vibrancy disabled via configuration');
                return;
            }

            if (process.platform === 'linux') {
                vscode.window.showWarningMessage(
                    'LineVibrancy: Transparency may not work on Linux due to limited backdrop-filter support. The highlight feature is still available.'
                );
            }

            if (!fs.existsSync(cssFilePath)) {
                fs.writeFileSync(cssFilePath, baseVibrancyCSS);
                console.log('LineVibrancy: vibrancy.css created');
            }
            const currentCSS = config.get('customCSS');
            if (!currentCSS) {
                await config.update('customCSS', cssFilePath, vscode.ConfigurationTarget.Global);
                console.log('LineVibrancy: customCSS updated in settings');
                vscode.window.showInformationMessage(
                    'LineVibrancy: Transparency enabled. Restart VSCode to apply the effect. To suppress the [Unsupported] warning, install the "Fix VSCode Checksums" extension.',
                    'Open Extensions'
                ).then(selection => {
                    if (selection === 'Open Extensions') {
                        vscode.commands.executeCommand('workbench.view.extensions');
                    }
                });
            }

            // Check terminal GPU acceleration setting
            const disableGpu = config.get('disableTerminalGpuAcceleration', false);
            if (disableGpu) {
                const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');
                const currentGpuSetting = terminalConfig.get('gpuAcceleration');
                if (currentGpuSetting !== 'off') {
                    await terminalConfig.update('gpuAcceleration', 'off', vscode.ConfigurationTarget.Global);
                    console.log('LineVibrancy: Set terminal.integrated.gpuAcceleration to "off"');
                    vscode.window.showInformationMessage(
                        'LineVibrancy: Disabled terminal GPU acceleration to prevent rendering issues. Restart VSCode to apply.'
                    );
                }
            }
        } catch (error) {
            console.error('LineVibrancy: Failed to enable vibrancy:', error.message);
            vscode.window.showErrorMessage(`LineVibrancy: Failed to enable vibrancy - ${error.message}`);
        }
    };

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

            // Get all cursor positions (supports multiple cursors)
            const cursorLines = new Set();
            editor.selections.forEach(selection => {
                cursorLines.add(selection.active.line);
            });

            // Dim all lines except those with cursors
            const ranges = [];
            for (let i = 0; i < editor.document.lineCount; i++) {
                if (!cursorLines.has(i)) {
                    const range = new vscode.Range(i, 0, i, editor.document.lineAt(i).text.length);
                    ranges.push(range);
                }
            }
            editor.setDecorations(dimDecorationType, ranges);
            console.log('LineVibrancy: Highlight decorations applied for', cursorLines.size, 'cursor(s)');
        } else {
            if (dimDecorationType) {
                editor.setDecorations(dimDecorationType, []);
                dimDecorationType.dispose();
                dimDecorationType = null;
                console.log('LineVibrancy: Highlight decorations cleared');
            }
        }
    };

    console.log('LineVibrancy: Calling enableVibrancy');
    enableVibrancy();

    let enableVibrancyCommand = vscode.commands.registerCommand('lineVibrancy.enableVibrancy', enableVibrancy);

    let disableVibrancy = vscode.commands.registerCommand('lineVibrancy.disableVibrancy', async () => {
        try {
            const config = vscode.workspace.getConfiguration('lineVibrancy');
            await config.update('customCSS', undefined, vscode.ConfigurationTarget.Global);
            await config.update('enableVibrancy', false, vscode.ConfigurationTarget.Global);
            if (fs.existsSync(cssFilePath)) {
                fs.unlinkSync(cssFilePath);
                console.log('LineVibrancy: vibrancy.css deleted');
            }
            isHighlightActive = false;
            updateHighlightDecorations();
            vscode.window.showInformationMessage('LineVibrancy: Transparency disabled. Restart VSCode to remove the effect.');
        } catch (error) {
            console.error('LineVibrancy: Failed to disable vibrancy:', error.message);
            vscode.window.showErrorMessage(`LineVibrancy: Failed to disable vibrancy - ${error.message}`);
        }
    });

    let toggleHighlight = vscode.commands.registerCommand('lineVibrancy.toggleHighlight', async () => {
        try {
            isHighlightActive = !isHighlightActive;
            console.log('LineVibrancy: Highlight toggled, highlightActive:', isHighlightActive);
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
            console.log('LineVibrancy: vibrancy.css updated');

            const configCSS = config.get('customCSS');
            if (configCSS) {
                await config.update('customCSS', cssFilePath, vscode.ConfigurationTarget.Global);
                if (!isDebugMode) {
                    vscode.window.showInformationMessage(`LineVibrancy: Highlight effect ${isHighlightActive ? 'enabled' : 'disabled'}. Restart VSCode to apply in non-debug mode.`);
                }
            } else {
                vscode.window.showWarningMessage('LineVibrancy: Enable vibrancy first to use the highlight effect.');
                isHighlightActive = false;
                updateHighlightDecorations();
            }
        } catch (error) {
            console.error('LineVibrancy: Failed to toggle highlight:', error.message);
            vscode.window.showErrorMessage(`LineVibrancy: Failed to toggle highlight - ${error.message}`);
        }
    });

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateHighlightDecorations),
        vscode.window.onDidChangeTextEditorSelection(updateHighlightDecorations)
    );

    context.subscriptions.push(enableVibrancyCommand);
    context.subscriptions.push(disableVibrancy);
    context.subscriptions.push(toggleHighlight);
    console.log('LineVibrancy: Extension activated successfully');
}

function deactivate() {
    console.log('LineVibrancy: Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};