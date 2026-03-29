import { Match } from "@/types/match";
import { normalizeMatch } from "@/utils/matchHelpers";

// 🔥 SINGLE MATCH TRANSFORM
export function transformMergedMatch(match: any): Match {
  return normalizeMatch(match);
}

// 🔥 MULTIPLE MATCHES TRANSFORM
export function transformCricAPIMatches(matches: any[]): Match[] {
  if (!matches || matches.length === 0) {
    return [];
  }

  return matches.map(m => normalizeMatch(m));
}
