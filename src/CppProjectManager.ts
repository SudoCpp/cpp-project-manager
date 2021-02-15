import * as vscode from 'vscode';
import * as fs from 'fs';
import { FileTree } from './FileTree';

export class CppProjectManager extends FileTree
{
    createWorkspace()
    {
        fs.writeFileSync(vscode.workspace.rootPath+".cp3mconfig","test");
    }
}