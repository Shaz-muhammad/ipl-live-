import { motion } from "framer-motion";
import type { BattingEntry, BowlingEntry } from "@/types/match";

interface Props {
  batting?: BattingEntry[];
  bowling?: BowlingEntry[];
}

export function Scorecard({ batting = [], bowling = [] }: Props) {
  return (
    <div className="space-y-6">
      {/* Batting */}
      {batting.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 overflow-x-auto"
        >
          <h3 className="font-heading text-lg font-bold text-primary mb-3">
            Batting
          </h3>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Batter</th>
                <th className="text-right py-2 px-2">R</th>
                <th className="text-right py-2 px-2">B</th>
                <th className="text-right py-2 px-2">4s</th>
                <th className="text-right py-2 px-2">6s</th>
                <th className="text-right py-2 px-2">SR</th>
              </tr>
            </thead>

            <tbody>
              {batting.map((b, i) => {
                const isDuck =
                  b.runs === 0 &&
                  !!b.dismissal &&
                  !b.dismissal.toLowerCase().includes("not out");

                return (
                  <motion.tr
                    key={`${b.name}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-border/50 ${
                      isDuck ? "bg-neon-red/5" : ""
                    }`}
                  >
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-heading font-bold ${
                            isDuck ? "text-neon-red" : "text-foreground"
                          }`}
                        >
                          {b.name || "Unknown"}
                        </p>
                        {isDuck && (
                          <span className="text-[8px] bg-neon-red/20 text-neon-red px-1 rounded uppercase font-bold tracking-tighter">
                            Duck
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {b.dismissal || ""}
                      </p>
                    </td>

                    <td
                      className={`text-right py-2 px-2 font-display font-bold ${
                        isDuck ? "text-neon-red" : "text-foreground"
                      }`}
                    >
                      {b.runs ?? 0}
                    </td>

                    <td className="text-right py-2 px-2 text-muted-foreground">
                      {b.balls ?? 0}
                    </td>

                    <td className="text-right py-2 px-2 text-neon-green">
                      {b.fours ?? 0}
                    </td>

                    <td className="text-right py-2 px-2 text-neon-purple">
                      {b.sixes ?? 0}
                    </td>

                    <td className="text-right py-2 px-2 text-muted-foreground">
                      {typeof b.sr === 'number' ? b.sr.toFixed(1) : (b.sr || "0.0")}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          No batting data available
        </p>
      )}

      {/* Bowling */}
      {bowling.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 overflow-x-auto"
        >
          <h3 className="font-heading text-lg font-bold text-accent mb-3">
            Bowling
          </h3>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Bowler</th>
                <th className="text-right py-2 px-2">O</th>
                <th className="text-right py-2 px-2">M</th>
                <th className="text-right py-2 px-2">R</th>
                <th className="text-right py-2 px-2">W</th>
                <th className="text-right py-2 px-2">ECO</th>
              </tr>
            </thead>

            <tbody>
              {bowling.map((b, i) => (
                <motion.tr
                  key={`${b.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50"
                >
                  <td className="py-2 pr-4 font-heading font-bold text-foreground">
                    {b.name || "Unknown"}
                  </td>

                  <td className="text-right py-2 px-2 text-muted-foreground">
                    {b.overs ?? 0}
                  </td>

                  <td className="text-right py-2 px-2 text-muted-foreground">
                    {b.maidens ?? 0}
                  </td>

                  <td className="text-right py-2 px-2 text-foreground">
                    {b.runs ?? 0}
                  </td>

                  <td className="text-right py-2 px-2 font-display font-bold text-primary">
                    {b.wickets ?? 0}
                  </td>

                  <td className="text-right py-2 px-2 text-muted-foreground">
                    {typeof b.economy === 'number' ? b.economy.toFixed(1) : (b.economy || b.eco || "0.0")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          No bowling data available
        </p>
      )}
    </div>
  );
}
