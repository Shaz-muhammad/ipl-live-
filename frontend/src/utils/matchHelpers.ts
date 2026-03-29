import { Match, RawMatch, RawTeam, TeamObject } from "../types/match";

export function safeText(value: any, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function isTeamObject(team: RawTeam): team is TeamObject {
  return typeof team === "object" && team !== null && !Array.isArray(team);
}

export function getTeamNameFromRaw(team: RawTeam): string {
  if (!team) return "Team";
  if (typeof team === "string") return team;
  if (isTeamObject(team)) return team.name || team.shortName || "Team";
  return "Team";
}

export function getTeamShortFromRaw(team: RawTeam, explicitShort?: string): string {
  if (explicitShort) return explicitShort;
  if (!team) return "TBD";
  if (typeof team === "string") return team.substring(0, 3).toUpperCase();
  if (isTeamObject(team)) return team.shortName || team.name?.substring(0, 3).toUpperCase() || "TBD";
  return "TBD";
}

export function getTeamLogoFromRaw(team: RawTeam, explicitLogo?: string): string {
  if (explicitLogo) return explicitLogo;
  if (isTeamObject(team)) return team.logo || "🏏";
  return "🏏";
}

export function isUrl(text: any): boolean {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
}

export function normalizeMatch(raw: RawMatch, index: number = 0): Match {
  const id = String(raw.id || `match-${index}`);
  const team1 = getTeamNameFromRaw(raw.team1);
  const team2 = getTeamNameFromRaw(raw.team2);

  return {
    id,
    team1,
    team2,
    team1Short: getTeamShortFromRaw(raw.team1, raw.team1Short),
    team2Short: getTeamShortFromRaw(raw.team2, raw.team2Short),
    team1Logo: getTeamLogoFromRaw(raw.team1, raw.team1Logo),
    team2Logo: getTeamLogoFromRaw(raw.team2, raw.team2Logo),
    team1Score: safeText(raw.team1Score, ""),
    team2Score: safeText(raw.team2Score, ""),
    team1Overs: safeText(raw.team1Overs, ""),
    team2Overs: safeText(raw.team2Overs, ""),
    status: safeText(raw.status, "Upcoming"),
    matchState: safeText(raw.matchState || raw.state, "upcoming"),
    venue: safeText(raw.venue, "Unknown Venue"),
    date: safeText(raw.date, ""),
    time: safeText(raw.time, ""),
    result: safeText(raw.result, ""),
    tossWinner: safeText(raw.tossWinner, ""),
    tossChoice: safeText(raw.tossChoice, ""),
    target: raw.target || 0,
    rrr: safeText(raw.rrr, ""),
    currentInnings: safeText(raw.currentInnings, ""),
    batting: raw.batting || [],
    bowling: raw.bowling || [],
    commentary: raw.commentary || [],
  };
}

export function normalizeMatches(data: any): Match[] {
  if (!data) return [];
  const rawArray = Array.isArray(data) ? data : data.data || [];
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map((m: any, i: number) => normalizeMatch(m, i));
}

export function getTeamLabel(shortName?: string, fullName?: string): string {
  return shortName || fullName || "Team";
}

export function getInitials(name: string): string {
  if (!name) return "T";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function formatStatus(match: Match): string {
  return match.status || "Upcoming Match";
}

export function formatOvers(overs: string): string {
  if (!overs) return "";
  if (overs.includes("ov")) return overs;
  return `${overs} ov`;
}

export function isLiveLike(match: Match): boolean {
  if (!match) return false;
  
  const state = (match.matchState || "").toLowerCase();
  const status = (match.status || "").toLowerCase();

  return (
    state === "in progress" ||
    status.includes("need") ||
    status.includes("opt to bat") ||
    Boolean(match.team1Score) ||
    Boolean(match.team2Score)
  );
}
