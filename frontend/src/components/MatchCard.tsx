import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";

// ✅ Define types locally (temporary clean fix)
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: string;
  team2Score: string;
  status: "live" | "upcoming" | "finished";
  statusText: string;
  tossWinner?: string;
  tossChoice?: string;
  result?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;
  venue: string;
  date: string;
  time?: string;
}

interface Props {
  match: Match;
  index: number;
  onTeamClick: (teamId: string, primary: string, secondary: string) => void;
}

export function MatchCard({ match, index, onTeamClick }: Props) {
  const navigate = useNavigate();

  if (!match) return null; // ✅ safety

  const isLive = match.status === "live";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => navigate(`/match/${match.id}`)}
      className={`glass-card cursor-pointer p-5 transition-shadow duration-300 ${
        isLive ? "neon-border" : "border border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <LiveBadge />
        ) : (
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              match.status === "upcoming"
                ? "bg-neon-blue/10 text-neon-blue"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {match.status === "upcoming" ? "Upcoming" : "Finished"}
          </span>
        )}

        <span className="text-[10px] text-muted-foreground">
          {match.date || "—"} {match.time && `• ${match.time}`}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        {/* Team 1 */}
        <div className="flex items-center gap-3 flex-1">
          <motion.span
            whileHover={{ scale: 1.2 }}
            className="text-2xl cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onTeamClick(
                match.team1?.id,
                match.team1?.primaryColor,
                match.team1?.secondaryColor,
              );
            }}
          >
            {match.team1?.logo || "🏏"}
          </motion.span>

          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              {match.team1?.shortName || "T1"}
            </p>
            <p className="font-display text-sm neon-text">
              {match.team1Score || "—"}
            </p>
          </div>
        </div>

        {/* VS */}
        <span className="font-display text-[10px] text-muted-foreground mx-2">
          VS
        </span>

        {/* Team 2 */}
        <div className="flex items-center gap-3 flex-1 justify-end text-right">
          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              {match.team2?.shortName || "T2"}
            </p>
            <p className="font-display text-sm neon-text">
              {match.team2Score || "—"}
            </p>
          </div>

          <motion.span
            whileHover={{ scale: 1.2 }}
            className="text-2xl cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onTeamClick(
                match.team2?.id,
                match.team2?.primaryColor,
                match.team2?.secondaryColor,
              );
            }}
          >
            {match.team2?.logo || "🏏"}
          </motion.span>
        </div>
      </div>

      {/* Match Meta Information */}
      <div className="mt-4 space-y-2">
        {match.status === "finished" && match.result && (
          <p className="text-xs font-bold text-center neon-text uppercase tracking-wider animate-pulse">
            {match.result}
          </p>
        )}

        {match.status === "live" && match.currentInnings === "2nd Innings" && match.target && (
          <p className="text-[10px] text-center neon-text-accent font-bold uppercase tracking-widest">
            Target: {match.target} {match.rrr && match.rrr !== "0" && `• RRR: ${match.rrr}`}
          </p>
        )}

        {match.status === "live" && match.tossWinner && match.tossChoice && (
          <p className="text-[10px] text-center text-muted-foreground italic">
            {match.tossWinner} won the toss and elected to {match.tossChoice} first.
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground font-heading border-t border-border/20 pt-2">
          {match.statusText || "Match info unavailable"}
        </p>

        <p className="text-[10px] text-center text-muted-foreground opacity-70">
          {match.venue || "Unknown venue"}
        </p>
      </div>
    </motion.div>
  );
}
