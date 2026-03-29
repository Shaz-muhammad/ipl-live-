export type TeamObject = {
  id?: string | number;
  name?: string;
  shortName?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type RawTeam = string | TeamObject | null | undefined;

export type BattingEntry = {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  dismissal: string;
};

export type BowlingEntry = {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};

export type CommentaryEntry = {
  id: string;
  over: string;
  ball: string;
  text: string;
  runs: number;
  event: "normal" | "four" | "six" | "wicket" | "dot" | "wide" | "no-ball";
  timestamp: number;
};

export type RawMatch = {
  id?: string | number;

  team1?: RawTeam;
  team2?: RawTeam;

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
  state?: string;

  venue?: string;
  date?: string;
  time?: string;

  result?: string;
  tossWinner?: string;
  tossChoice?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;

  batting?: BattingEntry[];
  bowling?: BowlingEntry[];
  commentary?: CommentaryEntry[];
};

export type Match = {
  id: string;

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

  venue?: string;
  date?: string;
  time?: string;

  result?: string;
  tossWinner?: string;
  tossChoice?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;

  batting?: BattingEntry[];
  bowling?: BowlingEntry[];
  commentary?: CommentaryEntry[];
};
