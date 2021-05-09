import {UserInterface, FileType} from '../UserInterface';
import * as vscode from 'vscode';
import {TreeNodeType} from '../TreeNode';

export class ProjectUserInterface extends UserInterface
{
    static async getProjectType() : Promise<TreeNodeType>
    {
        var types: vscode.QuickPickItem[] = [];
        types.push({"label":"Executable", "description": "A project that turns into an executable"});
        types.push({"label": "Library", "description": "A project that is a reusable library"});
        var projectType = await vscode.window.showQuickPick(types,{canPickMany: false});
        if(projectType?.label === "Executable")
        {
            return TreeNodeType.executable;
        }
        else if(projectType?.label === "Library")
        {
            return TreeNodeType.library;
        }
        else
        {
            return TreeNodeType.file;
        }
    }
}