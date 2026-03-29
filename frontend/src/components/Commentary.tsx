import { motion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";

// ✅ Define type locally
export interface CommentaryEntry {
  id: string;
  over: string;
  ball: string;
  text: string;
  runs: number;
  event: "normal" | "four" | "six" | "wicket" | "dot" | "wide" | "no-ball";
  timestamp: number;
}

interface Props {
  entries: CommentaryEntry[];
}

// ✅ Strong typing using event union
type EventType = CommentaryEntry["event"];

const eventStyles: Record<EventType, string> = {
  six: "border-l-4 border-neon-purple bg-neon-purple/5 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)] animate-pulse",
  four: "border-l-4 border-neon-green bg-neon-green/5 shadow-[0_0_15px_-5px_rgba(34,197,94,0.4)]",
  wicket:
    "border-l-4 border-neon-red bg-neon-red/10 shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]",
  dot: "border-l-4 border-muted-foreground/30",
  wide: "border-l-4 border-neon-yellow/50",
  "no-ball": "border-l-4 border-neon-orange/50",
  normal: "border-l-4 border-border",
};

// ✅ FIX: no more `any`
const eventAnimations: Partial<Record<EventType, TargetAndTransition>> = {
  six: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.5, repeat: Infinity },
  },
  wicket: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.2, repeat: 3 },
  },
};

const eventBadge: Record<
  EventType,
  { label: string; className: string } | null
> = {
  six: { label: "6", className: "bg-neon-purple/20 text-neon-purple" },
  four: { label: "4", className: "bg-neon-green/20 text-neon-green" },
  wicket: { label: "W", className: "bg-neon-red/20 text-neon-red" },
  wide: { label: "WD", className: "bg-neon-yellow/20 text-neon-yellow" },
  "no-ball": { label: "NB", className: "bg-neon-orange/20 text-neon-orange" },
  dot: null,
  normal: null,
};

export function Commentary({ entries }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No commentary available
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const badge = eventBadge[entry.event];
        const animation = eventAnimations[entry.event] || { opacity: 1, x: 0 };

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={animation}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-3 rounded-lg ${eventStyles[entry.event]}`}
          >
            <div className="flex items-start gap-3">
              <span className="font-display text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                {entry.over}.{entry.ball}
              </span>

              <p className="text-sm text-foreground flex-1">{entry.text}</p>

              {badge && (
                <span
                  className={`text-xs font-display font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
