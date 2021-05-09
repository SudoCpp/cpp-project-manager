import {UserInterface, FileType} from '../UserInterface';
import {SystemCaller} from '../SystemCaller';
import { WorkspaceFileSystem } from './WorkspaceFileSystem';

export class WorkspaceManager
{
    static async createWorkspace()
    {
        var makeGit :boolean|undefined;
        var configure: boolean|undefined;
        if((makeGit = await UserInterface.yesNoCancel(["Don't Create git repo", "Create git repo"])) !== undefined)
        {
            if((configure = await UserInterface.yesNoCancel(["Don't initialize CMake (Pick this if using CMake-Tools)", "Initialize CMake (Pick this if you are manually running Ninja)"])) !== undefined)
            {
                WorkspaceFileSystem.createWorkspace();
                if(makeGit)
                {
                    SystemCaller.initilizeGit(WorkspaceFileSystem.workspaceRoot);
                }
                if(configure)
                {
                    SystemCaller.runCMake(WorkspaceFileSystem.workspaceRoot);
                }
            }
        }
    }
}