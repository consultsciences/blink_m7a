import React, { useEffect, useState } from 'react';
import { Folder, File as FileIcon, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileExplorerProps {
  sandbox: any;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  className?: string;
}

const APP_ROOT = '/home/user/app';

export function FileExplorer({ sandbox, onFileSelect, selectedFile, className }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([APP_ROOT]));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!sandbox) return;
    setIsLoading(true);
    setError(null);

    try {
      // Get dirs and files separately for reliable type detection
      const [dirsResult, filesResult] = await Promise.all([
        sandbox.commands.run(`find ${APP_ROOT} -maxdepth 4 -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.vite/*"`),
        sandbox.commands.run(`find ${APP_ROOT} -maxdepth 4 -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.vite/*"`),
      ]);

      const dirs = new Set((dirsResult.stdout || '').trim().split('\n').filter(Boolean));
      const filePaths = (filesResult.stdout || '').trim().split('\n').filter(Boolean);

      const dirArr = Array.from(dirs) as string[];
      const tree = buildFileTree(dirArr.concat(filePaths as string[]), dirs as Set<string>);
      setFiles(tree);

      // Auto-expand src if present
      if ([...dirs].some(d => d === `${APP_ROOT}/src`)) {
        setExpandedFolders(prev => new Set([...prev, `${APP_ROOT}/src`]));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('No such file')) setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 8000);
    return () => clearInterval(interval);
  }, [sandbox]);

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const colorMap: Record<string, string> = {
      ts: 'text-blue-400', tsx: 'text-blue-300', js: 'text-yellow-400',
      jsx: 'text-yellow-300', css: 'text-pink-400', json: 'text-amber-400',
      html: 'text-orange-400', md: 'text-slate-400', svg: 'text-green-400',
      png: 'text-purple-400', jpg: 'text-purple-400', jpeg: 'text-purple-400',
    };
    return colorMap[ext] || 'text-gray-400';
  };

  const renderTree = (nodes: FileNode[], depth = 0): React.ReactNode => {
    const sorted = [...nodes].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map(node => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile === node.path;
      const indent = depth * 10 + 10;

      return (
        <div key={node.path}>
          <div
            className={cn(
              'flex items-center gap-1 py-[3px] px-2 cursor-pointer text-xs transition-colors select-none group',
              isSelected ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
            style={{ paddingLeft: indent }}
            onClick={e => {
              if (node.type === 'directory') toggleFolder(node.path, e);
              else onFileSelect(node.path);
            }}
          >
            {node.type === 'directory' ? (
              <>
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
                  : <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />}
                <Folder className={cn('w-3.5 h-3.5 shrink-0', isExpanded ? 'text-blue-400' : 'text-blue-300/70')} />
                <span className="truncate ml-0.5">{node.name}</span>
              </>
            ) : (
              <>
                <span className="w-3 shrink-0" />
                <FileIcon className={cn('w-3.5 h-3.5 shrink-0', getFileIcon(node.name))} />
                <span className="truncate ml-0.5">{node.name}</span>
              </>
            )}
          </div>

          {node.type === 'directory' && isExpanded && node.children && node.children.length > 0 && (
            <div>{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={cn('flex flex-col h-full bg-[#181818]', className)}>
      <div className="h-7 px-2 flex items-center justify-end border-b border-[#2b2b2b] shrink-0">
        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-[#333]" onClick={fetchFiles} title="Refresh files">
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="py-1">
          {error ? (
            <p className="px-3 py-4 text-center text-[10px] text-red-400/60">{error}</p>
          ) : files.length === 0 ? (
            <p className="px-3 py-8 text-center text-[10px] text-muted-foreground/40">
              {isLoading ? 'Loading…' : 'No files yet'}
            </p>
          ) : (
            renderTree(files)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function buildFileTree(allPaths: string[], dirs: Set<string>): FileNode[] {
  const map: Record<string, FileNode> = {};
  const root: FileNode[] = [];

  // Sort so parents come before children
  const sorted = [...new Set(allPaths)]
    .filter(p => p.startsWith(APP_ROOT) && p !== APP_ROOT)
    .sort();

  for (const path of sorted) {
    const name = path.split('/').pop()!;
    const isDir = dirs.has(path);
    map[path] = { name, path, type: isDir ? 'directory' : 'file', children: isDir ? [] : undefined };
  }

  for (const path of sorted) {
    const parts = path.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    const node = map[path];
    if (!node) continue;

    if (parentPath === APP_ROOT) {
      root.push(node);
    } else {
      const parent = map[parentPath];
      if (parent && parent.children) parent.children.push(node);
    }
  }

  return root;
}
