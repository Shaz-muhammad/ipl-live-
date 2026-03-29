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
  onTeamClick: (teamId: string, primary: string, secondary: string) => void;
}

export function HeroMatchCard({ match, onTeamClick }: Props) {
  const navigate = useNavigate();

  if (!match) return null;

  const state = match.matchState?.toLowerCase() || "";
  const statusText = match.status || "";
  const lowerStatus = statusText.toLowerCase();

  const isLive =
    state.includes("progress") ||
    state === "live" ||
    lowerStatus.includes("need") ||
    lowerStatus.includes("opt") ||
    lowerStatus.includes("won toss") ||
    Boolean(match.team1Score) ||
    Boolean(match.team2Score);

  const isFinished =
    state === "complete" ||
    state === "completed" ||
    lowerStatus.includes("won by") ||
    lowerStatus.includes("match tied") ||
    lowerStatus.includes("no result");

  const displayStatus = isLive ? "live" : isFinished ? "finished" : "upcoming";

  const team1Id = match.team1Short || match.team1;
  const team2Id = match.team2Short || match.team2;

  const team1Primary = "#00ffff";
  const team1Secondary = "#0ea5e9";
  const team2Primary = "#a855f7";
  const team2Secondary = "#ec4899";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/match/${match.apiId || match.id}`)}
      className="glass-card neon-border cursor-pointer p-6 md:p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        {displayStatus === "live" ? (
          <LiveBadge />
        ) : (
          <span className="text-xs text-muted-foreground">{displayStatus}</span>
        )}

        <span className="text-xs text-muted-foreground font-body">
          {match.venue || "Unknown venue"}
          {match.date ? ` • ${match.date}` : ""}
          {match.time ? ` • ${match.time}` : ""}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(team1Id, team1Primary, team1Secondary);
          }}
        >
          <span className="text-4xl md:text-5xl">
            {match.team1Logo || "🏏"}
          </span>
          <span className="font-heading text-lg font-bold text-foreground">
            {match.team1Short || match.team1 || "T1"}
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

        <div className="flex flex-col items-center">
          <span className="font-display text-sm text-muted-foreground tracking-widest">
            VS
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(team2Id, team2Primary, team2Secondary);
          }}
        >
          <span className="text-4xl md:text-5xl">
            {match.team2Logo || "🏏"}
          </span>
          <span className="font-heading text-lg font-bold text-foreground">
            {match.team2Short || match.team2 || "T2"}
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

      <div className="mt-6 space-y-3 text-center">
        {displayStatus === "finished" && match.result && (
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-sm md:text-base font-bold neon-text uppercase tracking-widest bg-secondary/20 py-2 rounded-lg"
          >
            {match.result}
          </motion.p>
        )}

        {displayStatus === "live" &&
          match.currentInnings === "2nd Innings" &&
          match.target && (
            <div className="flex justify-center gap-4 text-[10px] md:text-xs font-bold neon-text-accent uppercase tracking-wider">
              <span>Target: {match.target}</span>
              {match.rrr && match.rrr !== "0" && <span>RRR: {match.rrr}</span>}
            </div>
          )}

        {displayStatus !== "upcoming" &&
          match.tossWinner &&
          match.tossChoice && (
            <p className="text-xs text-muted-foreground italic font-body">
              {match.tossWinner} won the toss and elected to {match.tossChoice}{" "}
              first.
            </p>
          )}

        <motion.p
          className="text-sm font-heading font-semibold neon-text-accent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {displayStatus === "upcoming"
            ? "Match not started"
            : statusText || "Match info unavailable"}
        </motion.p>
      </div>
    </motion.div>
  );
}
