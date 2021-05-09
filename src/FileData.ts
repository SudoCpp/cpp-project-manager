import { TreeNodeType } from './TreeNode';
import * as vscode from 'vscode';

export class FileData
{
    static emptyWorkspace() : string
    {
        var fileContents = "[BuildTool]\n"
        + "BackendTool=CMake\n"
        + "ToolMinVersion=3.0.0\n"
        + "ArchiveSaveLoction=./build/archive\n"
        + "SharedSaveLoction=./build/shared\n"
        + "ExecutableSaveLoction=./build/bin\n"
        + "BreakdownByOS=yes\n"
        + "\n"
        + "[PackageLibraries]\n"
        + "#Format: <PkgName> [<MinVersion>]\n"
        + "CppStdLibrary\n"
        + "\n"
        + "[SourceLibraries]\n"
        + "#Format: <URLTogitrepo>\n"
        + "\n"
        + "[NewProjectDefaults]\n"
        + "#Options: yes no ask"
        + "MakeCombinedHeader=yes\n"
        + "EnableTesting=yes\n"
        + "IncludeStdLibrary=yes\n"
        + "AddEmptyLicenseFile=yes\n"
        + "AddEmptyReadMeFile=yes\n"
        + "\n"
        + "[Projects]\n"
        + "#Format: <ProjectName> <enabled/disabled>\n";

        return fileContents;
    }

    static workspaceConfig() : string
    {
        return "CMAKE_MINIMUM_REQUIRED(VERSION 3.0.0)\n"
        + "PROJECT("+vscode.workspace.name+" VERSION 0.1.0)\n\n"
        + "INCLUDE(CTest)\n"
        + "ENABLE_TESTING()\n\n"
        + "#Determine if 32 or 64 bit\n"
        + "SET(OSBitness 32)\n"
        + "IF(CMAKE_SIZEOF_VOID_P EQUAL 8)\n"
        + "    SET(OSBitness 64)\n"
        + "ENDIF()\n\n"
        + "#Save outputs into bin folder\n"
        + "SET(CppEx_FullOutputDir \"${CMAKE_SOURCE_DIR}/bin/${CMAKE_SYSTEM_NAME}${OSBitness}/${CMAKE_BUILD_TYPE}\")\n"
        + "SET(CMAKE_ARCHIVE_OUTPUT_DIRECTORY \"${CppEx_FullOutputDir}/static libs\")\n"
        + "SET(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CppEx_FullOutputDir})\n"
        + "SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CppEx_FullOutputDir})\n"
        + "SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CppEx_FullOutputDir})\n\n";
    }
}
