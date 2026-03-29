import axios from "axios"; 
 import { buildMatchDetails } from "./matchTransform.js"; 
 
 const CRICAPI_BASE = "https://api.cricapi.com/v1"; 
 
 // 🚀 Cache & Rate Limit State
let cachedLiveMatches = [];
let lastLiveFetch = 0;
let isFetchingLive = false;
let currentPollingMode = "standby"; // "standby" | "live"

const LIVE_POLL_INTERVAL = 60000; // 1 minute
const STANDBY_POLL_INTERVAL = 1200000; // 20 minutes

export function getPollInterval(hasLiveMatch) {
  return hasLiveMatch ? LIVE_POLL_INTERVAL : STANDBY_POLL_INTERVAL;
}

export function getCurrentPollingMode() {
  return currentPollingMode;
}

export function setCurrentPollingMode(mode) {
  if (mode !== currentPollingMode) {
    console.log(`Polling mode: ${mode}`);
    currentPollingMode = mode;
  }
}

function getCricKey() { 
  const key = process.env.CRIC_API_KEY; 
  if (!key) throw new Error("CRIC_API_KEY is not configured"); 
  return key; 
} 

async function fetchCric(endpoint, params = {}) { 
  const apikey = getCricKey(); 
  const url = `${CRICAPI_BASE}/${endpoint}`; 

  try { 
    const response = await axios.get(url, { 
      params: { apikey, ...params }, 
      timeout: Number(process.env.CRICAPI_TIMEOUT_MS ?? 15000), 
    }); 
    
    // Handle API failures or blocked status
    if (response.data?.status === "failure" || response.data?.error || response.data?.info === "blocked") {
      console.error(`❌ CricAPI Failure (${endpoint}):`, response.data?.reason || response.data?.error || response.data?.info || "Unknown reason");
      return null;
    }
    
    return response.data; 
  } catch (err) { 
    console.error(`❌ CricAPI error (${endpoint}):`, err.message); 
    return null; 
  } 
} 

export async function fetchCurrentMatches(force = false) { 
  const now = Date.now();
  
  // 1. Check if already fetching
  if (isFetchingLive) {
    if (cachedLiveMatches.length > 0) {
      console.log("Returning cached data");
      return { data: cachedLiveMatches, fromCache: true };
    }
    console.log("No cache available");
    return { data: [], fromCache: true };
  }

  // 2. Check if called too soon (Rate limit protection)
  const minInterval = currentPollingMode === "live" ? LIVE_POLL_INTERVAL : STANDBY_POLL_INTERVAL;

  if (!force && (now - lastLiveFetch < minInterval) && cachedLiveMatches.length > 0) {
    console.log("Returning cached data");
    return { data: cachedLiveMatches, fromCache: true };
  }

  isFetchingLive = true;
  try {
    console.log("Fetching fresh CricAPI data");
    const res = await fetchCric("currentMatches", { offset: 0 }); 
    
    if (res && Array.isArray(res.data)) {
      cachedLiveMatches = res.data;
      lastLiveFetch = now;
      console.log(`✅ [CRICAPI] Successfully fetched ${cachedLiveMatches.length} matches.`);
    } else {
      if (cachedLiveMatches.length > 0) {
        console.warn("Returning last cached data because API failed");
        return { data: cachedLiveMatches, fromCache: true };
      }
      console.log("No cache available");
    }
  } catch (err) {
    console.error("❌ [CRICAPI] Error fetching live matches:", err.message);
    if (cachedLiveMatches.length > 0) {
      console.warn("Returning last cached data because API failed");
      return { data: cachedLiveMatches, fromCache: true };
    }
    console.log("No cache available");
  } finally {
    isFetchingLive = false;
  }

  return { data: cachedLiveMatches, fromCache: false }; 
} 

/**
 * Returns the current cache immediately without triggering any API calls.
 * Used for REST endpoints to ensure they only return cached data.
 */
export function getCachedScores() {
  if (cachedLiveMatches.length === 0) {
    console.log("No cache available");
  }
  return { data: cachedLiveMatches };
}

/**
 * Helper to detect live matches safely from CricAPI response
 */
export function isMatchLive(match) {
  if (!match) return false;
  
  // If score exists and match is active, treat as live
  const hasScore = match.score && match.score.length > 0;
  const isActive = match.matchStarted && !match.matchEnded;
  
  if (hasScore && isActive) return true;
  
  // If result/status says complete, treat as finished
  if (match.matchEnded || (match.status && match.status.toLowerCase().includes("won"))) return false;
  
  return false;
}
 
 // Alias for fetchCurrentMatches as requested in prompt
 export const fetchScores = fetchCurrentMatches;
 
 export async function fetchMatchInfo(matchId) { 
   return fetchCric("match_info", { id: matchId }); 
 } 
 
 export async function fetchMatchScorecard(matchId) { 
   return fetchCric("match_scorecard", { id: matchId }); 
 } 
 
 // Cache for individual match details to prevent rate-limiting on details page
 const matchDetailsCache = new Map();
 const MATCH_DETAIL_CACHE_TTL = 15000; // 15 seconds

 export async function getMatchDetails(matchId) { 
   const now = Date.now();
   const cached = matchDetailsCache.get(matchId);
   
   if (cached && (now - cached.timestamp < MATCH_DETAIL_CACHE_TTL)) {
     console.log(`🛡️ Returning cached details for match ${matchId}`);
     return cached.data;
   }

   const [matchInfoRes, matchScorecardRes] = await Promise.allSettled([ 
     fetchMatchInfo(matchId), 
     fetchMatchScorecard(matchId), 
   ]); 
 
   const matchInfoRaw = 
     matchInfoRes.status === "fulfilled" ? matchInfoRes.value : {}; 
   const matchScorecardRaw = 
     matchScorecardRes.status === "fulfilled" ? matchScorecardRes.value : {}; 
 
   const transformed = buildMatchDetails({ 
     matchId, 
     matchInfoRaw, 
     matchScorecardRaw, 
   }); 

   if (transformed) {
     matchDetailsCache.set(matchId, { data: transformed, timestamp: now });
   }

   return transformed;
 } 
