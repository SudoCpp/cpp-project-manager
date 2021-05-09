import * as vscode from 'vscode';
import {TreeNode, TreeNodeType} from './TreeNode';
import {UserInterface, FileType} from './UserInterface';
import {SystemCaller} from './SystemCaller';
import {TreeProvider} from './TreeProvider';
import { FileSystemInterface } from './FileSystemInterface';

export class ExplorerTree extends TreeProvider
{
    constructor(workspaceRoot: any)
    {
        super(workspaceRoot);
        this.readWorkspace();
    }

    async createWorkspace()
    {
        var makeGit :boolean|undefined;
        var configure: boolean|undefined;
        if((makeGit = await UserInterface.yesNoCancel(["Don't Create git repo", "Create git repo"])) !== undefined)
        {
            if((configure = await UserInterface.yesNoCancel(["Don't initialize CMake (Pick this if using CMake-Tools)", "Initialize CMake (Pick this if you are manually running Ninja)"])) !== undefined)
            {
                FileSystemInterface.createWorkspace();
                if(makeGit)
                {
                    SystemCaller.initilizeGit(this.workspaceRoot);
                }
                if(configure)
                {
                    SystemCaller.runCMake(this.workspaceRoot);
                }
                this.refresh();
            }
        }
    }
}