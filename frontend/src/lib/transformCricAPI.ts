import type { Match } from "@/types/match";

// 🧠 TEAM
function createTeamName(name: string): string {
  return typeof name === 'string' ? name : "Team";
}

// 🔥 SINGLE MATCH TRANSFORM
export function transformMergedMatch(match: any): Match {
  // Use pre-normalized values if available (from backend Cricbuzz logic)
  const team1Name = match.team1 || match.teams?.[0] || match.homeTeam || "Team 1";
  const team2Name = match.team2 || match.teams?.[1] || match.awayTeam || "Team 2";

  const team1 = createTeamName(team1Name);
  const team2 = createTeamName(team2Name);

  // If backend already sent strings, use them. Otherwise fallback to old parser.
  const team1Score = match.team1Score || "";
  const team2Score = match.team2Score || "";
  const team1Overs = match.team1Overs || "";
  const team2Overs = match.team2Overs || "";

  return {
    id: match.id || match.apiId || Math.random().toString(),
    apiId: match.apiId,
    team1,
    team2,
    team1Short: (match.team1Short || team1).substring(0, 3).toUpperCase(),
    team2Short: (match.team2Short || team2).substring(0, 3).toUpperCase(),
    team1Logo: match.team1Logo,
    team2Logo: match.team2Logo,

    team1Score,
    team2Score,
    team1Overs,
    team2Overs,

    status: match.status || "upcoming",
    venue: match.venue || "Unknown venue",
    date: match.date || "",
    time: match.time || "",

    batting: [],
    bowling: [],
    commentary: [],
  };
}

// 🔥 MULTIPLE MATCHES TRANSFORM
export function transformCricAPIMatches(matches: any[]): Match[] {
  if (!matches || matches.length === 0) {
    return [];
  }

  return matches.map(transformMergedMatch);
}
