import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ExplorerTree } from './CppProjectManager';
import { TreeNode } from './TreeNode';

export function activate(context: vscode.ExtensionContext)
{
	var rootPath = vscode.workspace.rootPath;
	const cppProjectManagerInstance = new ExplorerTree(rootPath);
	vscode.window.createTreeView('cppProjectManager', {treeDataProvider: cppProjectManagerInstance, showCollapseAll: true});
	vscode.commands.registerCommand('cppExplorer.refresh', () => 
		cppProjectManagerInstance.refresh());
	vscode.commands.registerCommand('cppExplorer.addProject', (node: TreeNode) => 
		cppProjectManagerInstance.createProject());
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cpp-projectManager.initializeWorkspace', () => {
		if(rootPath === undefined)
		{
			vscode.window.showInformationMessage('Unable to Initialize Workspace: Not in Workspace (No Root Folder).');
		}
		else if(fs.existsSync(rootPath+"/.cp3mWS"))
		{
			vscode.window.showInformationMessage('Unable to Initialize Workspace: Workspace already exists.');
		}
		else
		{
			cppProjectManagerInstance.createWorkspace();
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
