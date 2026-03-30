import type { Match } from "@/types/match";

export function formatOvers(overs?: string): string {
  if (!overs) return "";
  if (overs.includes("ov")) return overs;
  return `${overs} ov`;
}

export function formatStatus(match: Match): string {
  return match.status || "Upcoming Match";
}

export function getInitials(name?: string): string {
  if (!name) return "T";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function getTeamLabel(shortName?: string, fullName?: string): string {
  return shortName || fullName || "Team";
}

export function safeText(value: any, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
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
