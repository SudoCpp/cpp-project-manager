import * as vscode from 'vscode';
import { ProjectManager, ProjectChangeType } from './ProjectManagement/ProjectManager';
import {TreeNode, TreeNodeType} from './TreeNode';
import { WorkspaceFileSystem } from './WorkspaceManagement/WorkspaceFileSystem';

export class TreeProvider implements vscode.TreeDataProvider<TreeNode>
{
    nodes: TreeNode[];
    //Allow Refresh
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode|undefined> = new vscode.EventEmitter<TreeNode|undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode|undefined> = this._onDidChangeTreeData.event;

    constructor(protected workspaceRoot: any)
    {
        this.nodes = [];
        this.workspaceRoot = workspaceRoot;
        WorkspaceFileSystem.workspaceRoot = workspaceRoot;
    }
    
    //Needed to make interface work
    getTreeItem(element: TreeNode): vscode.TreeItem
    {
		return element;
	}

    getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]>
    {
        if (!this.workspaceRoot)
        {
			vscode.window.showInformationMessage('C++ Project Manager: Not in a workspace.');
			return Promise.resolve([]);
        }
        else
        {
            if (element === undefined)
            {
                return this.nodes;
            }
            return element.children;
        }
    }


    refresh()
    {
        this.readWorkspace();
        this._onDidChangeTreeData.fire(undefined);
    }

    //Node Modifications
    readWorkspace()
    {
        if(WorkspaceFileSystem.rootIsValid())
        {
            if(vscode.workspace.name !== undefined)
            {
                var rootNode: TreeNode = new TreeNode(vscode.workspace.name, TreeNodeType.workSpace, "", this.workspaceRoot);
                this.createTheTree(rootNode);
            }
        }
    }

    setRootNode(rootNode: TreeNode) : TreeNode
    {
        if(this.nodes.length > 0)
        {
            if(this.nodes[0].name !== vscode.workspace.name)
            {
                this.nodes = [];
                this.nodes.push(rootNode);
            }
            else
            {
                rootNode = this.nodes[0];
            }
        }
        else
        {
            this.nodes = [];
            this.nodes.push(rootNode);
        }
        return rootNode;
    }
    
    createTheTree(rootNode: TreeNode)
    {
        var index = 1;
        rootNode = this.setRootNode(rootNode);

        ProjectManager.runProjectEvents();
        var changeType = ProjectManager.getProjectChangeType();
        if(rootNode.children !== undefined && changeType !== ProjectChangeType.noProjectEvent)
        {
            var projectName = ProjectManager.getProjectChangeName();
            if(rootNode.hasChildNamed(projectName))
            {
                rootNode.removeChild(rootNode.getChild(projectName));
            }
            if(changeType === ProjectChangeType.add || changeType === ProjectChangeType.update)
            {
                rootNode.addChild(ProjectManager.getProjectChangeNode());
            }
        }
    }

    getNodeType(fileName: string) : TreeNodeType
    {
        var nodeType = TreeNodeType.file;
        if(fileName.indexOf(".hpp") !== -1)
        {
            nodeType = TreeNodeType.header;
        }
        else if(fileName.indexOf(".cpp") !== -1)
        {
            nodeType = TreeNodeType.code;
        }

        return nodeType;
    }

    nodeDifferenceTracker(originalNode: TreeNode, newNode: TreeNode) : void
    {
        var foundNodes : string[] = [];
        if(originalNode.children !== undefined && newNode.children !== undefined)
        {
            for(var oldLoop = 0; oldLoop < originalNode.children?.length; oldLoop++)
            {
                var originalName = originalNode.children[oldLoop].name;
                if(newNode.hasChildNamed(originalName))
                {
                    if(newNode.childTypeMatches(originalName, originalNode.children[oldLoop].treeNodeType))
                    {
                        foundNodes.push(originalName);
                        var newChildNode = newNode.getChild(originalName);
                        if(newChildNode !== undefined)
                        {
                            this.nodeDifferenceTracker(originalNode.children[oldLoop], newChildNode);
                        }
                    }
                    else
                    {
                        originalNode.removeChild(oldLoop);
                        oldLoop--;
                    }
                }
                else
                {
                    originalNode.removeChild(oldLoop);
                    oldLoop--;
                }
            }
        }
    }
}