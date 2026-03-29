import axios from "axios"; 
 import { buildMatchDetails } from "./matchTransform.js"; 
 
 const CRICAPI_BASE = "https://api.cricapi.com/v1"; 
 
 // 🚀 Cache & Rate Limit State
 let cachedLiveMatches = [];
 let lastLiveFetch = 0;
 let isFetchingLive = false;
 const MIN_POLL_INTERVAL = 20000; // 20 seconds
 
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
 
 export async function fetchCurrentMatches() { 
   const now = Date.now();
   
   // 1. Check if already fetching
   if (isFetchingLive) {
     console.log("⏳ Fetch already in progress, returning cache...");
     return { data: cachedLiveMatches, fromCache: true };
   }

   // 2. Check if called too soon
   if (now - lastLiveFetch < MIN_POLL_INTERVAL && cachedLiveMatches.length > 0) {
     console.log("🛡️ Rate limit protection: returning cached live matches...");
     return { data: cachedLiveMatches, fromCache: true };
   }

   isFetchingLive = true;
   try {
     console.log("📡 Fetching fresh matches from CricAPI...");
     const res = await fetchCric("currentMatches", { offset: 0 }); 
     
     if (res && Array.isArray(res.data)) {
       cachedLiveMatches = res.data;
       lastLiveFetch = now;
       console.log(`✅ Successfully fetched ${cachedLiveMatches.length} matches.`);
     } else {
       console.warn("⚠️ API returned invalid data or failed, using cache.");
     }
   } catch (err) {
     console.error("❌ Error fetching live matches:", err.message);
   } finally {
     isFetchingLive = false;
   }

   return { data: cachedLiveMatches, fromCache: false }; 
 } 
 
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
