import * as vscode from 'vscode';
import * as fs from 'fs';
import { CppProjectManager } from './CppProjectManager';

export function activate(context: vscode.ExtensionContext)
{
	var rootPath = vscode.workspace.rootPath;
	const cppTree = new CppProjectManager();
	let disposable = vscode.commands.registerCommand('initializeWorkspace', () => 
	{
		if(rootPath === undefined)
		{
			vscode.window.showInformationMessage('Unable to Initialize Workspace: Not in Workspace (No Root Folder).');
		}
		else if(fs.readdirSync(rootPath).length > 0)
		{
			vscode.window.showInformationMessage('Unable to Initialize Workspace: It is not empty.');
		}
		else
		{
			cppTree.createWorkspace();
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
