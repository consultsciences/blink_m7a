import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { blink } from '../lib/blink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function UserMenu() {
  const [user, setUser] = useState<{ email?: string; displayName?: string } | null>(null);

  useEffect(() => {
    blink.auth.me().then(u => { if (u) setUser(u as any); }).catch(() => {});
  }, []);

  const initials = user?.displayName
    ? (user.displayName as string).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-border flex items-center justify-center text-[10px] font-bold text-primary">
            {initials}
          </div>
          <ChevronDown size={10} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-[#111] border-border/50 text-sm">
        <div className="px-3 py-2.5 border-b border-border/30">
          <p className="text-xs font-medium text-foreground truncate">{(user as any)?.displayName || 'My Account'}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
        </div>
        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/5 mt-1">
          <User size={13} className="text-muted-foreground" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/5">
          <Settings size={13} className="text-muted-foreground" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem
          className="gap-2 cursor-pointer focus:bg-white/5 text-red-400 focus:text-red-400 mb-1"
          onClick={() => blink.auth.signOut().catch(() => window.location.reload())}
        >
          <LogOut size={13} />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
