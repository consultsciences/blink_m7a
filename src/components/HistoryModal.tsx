import { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Code, Box, ChevronRight, Terminal, Trash2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from './ui/input';

export interface Project {
  id: string;
  name: string;
  prompt: string;
  sandboxId: string;
  createdAt: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  currentSandboxId?: string;
}

export function HistoryModal({ isOpen, onClose, onSelectProject, currentSandboxId }: HistoryModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) loadProjects();
  }, [isOpen]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) return;
      const data = await blink.db.table<Project>('projects').list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 100,
      });
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}"?`)) return;
    setDeleting(project.id);
    try {
      await blink.db.table('projects').delete({ id: project.id });
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch { alert('Failed to delete project.'); }
    finally { setDeleting(null); }
  };

  const filtered = projects.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  const relativeTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? 'Unknown' : formatDistanceToNow(d, { addSuffix: true });
    } catch { return 'Unknown'; }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-[#0d0d0d] border-[#2d2d2d] text-foreground p-0 gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-5 border-b border-[#2d2d2d] bg-[#0a0a0a]">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Terminal size={16} /> Project History
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Select a project to resume it. Sandboxes auto-pause and resume.</p>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#2d2d2d] bg-[#0a0a0a]">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="pl-8 h-8 text-xs bg-[#141414] border-[#2d2d2d] focus:border-[#3d3d3d]"
            />
          </div>
        </div>

        <ScrollArea className="h-[450px] bg-[#0d0d0d]">
          <div className="p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                <span className="text-xs">Loading projects…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <Code size={20} className="opacity-40" />
                </div>
                <p className="text-sm">{search ? 'No matching projects.' : 'No projects yet.'}</p>
                <p className="text-xs opacity-50">Start building to see your history here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className={`w-full text-left group p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                      currentSandboxId === project.sandboxId
                        ? 'border-primary/40 bg-[#1a1a1a]'
                        : 'border-[#2d2d2d] bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#3d3d3d]'
                    }`}
                  >
                    {currentSandboxId === project.sandboxId && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-md shrink-0 ${
                          currentSandboxId === project.sandboxId ? 'bg-primary/20 text-primary' : 'bg-[#252525] text-muted-foreground group-hover:text-foreground'
                        }`}>
                          <Code size={13} />
                        </div>
                        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {project.name || 'Untitled Project'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {currentSandboxId === project.sandboxId && (
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
                        )}
                        <button
                          onClick={e => handleDelete(e, project)}
                          disabled={deleting === project.id}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="Delete project"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[12px] text-muted-foreground/70 line-clamp-1 pl-9 pr-4 leading-relaxed">
                      {project.prompt}
                    </p>

                    <div className="flex items-center justify-between pl-9 mt-3 pt-2.5 border-t border-[#2d2d2d]/50">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                        <Clock size={10} />
                        {relativeTime(project.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/30 bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#2d2d2d]">
                        <Box size={9} />
                        {project.sandboxId?.slice(0, 12)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
