import { motion } from "framer-motion";
import type { Match } from "../types/match";
import { TeamLogo } from "./TeamLogo";
import {
  formatOvers,
  formatStatus,
  getInitials,
  getTeamLabel,
  safeText,
} from "../utils/matchHelpers";

type MatchCardProps = {
  match: Match;
  onClick?: () => void;
};

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const team1Name = getTeamLabel(match.team1Short, match.team1);
  const team2Name = getTeamLabel(match.team2Short, match.team2);

  const team1Score = safeText(match.team1Score, "—");
  const team2Score = safeText(match.team2Score, "—");

  const venue = safeText(match.venue, "Venue not available");
  const status = formatStatus(match);
  const matchState = safeText(match.matchState, "Match");

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md hover:border-cyan-400/40"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          {matchState}
        </span>
        <span className="truncate text-xs text-gray-400">{venue}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TeamLogo 
              logo={match.team1Logo} 
              name={team1Name} 
              fallbackClassName="bg-cyan-500/20 text-sm font-bold text-cyan-200"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {team1Name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-white">{team1Score}</p>
            {match.team1Overs ? (
              <p className="text-xs text-gray-400">
                {formatOvers(match.team1Overs)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TeamLogo 
              logo={match.team2Logo} 
              name={team2Name} 
              fallbackClassName="bg-fuchsia-500/20 text-sm font-bold text-fuchsia-200"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {team2Name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-white">{team2Score}</p>
            {match.team2Overs ? (
              <p className="text-xs text-gray-400">
                {formatOvers(match.team2Overs)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="line-clamp-2 text-sm text-emerald-300">{status}</p>
      </div>
    </motion.div>
  );
}
