import { ProjectUserInterface } from './ProjectUserInterface';
import { ProjectFileSystem } from './ProjectFileSystem';
import { UserInterface } from '../UserInterface';
import {TreeNodeType, TreeNode} from '../TreeNode';

export enum ProjectChangeType
{
    remove,
    add,
    update,
    noProjectEvent
}

export class ProjectManager
{
    static async createProject()
    {
        var projectName = await UserInterface.prompt('Enter Project Name');
        var projectType = await ProjectUserInterface.getProjectType();

        if(projectType !== TreeNodeType.file)
        {
            ProjectFileSystem.createProject(projectName, projectType);
        }
    }

    static getProjectChangeType() : ProjectChangeType
    {
        //TO DO hard coding
        return ProjectChangeType.add;
    }

    static getProjectChangeName() : string
    {
        //TO DO hard coding
        return "blank";
    }

    static getProjectChangeNode() : TreeNode
    {
        //TO DO hard coding
        return new TreeNode("test", TreeNodeType.executable, "test", "test/test");
    }

    static runProjectEvents()
    {
        var projects = FileSystemInterface.getProjects();
        for(var loop = 0; loop < projects.length; loop++)
        {
            var projectName = projects[loop];
            if(FileSystemInterface.getOption("CppEx_EnableInternalKeyword", projectName))
            {
                FileSystemInterface.generateInternalHeader(projectName);
            }

            if(FileSystemInterface.getOption("CppEx_AutoGenCombinedLibraryHeader", projectName))
            {
               FileSystemInterface.generateCombinedHeader(projectName);
            }
        }
    }

    static getProjectNodes(previousNodeTree: TreeNode[]) : TreeNode[]
    {
        var hardcode : TreeNode[] = [];
        return hardcode;
    }
}