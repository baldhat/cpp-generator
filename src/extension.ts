import * as vscode from 'vscode';
import * as path from 'path';
import { execSync } from 'child_process';

// --- Utility Functions ---

function getGitConfig(key: string, targetPath: string): string {
    try {
        return execSync(`git config ${key}`, { cwd: targetPath }).toString().trim();
    } catch (e) {
        return "Unknown";
    }
}

function toFileNameSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase();
}

function toGuardSnakeCase(str: string): string {
    return str.replace(/_/g, '__').replace(/([a-z])([A-Z])/g, '$1__$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1__$2').toUpperCase();
}

function processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cpp-generator.createClass', async (uri: vscode.Uri) => {
        
        let targetPath: string | undefined;

        if (uri && uri.fsPath) {
            targetPath = uri.fsPath;
        } else {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                targetPath = path.dirname(activeEditor.document.uri.fsPath);
            } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
        }

        if (!targetPath) {
            vscode.window.showErrorMessage("Could not determine where to create the files. Open a file first.");
            return;
        }

        const classType = await vscode.window.showQuickPick(['Standard Class', 'Interface'], {
            placeHolder: 'What type of class would you like to create?'
        });
        if (!classType) return;

        const namespace = await vscode.window.showInputBox({ prompt: "Namespace", placeHolder: "ns::sub" }) || "";
        const className = await vscode.window.showInputBox({ prompt: "Class Name", placeHolder: "MyClass" });
        if (!className) return;

        const fileName = toFileNameSnakeCase(className);
        const config = vscode.workspace.getConfiguration('cppGenerator');
        
        const hppRaw = classType === 'Interface' 
            ? config.get<string>('interfaceHppTemplate', '') 
            : config.get<string>('hppTemplate', '');
        
        const cppRaw = config.get<string>('cppTemplate', '');
        const dateFormat = config.get<string>('dateFormat', 'YYYY-MM-DD');

        const now = new Date();
        const date = dateFormat
            .replace('YYYY', now.getFullYear().toString())
            .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
            .replace('DD', now.getDate().toString().padStart(2, '0'));

        const authorName = getGitConfig('user.name', targetPath);
        const authorEmail = getGitConfig('user.email', targetPath);

        const guardNamespace = namespace.split('::').map(toGuardSnakeCase).join('_');
        const guardClass = toGuardSnakeCase(className);
        const includeGuard = namespace ? `${guardNamespace}_${guardClass}_HPP` : `${guardClass}_HPP`;

        const vars: Record<string, string> = {
            "CLASS_NAME": className,
            "FILE_NAME": fileName,
            "NAMESPACE": namespace,
            "INCLUDE_GUARD": includeGuard,
            "DATE": date,
            "AUTHOR_NAME": authorName,
            "AUTHOR_EMAIL": authorEmail
        };

        const hppContent = processTemplate(hppRaw, vars);
        const cppContent = processTemplate(cppRaw, vars);

        const hppPath = path.join(targetPath, `${fileName}.hpp`);
        const cppPath = path.join(targetPath, `${fileName}.cpp`);

        const wsEdit = new vscode.WorkspaceEdit();
        wsEdit.createFile(vscode.Uri.file(hppPath), { ignoreIfExists: true });
        
        if (classType === 'Standard Class') {
            wsEdit.createFile(vscode.Uri.file(cppPath), { ignoreIfExists: true });
        }
        
        await vscode.workspace.applyEdit(wsEdit);

        await vscode.workspace.fs.writeFile(vscode.Uri.file(hppPath), Buffer.from(hppContent, 'utf8'));
        
        if (classType === 'Standard Class') {
            await vscode.workspace.fs.writeFile(vscode.Uri.file(cppPath), Buffer.from(cppContent, 'utf8'));
        }

        const doc = await vscode.workspace.openTextDocument(hppPath);
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(`Created ${classType}: ${fileName}.hpp`);
    });

    context.subscriptions.push(disposable);
}