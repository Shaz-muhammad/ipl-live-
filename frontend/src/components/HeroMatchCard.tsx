import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LiveBadge } from "./LiveBadge";
import type { Match } from "@/lib/transformCricAPI";

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

  const team1Id = match.team1.id;
  const team2Id = match.team2.id;

  const team1Primary = match.team1.primaryColor;
  const team1Secondary = match.team1.secondaryColor;
  const team2Primary = match.team2.primaryColor;
  const team2Secondary = match.team2.secondaryColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/match/${match.apiId || match.id}`)}
      className="glass-card neon-border cursor-pointer p-5 md:p-6 max-w-2xl mx-auto overflow-hidden relative"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      {/* 1. TOP ROW: Badge & Venue/Time */}
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

      {/* 2. CENTER SCORE AREA (Information Dense) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-6">
        {/* Team 1 */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
             <span className="text-3xl md:text-4xl filter drop-shadow-neon-sm">
              {match.team1.logo}
            </span>
            <span className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {match.team1Short || match.team1.shortName}
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

        {/* VS Divider */}
        <div className="flex flex-col items-center">
          <div className="h-8 w-[1px] bg-border/50" />
          <span className="font-display text-[10px] text-muted-foreground/50 my-1 font-bold">
            VS
          </span>
          <div className="h-8 w-[1px] bg-border/50" />
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 justify-end text-right">
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
            <span className="text-3xl md:text-4xl filter drop-shadow-neon-sm">
              {match.team2.logo}
            </span>
            <span className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {match.team2Short || match.team2.shortName}
            </span>
          </div>
        </div>
      </div>

      {/* 3. STATUS LINE & EXTRA INFO */}
      <div className="pt-4 border-t border-border/30 space-y-3">
        {/* Primary Status Sentence */}
        <p className={`text-sm md:text-base font-heading font-bold text-center ${
          displayStatus === "live" ? "neon-text-accent animate-pulse" : "text-foreground"
        }`}>
          {displayStatus === "upcoming" 
            ? `Starts at ${match.time || "TBD"}` 
            : (match.result || statusText || "Match info unavailable")}
        </p>

        {/* Compact Details Row */}
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
