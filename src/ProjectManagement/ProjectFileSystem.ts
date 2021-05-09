import { FileSystemInterface} from '../FileSystemInterface';
import * as vscode from 'vscode';
import {TreeNodeType} from '../TreeNode';

class FileData
{
    static mainCpp() : string
    {
        return "int main(int argCount, char *argValues[])\n"
        + "{\n"
        + "\n"
        + "    return 0;\n"
        + "}";
    }

    static projectFile(projectName: string, executable: boolean) : string
    {
        var fileContents = "[ProjectDetails]\n"
        + "ProjectName="+projectName+"\n"
        + "ProjectVersion=0.0.1\n"
        + "EnableTesting=yes\n"
        + "EnableInternalKeyword=yes\n"
        + "IsExecutable="+(executable?"yes":"no")+"\n"
        + "MakeCombinedHeader=yes\n"
        + "UseOptionsFile=no\n"
        + "\n"
        + "[Dependancies]\n"
        + "#Package=<PackageName> [Shared/Static <MinPackageVersion>]\n"
        + "#Source=<LibraryName> [Shared/Static <URLTogitRepo>]\n"
        + "Package=CppStdLibary\n"
        + "\n"
        + "[SourceFiles]\n"
        + "#Format: <FileURL>\n"
        + "\n"
        + "[UnitTests]\n"
        + "#Format: <FileURL>\n"
        + "\n"
        + "[BuildProperties]\n"
        + "MinBackendToolVersion=3.0.0\n"
        + "TreatWarningsAsErrors=no\n"
        + "EnableAllWarnings=no\n"
        + "\n"
        + "[BuildEvents]\n"
        + "WindowsPreBuildCommand=\n"
        + "WindowsPostBuildCommand=\n"
        + "UnixPreBuildCommand=\n"
        + "UnixPostBuildCommand=\n";

        return fileContents;
    }

    static projectConfig(minCMake: string, projectType: TreeNodeType, projectName: string, 
        projectVersion: string, sourceFiles: string[], windowsPreBuild: string, windowsPostBuild: string,
        unixPreBuild: string, unixPostBuild: string, warningError: boolean, warningAll: boolean) : string
    {
        var fileContents = "CMAKE_MINIMUM_REQUIRED(VERSION "+minCMake+")\n"
        + "PROJECT("+projectName+" VERSION "+projectVersion+")\n\n"
        + "INCLUDE_DIRECTORIES(\"include\")\n"
        + "INCLUDE_DIRECTORIES(\"..\")\n\n"
        + "INCLUDE_DIRECTORIES(\"../libraries\")\n\n"
        + "SET(SourceFiles ";

        for(var loop = 0; loop < sourceFiles.length; loop++)
        {
            fileContents += sourceFiles[loop]+"\n";
        }

        fileContents += ")\n";
        
        if(projectType === TreeNodeType.executable)
        {
            fileContents += "ADD_EXECUTABLE(${PROJECT_NAME} ${CppEx_SourceFiles})\n\n";
        }
        else
        {
            fileContents += "ADD_LIBRARY(${PROJECT_NAME} SHARED ${CppEx_SourceFiles})\n"
            + "ADD_LIBRARY(${PROJECT_NAME}_STATIC STATIC ${CppEx_SourceFiles})\n\n";
        }

        if(windowsPreBuild !== "" || windowsPostBuild !== "" || unixPreBuild !== "" || unixPostBuild !== "")
        {
            fileContents += "IF(${CMAKE_SYSTEM_NAME} STREQUAL \"Windows\")\n";
            if(windowsPreBuild !== "")
            {
                fileContents +="    ADD_CUSTOM_COMMAND(TARGET ${PROJECT_NAME}\n"
                + "        PRE_BUILD COMMAND\n"
                + "        "+windowsPreBuild+"\n"
                + "    )\n";
            }
            if(windowsPostBuild !== "")
            {
                fileContents +="    ADD_CUSTOM_COMMAND(TARGET ${PROJECT_NAME}\n"
                + "        POST_BUILD COMMAND\n"
                + "        "+windowsPostBuild+"\n"
                + "    )\n";
            }
            fileContents += "ELSE()\n";
            if(unixPreBuild !== "")
            {
                fileContents +="    ADD_CUSTOM_COMMAND(TARGET ${PROJECT_NAME}\n"
                + "        PRE_BUILD COMMAND\n"
                + "        "+unixPreBuild+"\n"
                + "    )\n";
            }
            if(unixPostBuild !== "")
            {
                fileContents +="    ADD_CUSTOM_COMMAND(TARGET ${PROJECT_NAME}\n"
                + "        POST_BUILD COMMAND\n"
                + "        "+unixPostBuild+"\n"
                + "    )\n";
            }
            fileContents += "ENDIF()\n";
        }

        if(warningError || warningAll)
        {
            fileContents += "IF (CMAKE_CXX_COMPILER_ID STREQUAL \"Clang\")\n";
            if(warningError)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} -Werror\")\n";
            }
            if(warningAll)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} -Wall\")\n";
            }
            fileContents += "ELSEIF (CMAKE_CXX_COMPILER_ID STREQUAL \"GNU\")\n";
            if(warningError)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} -Werror\")\n";
            }
            if(warningAll)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} -Wall\")\n";
            }
            fileContents += "ELSEIF (CMAKE_CXX_COMPILER_ID STREQUAL \"MSVC\")\n";
            if(warningError)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} /WX\")\n";
            }
            if(warningAll)
            {
                fileContents += "    SET(CMAKE_CXX_FLAGS  \"${CMAKE_CXX_FLAGS} /Wall\")\n";
            }
            fileContents += "ENDIF()";
        }
    
        return fileContents;
    }
}

export class ProjectFileSystem extends FileSystemInterface
{
    static createProject(projectName: string, projectType: TreeNodeType)
    {
        if(this.getProjects().indexOf(projectName) !== -1)
        {
            vscode.window.showErrorMessage("Project "+projectName+" already exists.");
            return;
        }

        this.createPath(projectName);
        this.createPath(projectName+"/include");
        this.createPath(projectName+"/src");
        this.createPath(projectName+"/tests");
    
        this.writeFile(projectName+"/.cp3mProject", FileData.projectFile(projectName, projectType === TreeNodeType.executable ? true : false));
        this.writeProjectCMakeList(projectName, projectType);
  
        if(projectType === TreeNodeType.executable)
        {
            this.writeFile(projectName+"/main.cpp", FileData.mainCpp());
        }
    }

    static getProjects() : string[]
    {
        var list:string[] = [];
        var directories = this.getDirectories(this.workspaceRoot);
        for(var loop = 0; loop < directories.length; loop++)
        {
            var dirName = directories[loop];
            if(dirName.substring(0,1) !== "." && dirName !== 'libraries' && dirName !== 'build' && dirName !== 'bin')
            {
                list.push(dirName);
            }
        }
        return list;
    }

    static writeProjectCMakeList(projectName: string , projectType: TreeNodeType)
    {
        //TODO remove hard coding
        var empty :string [] = [];
        this.writeFile(projectName+"/CMakeLists.txt", FileData.projectConfig("3.0.0",projectType, projectName, "0.0.1", empty, "","","","", false, false,));
    }
}