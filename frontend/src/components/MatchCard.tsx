import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";

export interface Match {
  id: string;
  apiId?: string;

  team1: string;
  team2: string;

  team1Short?: string;
  team2Short?: string;

  team1Logo?: string;
  team2Logo?: string;

  team1Score?: string;
  team2Score?: string;

  team1Overs?: string;
  team2Overs?: string;

  status?: string;
  matchState?: string;

  tossWinner?: string;
  tossChoice?: string;
  result?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;

  venue?: string;
  date?: string;
  time?: string;
}

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

  const isFinished = state === "complete" || statusText.includes("won by");

  const displayStatus = isLive ? "live" : isFinished ? "finished" : "upcoming";

  const team1Id = match.team1Short || match.team1;
  const team2Id = match.team2Short || match.team2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => navigate(`/match/${match.apiId || match.id}`)}
      className={`glass-card cursor-pointer p-5 transition-shadow duration-300 ${
        isLive ? "neon-border" : "border border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <LiveBadge />
        ) : (
          <span className="text-xs text-muted-foreground uppercase">
            {displayStatus}
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
              onTeamClick(team1Id, "#00ffff", "#0ea5e9");
            }}
          >
            {match.team1Logo || "🏏"}
          </motion.span>

          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              {match.team1Short || match.team1 || "T1"}
            </p>
            <p className="font-display text-sm neon-text">
              {match.team1Score || "—"}
            </p>
          </div>
        </div>

        <span className="font-display text-[10px] text-muted-foreground mx-2">
          VS
        </span>

        {/* Team 2 */}
        <div className="flex items-center gap-3 flex-1 justify-end text-right">
          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              {match.team2Short || match.team2 || "T2"}
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
              onTeamClick(team2Id, "#a855f7", "#ec4899");
            }}
          >
            {match.team2Logo || "🏏"}
          </motion.span>
        </div>
      </div>

      {/* Match Info */}
      <div className="mt-4 space-y-2">
        {displayStatus === "finished" && match.result && (
          <p className="text-xs font-bold text-center neon-text uppercase">
            {match.result}
          </p>
        )}

        {isLive && match.status && (
          <p className="text-[10px] text-center neon-text-accent font-bold uppercase">
            {match.status}
          </p>
        )}

        {match.tossWinner && match.tossChoice && (
          <p className="text-[10px] text-center text-muted-foreground italic">
            {match.tossWinner} won the toss and elected to {match.tossChoice}
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground border-t pt-2">
          {match.venue || "Unknown venue"}
        </p>
      </div>
    </motion.div>
  );
}
