import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";

// ✅ Define Match type locally (temporary fix)
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
  team1Overs: string;
  team2Overs: string;
  status: "live" | "upcoming" | "finished";
  statusText: string;
  tossWinner?: string;
  tossChoice?: string;
  result?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;
  venue: string;
  date?: string;
  time?: string;
}

interface Props {
  match: Match;
  onTeamClick: (teamId: string, primary: string, secondary: string) => void;
}

export function HeroMatchCard({ match, onTeamClick }: Props) {
  const navigate = useNavigate();

  if (!match) return null; // ✅ safety

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/match/${match.id}`)}
      className="glass-card neon-border cursor-pointer p-6 md:p-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {match.status === "live" ? (
          <LiveBadge />
        ) : (
          <span className="text-xs text-muted-foreground">{match.status}</span>
        )}
        <span className="text-xs text-muted-foreground font-body">
          {match.venue || "Unknown venue"} {match.date && `• ${match.date}`} {match.time && `• ${match.time}`}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        {/* Team 1 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(
              match.team1?.id,
              match.team1?.primaryColor,
              match.team1?.secondaryColor,
            );
          }}
        >
          <span className="text-4xl md:text-5xl">
            {match.team1?.logo || "🏏"}
          </span>
          <span className="font-heading text-lg font-bold text-foreground">
            {match.team1?.shortName || "T1"}
          </span>
          <span className="font-display text-xl md:text-2xl neon-text font-bold">
            {match.team1Score || "—"}
          </span>
          {match.team1Overs && (
            <span className="text-xs text-muted-foreground">
              ({match.team1Overs} ov)
            </span>
          )}
        </motion.div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <span className="font-display text-sm text-muted-foreground tracking-widest">
            VS
          </span>
        </div>

        {/* Team 2 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(
              match.team2?.id,
              match.team2?.primaryColor,
              match.team2?.secondaryColor,
            );
          }}
        >
          <span className="text-4xl md:text-5xl">
            {match.team2?.logo || "🏏"}
          </span>
          <span className="font-heading text-lg font-bold text-foreground">
            {match.team2?.shortName || "T2"}
          </span>
          <span className="font-display text-xl md:text-2xl neon-text font-bold">
            {match.team2Score || "—"}
          </span>
          {match.team2Overs && (
            <span className="text-xs text-muted-foreground">
              ({match.team2Overs} ov)
            </span>
          )}
        </motion.div>
      </div>

      {/* Status & Meta Info */}
      <div className="mt-6 space-y-3 text-center">
        {match.status === "finished" && match.result && (
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-sm md:text-base font-bold neon-text uppercase tracking-widest bg-secondary/20 py-2 rounded-lg"
          >
            {match.result}
          </motion.p>
        )}

        {match.status === "live" && match.currentInnings === "2nd Innings" && match.target && (
          <div className="flex justify-center gap-4 text-[10px] md:text-xs font-bold neon-text-accent uppercase tracking-wider">
            <span>Target: {match.target}</span>
            {match.rrr && match.rrr !== "0" && <span>RRR: {match.rrr}</span>}
          </div>
        )}

        {match.status !== "upcoming" && match.tossWinner && match.tossChoice && (
          <p className="text-xs text-muted-foreground italic font-body">
            {match.tossWinner} won the toss and elected to {match.tossChoice} first.
          </p>
        )}

        <motion.p
          className="text-sm font-heading font-semibold neon-text-accent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {match.status === "upcoming" ? "Match not started" : (match.statusText || "Match info unavailable")}
        </motion.p>
      </div>
    </motion.div>
  );
}
