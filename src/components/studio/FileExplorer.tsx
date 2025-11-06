import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: FileNode) => void;
  selectedFile?: string;
  sessionFiles?: Record<string, string>;
}

const generateFileStructure = (files: Record<string, string>): FileNode[] => {
  const structure: FileNode[] = [];
  const folders: Record<string, FileNode> = {};

  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    
    if (parts.length === 0) {
      // Root file
      structure.push({ name: fileName, type: "file", content });
    } else {
      // File in folder
      const folderPath = parts.join('/');
      if (!folders[folderPath]) {
        folders[folderPath] = {
          name: parts[parts.length - 1],
          type: "folder",
          children: []
        };
        if (parts.length === 1) {
          structure.push(folders[folderPath]);
        }
      }
      folders[folderPath].children!.push({ name: fileName, type: "file", content });
    }
  });

  return structure;
};

const defaultFiles: FileNode[] = [];

export default function FileExplorer({ onFileSelect, selectedFile, sessionFiles }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, path: string = "", depth: number = 0) => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(fullPath);
    const isSelected = selectedFile === fullPath;

    return (
      <div key={fullPath}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-secondary/50 rounded-sm",
            isSelected && "bg-primary/20 text-primary",
            "transition-colors"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(fullPath);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-400" />
              ) : (
                <Folder className="h-4 w-4 text-blue-400" />
              )}
            </>
          ) : (
            <>
              <div className="w-3" />
              <File className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, fullPath, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-secondary/20 border-r flex flex-col">
      <div className="p-2 border-b bg-secondary/30 flex-shrink-0">
        <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1">
        <div className="min-h-full">
          {sessionFiles ? (
            generateFileStructure(sessionFiles).map((node) => renderNode(node))
          ) : (
            <div className="p-2">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-secondary/50 rounded-sm",
                  selectedFile === "index.html" && "bg-primary/20 text-primary",
                  "transition-colors"
                )}
                onClick={() => onFileSelect({ name: "index.html", type: "file", content: "" })}
              >
                <div className="w-3" />
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">index.html</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}