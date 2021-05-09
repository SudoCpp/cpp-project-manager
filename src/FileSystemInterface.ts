import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TreeNodeType } from './TreeNode';
import { isIPv4 } from 'net';
import { FileData } from './FileData';

export class FileSystemInterface
{
    static workspaceRoot : string;

    static rootIsValid() : boolean
    {
        return this.pathExists(".cp3mWS");
    }

    static directoryExists(relativeWorkspacePath: string) : boolean
    {
        if(this.pathExists(relativeWorkspacePath) && fs.lstatSync(this.workspaceRoot+"/"+relativeWorkspacePath).isDirectory())
        {
            return true;
        }
        return false;
    }

    static getDirectories(relativeWorkspacePath: string) : string[]
    {
        var list:string[] = [];
        var fullPath = this.workspaceRoot+"/"+relativeWorkspacePath;
        var directories = fs.readdirSync(fullPath);
        for(var loop = 0; loop < directories.length; loop++)
        {
            var file = directories[loop];
            let fileName = path.basename(file);
            var isDirectory = fs.lstatSync(fullPath+"/"+fileName).isDirectory();
            if(isDirectory)
            {
                list.push(fileName);
            }
        }
        return list;
    }

    static getFiles(relativeWorkspacePath: string) : string[]
    {
        var list:string[] = [];
        var fullPath = this.workspaceRoot+"/"+relativeWorkspacePath;
        var directories = fs.readdirSync(fullPath);
        for(var loop = 0; loop < directories.length; loop++)
        {
            var file = directories[loop];
            let fileName = path.basename(file);
            var isDirectory = fs.lstatSync(fullPath+"/"+fileName).isDirectory();
            if(!isDirectory)
            {
                list.push(fileName);
            }
        }
        return list;
    }

    static lineExist(relativePath:string, lineData:string) : boolean
    {
        var currentLines = this.getFileAsLines(relativePath);
        var lines :string[] = [];
        for(var loop = 0; loop < currentLines.length; loop++)
        {
            var line = currentLines[loop];
            if(line.indexOf(lineData) !== -1)
            {
                return false;
            }
        }
        return true;
    }

    static replaceLine(relativePath: string, lineToFind:string, replaceLine: string)
    {
        var currentLines = this.getFileAsLines(relativePath);
        var lines :string[] = [];
        for(var loop = 0; loop < currentLines.length; loop++)
        {
            var line = currentLines[loop];
            if(line.indexOf(lineToFind) !== -1)
            {
                lines.push(replaceLine);
            }
            else
            {
                lines.push(currentLines[loop]);
            }
        }
        this.writeFile("CppExplorerProjects.cmake", lines.join("\n"));
    }

    static createPath(relativeWorkspacePath: string)
    {
        if(!this.pathExists(relativeWorkspacePath))
        {
            fs.mkdirSync(this.workspaceRoot+"/"+relativeWorkspacePath);
        }
    }

    static createWorkspace()
    {
        this.createPath("libraries");
        this.writeFile(".cp3mWS", FileData.emptyWorkspace());
        this.writeFile(".gitignore","/bin/*\n/build/*");
        this.writeWorkSpaceFile();
    }

    private static getFileAsLines(relativeWorkspacePath: string) : string[]
    {
        try
        {
            return fs.readFileSync(this.workspaceRoot+"/"+relativeWorkspacePath).toString().replace("\r","").split("\n");
        }
        catch
        {
            return [];
        }
    }

    static deleteFolderRecursive(fullPathToDelete: string)
    {
        if (fs.existsSync(fullPathToDelete))
        {
            fs.readdirSync(fullPathToDelete).forEach((file, index) => {
            const curPath = path.join(fullPathToDelete, file);
            if (fs.lstatSync(curPath).isDirectory())
            { // recurse
                this.deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }});
            fs.rmdirSync(fullPathToDelete);
        }
    };

    static deleteFile(relativeWorkspacePath: string)
    {
        fs.unlinkSync(this.workspaceRoot+"/"+relativeWorkspacePath);
    }

    private static pathExists(relativeWorkspacePath: string): boolean
    {
        try
        {
			fs.accessSync(this.workspaceRoot+"/"+relativeWorkspacePath);
        }
        catch (err)
        {
			return false;
		}

		return true;
    }
    
    static getINIList(filePath: string, groupName: string) : string[]
    {
        var lines = this.getFileAsLines(filePath);
        var found = false;
        var listValues = [];
        for(var loop = 0; loop < lines.length; loop++)
        {
            let line = lines[loop];
            if(line.indexOf("#") !== -1)
            {
                continue;
            }
            else if(line.indexOf("["+groupName+"]") !== -1)
            {
                found = true;
            }
            else if (!found)
            {
                continue;
            }
            else if (found && line.indexOf("[") !== -1) //comments already skipped
            {
                break;
            }
            else //if (found)
            {
                listValues.push(line);
            }
        }

        return listValues;
    }
    
    private static writeWorkSpaceFile()
    {
        this.writeFile("CMakeLists.txt", FileData.workspaceConfig());
    }

    private static makeListFiles(initialFullPath: string, list: string[], ext: string) : string[]
    {
        var newList = list;
        if (fs.existsSync(initialFullPath))
        {
            fs.readdirSync(initialFullPath).forEach((file, index) => {
                const curPath = path.join(initialFullPath, file);
                if (fs.lstatSync(curPath).isDirectory())
                {
                    newList = this.makeListFiles(curPath, newList, ext);
                } 
                else
                { 
                    if(curPath.indexOf(ext) !== -1)
                    {
                        newList.push(curPath);
                    }
                }
              });
        }
        return newList;
    }

    private static writeFile(relativeWorkspacePath: string, fileContents: string)
    {
        if(relativeWorkspacePath.indexOf(this.workspaceRoot) === -1)
        {
            fs.writeFileSync(this.workspaceRoot+"/"+relativeWorkspacePath, fileContents);
        }
        else
        {
            fs.writeFileSync(relativeWorkspacePath, fileContents);
        }
    }
}