import { motion } from 'framer-motion';
import { Shield, Tv, RotateCcw } from 'lucide-react';

interface Props {
  onAdminClick: () => void;
  onWatchLiveClick: () => void;
  onResetTheme: () => void;
}

export function Header({ onAdminClick, onWatchLiveClick, onResetTheme }: Props) {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">🏏</span>
          <h1 className="font-display text-lg md:text-xl font-bold neon-text tracking-wider">
            IPL LIVE
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={onResetTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            title="Reset Theme"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onWatchLiveClick}
            className="flex items-center gap-1.5 rounded-lg bg-destructive/20 text-neon-red px-3 py-1.5 text-xs font-heading font-bold hover:bg-destructive/30 transition-colors"
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Watch Live</span>
          </button>
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-foreground px-3 py-1.5 text-xs font-heading font-bold hover:bg-secondary/80 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </motion.div>
      </div>
    </header>
  );
}
