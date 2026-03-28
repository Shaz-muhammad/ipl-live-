// 🔥 TYPES
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface BattingEntry {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  dismissal: string;
}

export interface BowlingEntry {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface CommentaryEntry {
  id: string;
  over: string;
  ball: string;
  text: string;
  runs: number;
  event: "normal" | "four" | "six" | "wicket" | "dot" | "wide" | "no-ball";
  timestamp: number;
}

interface ScoreEntry {
  inning: string;
  r: number;
  w: number;
  o: number;
}

export interface MergedMatch {
  id?: string;
  apiId?: string;
  teams?: string[];
  homeTeam?: string;
  awayTeam?: string;
  score?: ScoreEntry[];
  status: "live" | "upcoming" | "finished";
  statusText?: string;
  venue?: string;
  date?: string;
  time?: string;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: string;
  team2Score: string;
  team1Overs: string;
  team2Overs: string;
  status: "live" | "upcoming" | "finished";
  statusText: string;
  tossWinner?: string;
  tossChoice?: string;
  result?: string;
  target?: number;
  rrr?: string;
  currentInnings?: string;
  venue: string;
  date: string;
  time: string;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  commentary: CommentaryEntry[];
}

// 🎨 COLORS
const COLORS = [
  "160 100% 50%",
  "280 100% 65%",
  "200 100% 55%",
  "25 100% 55%",
  "330 100% 60%",
];

function getRandomColor(seed: string): string {
  const index = seed.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

// 🧠 TEAM
function createTeam(name: string): Team {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    shortName: name.substring(0, 3).toUpperCase(),
    logo: "🏏",
    primaryColor: getRandomColor(name),
    secondaryColor: "0 0% 20%",
  };
}

// 📊 SCORE PARSER
function parseScoreFromMerged(
  score: ScoreEntry[] | undefined,
  teamName: string,
): { score: string; overs: string } {
  if (!Array.isArray(score)) {
    return { score: "", overs: "" };
  }

  const inning = score.find((s) =>
    s.inning.toLowerCase().includes(teamName.toLowerCase()),
  );

  if (!inning) {
    return { score: "", overs: "" };
  }

  return {
    score: `${inning.r}/${inning.w}`,
    overs: `${inning.o}`,
  };
}

// 🔥 SINGLE MATCH TRANSFORM
export function transformMergedMatch(match: MergedMatch): Match {
  const team1Name = match.teams?.[0] || match.homeTeam || "Team 1";
  const team2Name = match.teams?.[1] || match.awayTeam || "Team 2";

  const team1 = createTeam(team1Name);
  const team2 = createTeam(team2Name);

  const t1 = parseScoreFromMerged(match.score, team1Name);
  const t2 = parseScoreFromMerged(match.score, team2Name);

  return {
    id: match.apiId || match.id || Math.random().toString(),

    team1,
    team2,

    team1Score: t1.score,
    team2Score: t2.score,
    team1Overs: t1.overs,
    team2Overs: t2.overs,

    status: match.status,
    statusText: match.statusText || "Match info unavailable",

    venue: match.venue || "Unknown venue",
    date: match.date || "",
    time: match.time || "",

    batting: [],
    bowling: [],
    commentary: [],
  };
}

// 🔥 MULTIPLE MATCHES TRANSFORM
export function transformCricAPIMatches(matches: MergedMatch[]): Match[] {
  if (!matches || matches.length === 0) {
    return [];
  }

  return matches.map(transformMergedMatch);
}
