import * as vscode from 'vscode';
import {TreeNode, TreeNodeType} from './TreeNode';
import {UserInterface, FileType} from './UserInterface';
import {TreeProvider} from './TreeProvider';
import { WorkspaceManager } from './WorkspaceManagement/WorkspaceManager';

export class ExplorerTree extends TreeProvider
{
    constructor(workspaceRoot: any)
    {
        super(workspaceRoot);
        this.readWorkspace();
    }

    async createWorkspace()
    {
        WorkspaceManager.createWorkspace();
        this.refresh();
    }
}