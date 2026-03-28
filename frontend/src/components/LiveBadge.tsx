import { motion } from 'framer-motion';

export function LiveBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 px-3 py-1 text-xs font-bold uppercase tracking-wider"
      style={{ color: 'hsl(var(--neon-red))' }}
    >
      <motion.span
        className="h-2 w-2 rounded-full bg-destructive"
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      Live
    </motion.div>
  );
}
