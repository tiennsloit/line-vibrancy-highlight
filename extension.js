const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('SimpleVibrancy: Extension activating...');
    const cssFilePath = path.join(context.extensionPath, 'vibrancy.css');
    console.log('SimpleVibrancy: CSS file path:', cssFilePath);
    let isHighlightActive = false;
    let dimDecorationType = null;

    const baseVibrancyCSS = `
        .monaco-workbench {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
        }
        .monaco-workbench .part.titlebar {
            background: transparent !important;
        }
    `;

    const isDebugMode = process.env.VSCODE_PID !== undefined;
    console.log('SimpleVibrancy: Debug mode:', isDebugMode);

    const enableVibrancy = async () => {
        try {
            if (!fs.existsSync(cssFilePath)) {
                fs.writeFileSync(cssFilePath, baseVibrancyCSS);
                console.log('SimpleVibrancy: vibrancy.css created');
            }
            const config = vscode.workspace.getConfiguration('simpleVibrancy');
            const currentCSS = config.get('customCSS');
            if (!currentCSS) {
                await config.update('customCSS', cssFilePath, vscode.ConfigurationTarget.Global);
                console.log('SimpleVibrancy: customCSS updated in settings');
                vscode.window.showInformationMessage('SimpleVibrancy: Transparency enabled by default. Restart VSCode to apply the effect in non-debug mode.');
            }
        } catch (error) {
            console.error('SimpleVibrancy: Failed to enable vibrancy:', error.message);
            vscode.window.showErrorMessage(`SimpleVibrancy: Failed to enable vibrancy - ${error.message}`);
        }
    };

    const updateHighlightDecorations = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        if (isHighlightActive) {
            // Dispose existing decoration if any
            if (dimDecorationType) {
                dimDecorationType.dispose();
            }

            // Create decoration for dimming all lines except the current one
            dimDecorationType = vscode.window.createTextEditorDecorationType({
                opacity: '0.5',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
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
            console.log('SimpleVibrancy: Highlight decorations applied');
        } else {
            // Clear decorations
            if (dimDecorationType) {
                editor.setDecorations(dimDecorationType, []);
                dimDecorationType.dispose();
                dimDecorationType = null;
                console.log('SimpleVibrancy: Highlight decorations cleared');
            }
        }
    };

    console.log('SimpleVibrancy: Calling enableVibrancy');
    enableVibrancy();

    let enableVibrancyCommand = vscode.commands.registerCommand('simpleVibrancy.enableVibrancy', enableVibrancy);

    let disableVibrancy = vscode.commands.registerCommand('simpleVibrancy.disableVibrancy', async () => {
        try {
            const config = vscode.workspace.getConfiguration('simpleVibrancy');
            await config.update('customCSS', undefined, vscode.ConfigurationTarget.Global);
            if (fs.existsSync(cssFilePath)) {
                fs.unlinkSync(cssFilePath);
                console.log('SimpleVibrancy: vibrancy.css deleted');
            }
            isHighlightActive = false;
            updateHighlightDecorations();
            vscode.window.showInformationMessage('SimpleVibrancy: Please restart VSCode to remove the transparency effect.');
        } catch (error) {
            console.error('SimpleVibrancy: Failed to disable vibrancy:', error.message);
            vscode.window.showErrorMessage(`SimpleVibrancy: Failed to disable vibrancy - ${error.message}`);
        }
    });

    let toggleHighlight = vscode.commands.registerCommand('simpleVibrancy.toggleHighlight', async () => {
        try {
            isHighlightActive = !isHighlightActive;
            console.log('SimpleVibrancy: Highlight toggled, highlightActive:', isHighlightActive);
            updateHighlightDecorations();

            // Update vibrancy.css for non-debug mode
            const cssContent = isHighlightActive ? baseVibrancyCSS + `
                .monaco-editor .view-lines {
                    background: rgba(0, 0, 0, 0.4) !important;
                }
                .monaco-editor .view-line {
                    opacity: 0.5 !important;
                }
                .monaco-editor .current-line {
                    opacity: 1 !important;
                    background: transparent !important;
                }
            ` : baseVibrancyCSS;
            fs.writeFileSync(cssFilePath, cssContent);
            console.log('SimpleVibrancy: vibrancy.css updated');

            const config = vscode.workspace.getConfiguration('simpleVibrancy');
            if (config.get('customCSS')) {
                await config.update('customCSS', cssFilePath, vscode.ConfigurationTarget.Global);
                if (!isDebugMode) {
                    vscode.window.showInformationMessage(`SimpleVibrancy: Highlight effect ${isHighlightActive ? 'enabled' : 'disabled'}. Restart VSCode to apply in non-debug mode.`);
                }
            } else {
                vscode.window.showWarningMessage('SimpleVibrancy: Enable vibrancy first to use the highlight effect.');
                isHighlightActive = false;
                updateHighlightDecorations();
            }
        } catch (error) {
            console.error('SimpleVibrancy: Failed to toggle highlight:', error.message);
            vscode.window.showErrorMessage(`SimpleVibrancy: Failed to toggle highlight - ${error.message}`);
        }
    });

    // Update decorations when the active editor or selection changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateHighlightDecorations),
        vscode.window.onDidChangeTextEditorSelection(updateHighlightDecorations)
    );

    context.subscriptions.push(enableVibrancyCommand);
    context.subscriptions.push(disableVibrancy);
    context.subscriptions.push(toggleHighlight);
    console.log('SimpleVibrancy: Extension activated successfully');
}

function deactivate() {
    console.log('SimpleVibrancy: Extension deactivated');
}

module.exports = {
    activate,
    deactivate
};