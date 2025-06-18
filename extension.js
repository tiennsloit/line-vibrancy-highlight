const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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

            dimDecorationType = vscode.window.createTextEditorDecorationType({
                opacity: '0.2',
                backgroundColor: 'rgba(0, 0, 0, 0)'
            });

            const ranges = [];
            const currentLine = editor.selection.active.line;
            for (let i = 0; i < editor.document.lineCount; i++) {
                if (i !== currentLine) {
                    const range = new vscode.Range(i, 0, i, editor.document.lineAt(i).text.length);
                    ranges.push(range);
                }
            }
            editor.setDecorations(dimDecorationType, ranges);
            console.log('LineVibrancy: Highlight decorations applied');
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

            const cssContent = isHighlightActive ? baseVibrancyCSS + `
                .monaco-editor .view-lines {
                    background: rgba(0, 0, 0, 0.2) !important;
                }
                .monaco-editor .view-line {
                    opacity: 0.2 !important;
                }
                .monaco-editor .current-line {
                    opacity: 1 !important;
                    background: transparent !important;
                }
            ` : baseVibrancyCSS;
            fs.writeFileSync(cssFilePath, cssContent);
            console.log('LineVibrancy: vibrancy.css updated');

            const config = vscode.workspace.getConfiguration('lineVibrancy');
            if (config.get('customCSS')) {
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