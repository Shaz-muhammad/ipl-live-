import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";
import type { Match } from "@/types/match";

interface Props {
  match: Match;
  onTeamClick: (teamId: string, primary: string, secondary: string) => void;
}

export function HeroMatchCard({ match, onTeamClick }: Props) {
  const navigate = useNavigate();

  if (!match) return null;

  const state = match.matchState?.toLowerCase() || "";
  const status = match.status?.toLowerCase() || "";

  const isLive =
    state.includes("progress") ||
    status.includes("need") ||
    status.includes("opt") ||
    status.includes("won toss") ||
    Boolean(match.team1Score) ||
    Boolean(match.team2Score);

  const isFinished =
    state === "complete" ||
    state === "completed" ||
    status.includes("won by");

  const displayStatus = isLive ? "live" : isFinished ? "finished" : "upcoming";

  const team1DisplayName = String(match.team1Short || match.team1 || "Team 1");
  const team2DisplayName = String(match.team2Short || match.team2 || "Team 2");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/match/${match.apiId || match.id}`)}
      className="glass-card neon-border cursor-pointer p-5 md:p-6 max-w-2xl mx-auto overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {displayStatus === "live" ? (
            <LiveBadge />
          ) : (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isFinished ? "bg-muted text-muted-foreground" : "bg-neon-blue/10 text-neon-blue"
            }`}>
              {isFinished ? "Match Finished" : "Upcoming"}
            </span>
          )}
        </div>
        <div className="text-[10px] md:text-xs text-muted-foreground font-medium truncate ml-4">
          {match.venue || "Unknown venue"} {match.date ? ` • ${match.date}` : ""}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-6">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(team1DisplayName, "#00ffff", "#0ea5e9");
          }}
        >
          <div className="flex flex-col items-center gap-1">
             <span className="text-3xl md:text-4xl filter drop-shadow-neon-sm group-hover:scale-110 transition-transform">
              {match.team1Logo || "🏏"}
            </span>
            <span className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {(match.team1Short || match.team1 || "").substring(0, 3)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl md:text-3xl font-bold text-foreground leading-none">
              {match.team1Score || "—"}
            </span>
            {match.team1Overs && (
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-1">
                ({match.team1Overs} ov)
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-8 w-[1px] bg-border/50" />
          <span className="font-display text-[10px] text-muted-foreground/50 my-1 font-bold">
            VS
          </span>
          <div className="h-8 w-[1px] bg-border/50" />
        </div>

        <div 
          className="flex items-center gap-3 justify-end text-right cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            onTeamClick(team2DisplayName, "#a855f7", "#ec4899");
          }}
        >
          <div className="flex flex-col items-end">
            <span className="font-display text-xl md:text-3xl font-bold text-foreground leading-none">
              {match.team2Score || "—"}
            </span>
            {match.team2Overs && (
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium mt-1">
                ({match.team2Overs} ov)
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl md:text-4xl filter drop-shadow-neon-sm group-hover:scale-110 transition-transform">
              {match.team2Logo || "🏏"}
            </span>
            <span className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {(match.team2Short || match.team2 || "").substring(0, 3)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/30 space-y-3">
        <p className={`text-sm md:text-base font-heading font-bold text-center ${
          displayStatus === "live" ? "neon-text-accent animate-pulse" : "text-foreground"
        }`}>
          {displayStatus === "upcoming" 
            ? `Starts at ${match.time || "TBD"}` 
            : (match.result || match.status || "Match info unavailable")}
        </p>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] md:text-xs text-muted-foreground font-medium">
          {match.tossWinner && match.tossChoice && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              {match.tossWinner} elected to {match.tossChoice}
            </span>
          )}
          {match.target && match.target > 0 && (
            <span className="flex items-center gap-1 text-neon-blue font-bold">
              <span className="w-1 h-1 rounded-full bg-neon-blue" />
              Target: {match.target}
            </span>
          )}
          {match.rrr && match.rrr !== "0" && (
            <span className="flex items-center gap-1 text-neon-red font-bold">
              <span className="w-1 h-1 rounded-full bg-neon-red" />
              RRR: {match.rrr}
            </span>
          )}
          {match.currentInnings && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              {match.currentInnings}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
