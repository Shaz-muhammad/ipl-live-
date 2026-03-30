import { motion } from "framer-motion";
import type { Match } from "@/types/match";

type HeroMatchCardProps = {
  match?: Match;
};

const safeText = (value: unknown, fallback = "—"): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
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

const getTeamLabel = (shortName?: string, fullName?: string): string => {
  const shortSafe = typeof shortName === "string" ? shortName.trim() : "";
  const fullSafe = typeof fullName === "string" ? fullName.trim() : "";

  if (shortSafe) return shortSafe;
  if (fullSafe) return fullSafe;
  return "Team";
};

const getInitials = (name?: string): string => {
  const text = safeText(name, "T");
  const parts = text.split(" ").filter(Boolean);

  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const formatOvers = (overs?: string): string => {
  const safeOvers = safeText(overs, "");
  return safeOvers ? `(${safeOvers})` : "";
};

const HeroMatchCard = ({ match }: HeroMatchCardProps) => {
  if (!match) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <p className="text-lg font-semibold text-white">No matches available</p>
        <p className="mt-2 text-sm text-gray-400">
          Check back later for live updates.
        </p>
      </div>
    );
  }

  const team1Name = match.team1Short || match.team1 || "Team 1";
  const team2Name = match.team2Short || match.team2 || "Team 2";

  const team1Score = safeText(match.team1Score, "—");
  const team2Score = safeText(match.team2Score, "—");

  const status = safeText(
    match.result || match.status,
    "Match info unavailable",
  );
  const venue = safeText(match.venue, "Venue not available");
  const matchState = safeText(match.matchState, "Match");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl"
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Featured Match
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{matchState}</h2>
        </div>

        <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
          {venue}
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-5">
          <div className="flex items-center gap-4">
            {isValidImageUrl(match.team1Logo) ? (
              <img
                src={match.team1Logo}
                alt={team1Name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-xl font-bold text-cyan-200">
                {match.team1Logo && match.team1Logo.length <= 4 ? match.team1Logo : getInitials(team1Name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">
                {team1Name}
              </p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">
                {team1Score}
              </p>
              {match.team1Overs ? (
                <p className="text-sm text-gray-400">
                  {formatOvers(match.team1Overs)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-5">
          <div className="flex items-center gap-4">
            {isValidImageUrl(match.team2Logo) ? (
              <img
                src={match.team2Logo}
                alt={team2Name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/20 text-xl font-bold text-fuchsia-200">
                {match.team2Logo && match.team2Logo.length <= 4 ? match.team2Logo : getInitials(team2Name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">
                {team2Name}
              </p>
              <p className="mt-1 text-2xl font-bold text-fuchsia-300">
                {team2Score}
              </p>
              {match.team2Overs ? (
                <p className="text-sm text-gray-400">
                  {formatOvers(match.team2Overs)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4">
        <p className="text-base font-medium text-emerald-300">{status}</p>
      </div>
    </motion.div>
  );
};

export default HeroMatchCard;
