import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";
import type { Match } from "@/types/match";

interface Props {
  match: Match;
  index: number;
  onTeamClick: (teamId: string, primary: string, secondary: string) => void;
}

export function MatchCard({ match, index, onTeamClick }: Props) {
  const navigate = useNavigate();

  if (!match) return null;

  const state = match.matchState?.toLowerCase() || "";
  const statusText = match.status?.toLowerCase() || "";

  const isLive =
    state.includes("progress") ||
    statusText.includes("need") ||
    statusText.includes("opt") ||
    Boolean(match.team1Score) ||
    Boolean(match.team2Score);

  const isFinished = 
    state === "complete" || 
    statusText.includes("won by") || 
    state === "completed";

  const displayStatus = isLive ? "live" : isFinished ? "finished" : "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => navigate(`/match/${match.apiId || match.id}`)}
      className={`glass-card cursor-pointer p-4 transition-all duration-300 relative overflow-hidden ${
        isLive ? "neon-border shadow-neon-sm" : "border border-border/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
        <div className="flex items-center gap-2">
          {isLive ? (
            <LiveBadge />
          ) : (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              isFinished ? "bg-muted text-muted-foreground" : "bg-neon-blue/10 text-neon-blue"
            }`}>
              {isFinished ? "Finished" : "Upcoming"}
            </span>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">
          {match.date || "—"} {match.time && `• ${match.time}`}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-xl filter drop-shadow-neon-sm">
              {match.team1Logo || "🏏"}
            </span>
            <span className={`font-heading font-bold text-sm ${isLive ? 'text-foreground' : 'text-foreground/80'}`}>
              {match.team1Short || match.team1}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-base neon-text">
              {match.team1Score || "—"}
            </span>
            {match.team1Overs && (
              <span className="text-[9px] text-muted-foreground">
                ({match.team1Overs})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-xl filter drop-shadow-neon-sm">
              {match.team2Logo || "🏏"}
            </span>
            <span className={`font-heading font-bold text-sm ${isLive ? 'text-foreground' : 'text-foreground/80'}`}>
              {match.team2Short || match.team2}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-base neon-text">
              {match.team2Score || "—"}
            </span>
            {match.team2Overs && (
              <span className="text-[9px] text-muted-foreground">
                ({match.team2Overs})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-border/10">
        <p className={`text-[11px] font-heading font-bold truncate ${
          isLive ? 'neon-text-accent animate-pulse' : 'text-muted-foreground'
        }`}>
          {match.status || "Upcoming Match"}
        </p>
        <p className="text-[9px] text-muted-foreground/60 mt-1 truncate">
          {match.venue || "Unknown venue"}
        </p>
      </div>
    </motion.div>
  );
}
