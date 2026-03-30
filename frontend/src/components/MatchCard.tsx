import { motion } from "framer-motion";
import type { Match } from "@/types/match";

type MatchCardProps = {
  match: Match;
  onClick?: () => void;
};

const isValidImageUrl = (value?: string): boolean => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
};

const getInitials = (name?: string): string => {
  if (!name || typeof name !== "string") return "T";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const team1Name = match.team1Short || match.team1 || "Unknown Team 1";
  const team2Name = match.team2Short || match.team2 || "Unknown Team 2";

  const team1Score = match.team1Score || "—";
  const team2Score = match.team2Score || "—";

  const status = match.status || match.result || "Live";
  const venue = match.venue || "TBA";
  const matchState = match.matchState || "Live";

  const isRequirement = status.toLowerCase().includes("need") || status.toLowerCase().includes("require");
  const isResult = status.toLowerCase().includes("won") || status.toLowerCase().includes("tied") || status.toLowerCase().includes("drawn") || status.toLowerCase().includes("no result");

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md hover:border-cyan-400/40"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            {matchState}
          </span>
          {match.target ? (
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              T: {match.target}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs text-gray-400">{venue}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isValidImageUrl(match.team1Logo) ? (
              <img
                src={match.team1Logo}
                alt={team1Name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-200">
                {match.team1Logo && match.team1Logo.length <= 4 ? match.team1Logo : getInitials(team1Name)}
              </div>
            )}

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
                {match.team1Overs} ov
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isValidImageUrl(match.team2Logo) ? (
              <img
                src={match.team2Logo}
                alt={team2Name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500/20 text-xs font-bold text-fuchsia-200">
                {match.team2Logo && match.team2Logo.length <= 4 ? match.team2Logo : getInitials(team2Name)}
              </div>
            )}

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
                {match.team2Overs} ov
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`mt-4 border-t border-white/10 pt-3`}>
        <div className="flex items-center gap-1.5">
          {isRequirement && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />}
          <p className={`line-clamp-2 text-sm font-medium ${
            isRequirement 
              ? "text-amber-300" 
              : isResult 
                ? "text-emerald-300" 
                : "text-gray-400"
          }`}>
            {status}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

