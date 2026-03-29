import axios from "axios"; 
 import { buildMatchDetails } from "./matchTransform.js"; 
 
 const CRICAPI_BASE = "https://api.cricapi.com/v1"; 
 
 // 🚀 Cache & Rate Limit State
 let cachedLiveMatches = [];
 let lastLiveFetch = 0;
 let isFetchingLive = false;
 const LIVE_POLL_INTERVAL = 20000; // 20 seconds
 const STANDBY_POLL_INTERVAL = 300000; // 5 minutes
 
 export function getPollInterval(hasLiveMatch) {
   return hasLiveMatch ? LIVE_POLL_INTERVAL : STANDBY_POLL_INTERVAL;
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
       timeout: Number(process.env.CRICAPI_TIMEOUT_MS ?? 10000), 
     }); 
     
     // Handle API failures or blocked status
     if (response.data?.status === "failure") {
       console.error(`❌ CricAPI Failure (${endpoint}):`, response.data.reason || "Unknown reason");
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
   const hasActiveMatch = cachedLiveMatches.some(m => m.matchStarted && !m.matchEnded);
   const minInterval = hasActiveMatch ? LIVE_POLL_INTERVAL : STANDBY_POLL_INTERVAL;

   if (!force && (now - lastLiveFetch < minInterval) && cachedLiveMatches.length > 0) {
     console.log("Returning cached data");
     return { data: cachedLiveMatches, fromCache: true };
   }

   isFetchingLive = true;
   try {
     console.log("Fetching fresh data from CricAPI");
     const res = await fetchCric("currentMatches", { offset: 0 }); 
     
     if (res && Array.isArray(res.data)) {
       cachedLiveMatches = res.data;
       lastLiveFetch = now;
       console.log(`✅ [CRICAPI] Successfully fetched ${cachedLiveMatches.length} matches.`);
     } else {
       if (cachedLiveMatches.length > 0) {
         console.warn("Returning last cached data (API failed)");
         return { data: cachedLiveMatches, fromCache: true };
       }
       console.log("No cache available");
     }
   } catch (err) {
     console.error("❌ [CRICAPI] Error fetching live matches:", err.message);
     if (cachedLiveMatches.length > 0) {
       console.warn("Returning last cached data (API failed)");
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
   return { data: cachedLiveMatches };
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
