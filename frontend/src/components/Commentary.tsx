import { motion } from "framer-motion";

// ✅ Define type locally (no dependency on mockData)
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

const eventStyles: Record<string, string> = {
  six: "border-l-4 border-neon-purple bg-neon-purple/5",
  four: "border-l-4 border-neon-green bg-neon-green/5",
  wicket: "border-l-4 border-neon-red bg-neon-red/5",
  dot: "border-l-4 border-muted-foreground/30",
  wide: "border-l-4 border-neon-yellow/50",
  "no-ball": "border-l-4 border-neon-orange/50",
  normal: "border-l-4 border-border",
};

const eventBadge: Record<string, { label: string; className: string } | null> =
  {
    six: { label: "6", className: "bg-neon-purple/20 text-neon-purple" },
    four: { label: "4", className: "bg-neon-green/20 text-neon-green" },
    wicket: { label: "W", className: "bg-neon-red/20 text-neon-red" },
    wide: { label: "WD", className: "bg-neon-yellow/20 text-neon-yellow" },
    "no-ball": { label: "NB", className: "bg-neon-orange/20 text-neon-orange" },
    dot: null,
    normal: null,
  };

export function Commentary({ entries }: Props) {
  // ✅ Safe fallback
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

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-3 rounded-lg ${
              eventStyles[entry.event] || eventStyles.normal
            }`}
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
