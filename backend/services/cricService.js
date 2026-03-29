import axios from "axios"; 
 import { buildMatchDetails } from "./matchTransform.js"; 
 
 const CRICAPI_BASE = "https://api.cricapi.com/v1"; 
 
 // 🚀 Cache & Rate Limit State
let cachedLiveMatches = [];
let lastLiveFetch = 0;
let isFetchingLive = false;
let currentPollingMode = "standby"; // "standby" | "live"
let blockedUntil = 0; // ⏳ Timestamp until which API calls are blocked

const LIVE_POLL_INTERVAL = 60000; // 1 minute
const STANDBY_POLL_INTERVAL = 1200000; // 20 minutes
const BLOCK_DURATION = 1200000; // 20 minutes pause

export function getPollInterval(hasLiveMatch) {
  return hasLiveMatch ? LIVE_POLL_INTERVAL : STANDBY_POLL_INTERVAL;
}

export function getApiStatus(mergedMatches = []) {
  const now = Date.now();
  const hasLiveMatch = mergedMatches.some((m) => m.status === "live");

  if (hasLiveMatch) return "live";
  if (now < blockedUntil) return "paused";
  if (mergedMatches.length === 0) return "unavailable";
  
  // If we have data but no live matches, it's "no-match"
  return "no-match";
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
  const now = Date.now();

  // 1. Check if we are currently in a blocked period
  if (now < blockedUntil) {
    const minutesLeft = Math.ceil((blockedUntil - now) / 60000);
    console.log(`⏳ CricAPI is currently blocked. Resuming in ${minutesLeft} minutes.`);
    return null;
  }

  const apikey = getCricKey(); 
  const url = `${CRICAPI_BASE}/${endpoint}`; 

  try { 
    const response = await axios.get(url, { 
      params: { apikey, ...params }, 
      timeout: Number(process.env.CRICAPI_TIMEOUT_MS ?? 15000), 
    }); 
    
    const data = response.data;

    // Detect if API is blocked or rate-limited
    const isBlocked = 
      data?.status === "failure" || 
      data?.error || 
      data?.info === "blocked" ||
      (typeof data?.reason === "string" && data.reason.toLowerCase().includes("blocked")) ||
      (typeof data?.reason === "string" && data.reason.toLowerCase().includes("limit"));

    if (isBlocked) {
      blockedUntil = now + BLOCK_DURATION;
      console.error(`❌ CricAPI Blocked/Rate-limited (${endpoint}). Pausing all calls for 20 minutes.`);
      console.error(`Reason: ${data?.reason || data?.error || data?.info || "Unknown"}`);
      return null;
    }
    
    return data; 
  } catch (err) { 
    console.error(`❌ CricAPI error (${endpoint}):`, err.message); 
    
    // If it's a 429 or other rate-limit related error, trigger block
    if (err.response?.status === 429) {
      blockedUntil = now + BLOCK_DURATION;
      console.error("❌ Received 429 Too Many Requests. Pausing for 20 minutes.");
    }
    
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

  // 3. Check if we are currently blocked
  if (now < blockedUntil) {
    if (cachedLiveMatches.length > 0) {
      console.log("Returning cached data (API Blocked)");
      return { data: cachedLiveMatches, fromCache: true };
    }
    console.log("No cache available (API Blocked)");
    return { data: [], fromCache: true };
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
   
   // 1. If we have a cache and it's fresh, use it
   if (cached && (now - cached.timestamp < MATCH_DETAIL_CACHE_TTL)) {
     console.log(`🛡️ Returning cached details for match ${matchId}`);
     return cached.data;
   }

   // 2. If we are currently blocked by CricAPI, return the cache even if expired
   if (now < blockedUntil) {
     if (cached) {
       console.log(`⏳ API Blocked: Returning last cached details for match ${matchId}`);
       return cached.data;
     }
     console.log(`⏳ API Blocked: No cache available for match ${matchId}`);
     return null;
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
