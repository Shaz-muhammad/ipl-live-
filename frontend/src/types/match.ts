export interface BattingEntry {
  id?: string | number;
  name?: string;
  playerName?: string;
  runs?: number | string;
  balls?: number | string;
  fours?: number | string;
  sixes?: number | string;
  strikeRate?: number | string;
  sr?: number | string;
  status?: string;
  dismissal?: string;
}

export interface BowlingEntry {
  id?: string | number;
  name?: string;
  playerName?: string;
  overs?: number | string;
  maidens?: number | string;
  runs?: number | string;
  wickets?: number | string;
  economy?: number | string;
  eco?: number | string;
}

export interface CommentaryEntry {
  id?: string | number;
  over?: string | number;
  ball?: string | number;
  text?: string;
  commentary?: string;
  runs?: number | string;
  event?: "normal" | "four" | "six" | "wicket" | "dot" | "wide" | "no-ball" | string;
  timestamp?: number | string;
}

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
  commentary?: CommentaryEntry[];
  batting?: BattingEntry[];
  bowling?: BowlingEntry[];
}
