import { useQuery } from "@tanstack/react-query";

export interface CricAPIMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
  score?: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
  series_id?: string;
  fantasyEnabled?: boolean;
  bpiEnabled?: boolean;
  hasSquad?: boolean;
  matchStarted?: boolean;
  matchEnded?: boolean;
}

interface CricAPIResponse {
  data: CricAPIMatch[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function fetchFromBackend(
  endpoint: "currentMatches" | "matchInfo" | "matchScorecard",
  id?: string,
): Promise<CricAPIResponse> {
  let url = "";

  if (endpoint === "currentMatches") {
    url = `${API_BASE_URL}/matches`;
  } else if (endpoint === "matchInfo" && id) {
    url = `${API_BASE_URL}/match/${encodeURIComponent(id)}`;
  } else if (endpoint === "matchScorecard" && id) {
    url = `${API_BASE_URL}/match/${encodeURIComponent(id)}`;
  } else {
    throw new Error("Invalid endpoint or missing match id");
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  const result = await response.json();

  if (endpoint === "currentMatches") {
    return {
      data: Array.isArray(result) ? result : (result.data ?? []),
    };
  }

  return {
    data: result ? [result] : [],
  };
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ["cricapi", "currentMatches"],
    queryFn: () => fetchFromBackend("currentMatches"),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
  });
}

export function useMatchInfo(matchId: string | undefined) {
  return useQuery({
    queryKey: ["cricapi", "matchInfo", matchId],
    queryFn: () => fetchFromBackend("matchInfo", matchId),
    enabled: !!matchId,
    refetchInterval: 15000,
  });
}

export function useMatchScorecard(matchId: string | undefined) {
  return useQuery({
    queryKey: ["cricapi", "matchScorecard", matchId],
    queryFn: () => fetchFromBackend("matchScorecard", matchId),
    enabled: !!matchId,
    refetchInterval: 15000,
  });
}
