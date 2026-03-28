import axios from "axios"; 
 import { buildMatchDetails } from "./matchTransform.js"; 
 
 const CRICAPI_BASE = "https://api.cricapi.com/v1"; 
 
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
     return response.data; 
   } catch (err) { 
     console.error(`❌ CricAPI error (${endpoint}):`, err.message); 
     return { data: [] }; 
   } 
 } 
 
 export async function fetchCurrentMatches() { 
   const res = await fetchCric("currentMatches", { offset: 0 }); 
   return { data: Array.isArray(res?.data) ? res.data : [] }; 
 } 
 
 export async function fetchMatchInfo(matchId) { 
   return fetchCric("match_info", { id: matchId }); 
 } 
 
 export async function fetchMatchScorecard(matchId) { 
   return fetchCric("match_scorecard", { id: matchId }); 
 } 
 
 export async function getMatchDetails(matchId) { 
   const [matchInfoRes, matchScorecardRes] = await Promise.allSettled([ 
     fetchMatchInfo(matchId), 
     fetchMatchScorecard(matchId), 
   ]); 
 
   const matchInfoRaw = 
     matchInfoRes.status === "fulfilled" ? matchInfoRes.value : {}; 
   const matchScorecardRaw = 
     matchScorecardRes.status === "fulfilled" ? matchScorecardRes.value : {}; 
 
   return buildMatchDetails({ 
     matchId, 
     matchInfoRaw, 
     matchScorecardRaw, 
   }); 
 } 
