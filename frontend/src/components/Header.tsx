import { motion } from "framer-motion";
import { Tv, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";

interface Props {
  onWatchLiveClick?: () => void;
  onResetTheme?: () => void;
  onLogoClick?: () => void;
}

export function Header({
  onWatchLiveClick = () => {},
  onResetTheme = () => {},
  onLogoClick = () => {},
}: Props) {
  const [clickCount, setClickCount] = useState(0);
  const lastClickTime = useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      if (newCount >= 5) {
        onLogoClick();
        setClickCount(0);
      } else {
        setClickCount(newCount);
      }
    }
    lastClickTime.current = now;
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card border-b border-border/50 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={handleLogoClick}
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
          </motion.div>
        </div>
      </div>
    </header>
  );
}
