import { resolveTeam } from "./teamMap.js";

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function pickMatchData(raw) {
  // CricAPI usually returns { data: ... } but sometimes structures differ across endpoints.
  const d = raw?.data ?? raw;
  if (Array.isArray(d)) return d[0] ?? null;
  if (typeof d === "object" && d) return d;
  return null;
}

function parseScoreFromInnings(scoreArr, teamName) {
  const arr = asArray(scoreArr);
  const inning = arr.find((s) => String(s?.inning ?? "").toLowerCase().includes(String(teamName).toLowerCase()));
  const r = inning?.r ?? inning?.R;
  const w = inning?.w ?? inning?.W;
  const o = inning?.o ?? inning?.O;
  if (r == null && w == null && o == null) return { score: "", overs: "" };
  const score = r != null && w != null ? `${r}/${w}` : r != null ? String(r) : "";
  return { score, overs: o != null ? String(o) : "" };
}

function getMatchStatus(match) {
  if (match?.matchEnded) return "finished";
  if (match?.matchStarted) return "live";
  return "upcoming";
}

function normalizeEventType(event) {
  const e = String(event ?? "").toLowerCase();
  if (!e) return null;
  if (e.includes("no") && e.includes("ball")) return "no-ball";
  if (e.includes("wide")) return "wide";
  if (e.includes("wicket")) return "wicket";
  if (e.includes("six")) return "six";
  if (e.includes("four")) return "four";
  if (e === "dot") return "dot";
  if (e === "normal") return "normal";
  return null;
}

function mapCommentaryEvent(evt, idx) {
  const over = evt?.over ?? evt?.overs ?? evt?.o ?? evt?.Over ?? "";
  const ball = evt?.ball ?? evt?.b ?? evt?.Ball ?? "";
  const text = evt?.text ?? evt?.commentary ?? evt?.detail ?? evt?.description ?? "";
  const runs = evt?.runs ?? evt?.run ?? evt?.R;

  const eventTypeFromField = normalizeEventType(evt?.event ?? evt?.type ?? evt?.kind);
  let eventType = eventTypeFromField;

  // Heuristics if the endpoint doesn't provide a consistent `event` field.
  if (!eventType) {
    const numericRuns = runs != null ? Number(runs) : NaN;
    if (typeof evt?.isWicket === "boolean" && evt.isWicket) eventType = "wicket";
    else if (evt?.wicket) eventType = "wicket";
    else if (numericRuns === 4) eventType = "four";
    else if (numericRuns === 6) eventType = "six";
    else if (evt?.wide) eventType = "wide";
    else if (evt?.noBall || evt?.noball) eventType = "no-ball";
    else if (numericRuns === 0) eventType = "dot";
    else if (eventType == null) eventType = "normal";
  }

  const allowed = new Set(["normal", "four", "six", "wicket", "dot", "wide", "no-ball"]);
  if (!allowed.has(eventType)) eventType = "normal";

  const id = String(evt?.id ?? evt?.ID ?? evt?.uid ?? `c_${idx}_${over}_${ball}_${text.slice(0, 10)}`);
  return {
    id,
    over: String(over),
    ball: String(ball),
    text: String(text),
    runs: typeof runs === "number" ? runs : Number(runs ?? 0),
    event: eventType,
    timestamp: Number(evt?.timestamp ?? evt?.time ?? evt?.ts ?? Date.now()),
  };
}

export function buildMatchDetails({ matchId, matchInfoRaw, matchScorecardRaw }) {
  const matchInfo = pickMatchData(matchInfoRaw) || {};
  const matchScorecard = pickMatchData(matchScorecardRaw) || matchScorecardRaw || {};

  const status = getMatchStatus(matchInfo);
  const statusText = matchInfo?.status ?? matchInfo?.statusText ?? matchInfo?.event ?? "";

  const teams = asArray(matchInfo?.teams ?? []);
  const team1Name = teams[0] ?? "";
  const team2Name = teams[1] ?? "";

  const team1 = resolveTeam(team1Name);
  const team2 = resolveTeam(team2Name);

  const { score: team1Score, overs: team1Overs } = parseScoreFromInnings(matchInfo?.score, team1Name);
  const { score: team2Score, overs: team2Overs } = parseScoreFromInnings(matchInfo?.score, team2Name);

  const date = matchInfo?.date ?? matchInfo?.dateTimeGMT ?? "";
  const venue = matchInfo?.venue ?? "";

  // Batting and bowling
  const battingInnings =
    asArray(matchScorecard?.batting) ||
    asArray(matchScorecard?.data?.batting) ||
    asArray(matchScorecard?.scorecard?.batting) ||
    [];

  const bowlingInnings =
    asArray(matchScorecard?.bowling) ||
    asArray(matchScorecard?.data?.bowling) ||
    asArray(matchScorecard?.scorecard?.bowling) ||
    [];

  const batting = battingInnings.flatMap((inning) => {
    const scores = asArray(inning?.scores ?? inning?.batting ?? inning?.data?.scores);
    return scores
      .map((b) => {
        const name = b?.batsman ?? b?.batsman_name ?? b?.name ?? b?.player;
        const dismissal = b?.["dismissal-info"] ?? b?.dismissal ?? b?.out ?? "";
        const runs = Number(b?.R ?? b?.runs ?? b?.run ?? 0);
        const balls = Number(b?.B ?? b?.balls ?? 0);
        const fours = Number(b?.["4s"] ?? b?.fours ?? 0);
        const sixes = Number(b?.["6s"] ?? b?.sixes ?? 0);
        const sr = Number(b?.SR ?? b?.sr ?? 0);
        if (!name) return null;
        return {
          name: String(name),
          runs,
          balls,
          fours,
          sixes,
          sr: Number.isFinite(sr) ? sr : 0,
          dismissal: String(dismissal),
        };
      })
      .filter(Boolean);
  });

  const bowling = bowlingInnings.flatMap((inning) => {
    const scores = asArray(inning?.scores ?? inning?.bowling ?? inning?.data?.scores);
    return scores
      .map((b) => {
        const name = b?.bowler ?? b?.name ?? b?.player;
        const overs = Number(b?.O ?? b?.overs ?? b?.over ?? 0);
        const maidens = Number(b?.M ?? b?.maidens ?? 0);
        const runs = Number(b?.R ?? b?.runs ?? 0);
        const wickets = Number(b?.W ?? b?.wickets ?? 0);
        const economy = Number(b?.Econ ?? b?.economy ?? b?.eco ?? 0);
        if (!name) return null;
        return {
          name: String(name),
          overs: Number.isFinite(overs) ? overs : 0,
          maidens: Number.isFinite(maidens) ? maidens : 0,
          runs: Number.isFinite(runs) ? runs : 0,
          wickets: Number.isFinite(wickets) ? wickets : 0,
          economy: Number.isFinite(economy) ? economy : 0,
        };
      })
      .filter(Boolean);
  });

  const commentaryRaw =
    asArray(matchScorecard?.commentary) ||
    asArray(matchScorecard?.data?.commentary) ||
    asArray(matchScorecard?.timeline) ||
    [];

  // If CricAPI returns a different commentary structure, try to find it within common paths.
  const commentary =
    commentaryRaw.length > 0
      ? commentaryRaw.map((evt, idx) => mapCommentaryEvent(evt, idx)).filter((e) => e.text || e.over || e.ball)
      : asArray(matchScorecard?.match?.commentary)
          .map((evt, idx) => mapCommentaryEvent(evt, idx))
          .filter((e) => e.text || e.over || e.ball);

  return {
    id: String(matchId),
    team1,
    team2,
    team1Score: team1Score ?? "",
    team2Score: team2Score ?? "",
    team1Overs: team1Overs ?? "",
    team2Overs: team2Overs ?? "",
    status,
    statusText: String(statusText ?? ""),
    venue: String(venue ?? ""),
    date: String(date ?? ""),
    batting,
    bowling,
    commentary,
  };
}

