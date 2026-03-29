import axios from "axios"; 
 
 // 🚀 Cache State
 let cachedLiveMatches = [];
 let lastLiveFetch = 0;
 let isFetchingLive = false;
 
 const POLL_INTERVAL = 60000; // 60 seconds as requested
 
 function getRapidKey() { 
   const key = process.env.RAPID_API_KEY; 
   if (!key) throw new Error("RAPID_API_KEY is not configured"); 
   return key; 
 } 
 
 async function fetchLiveMatches() { 
   try { 
     console.log("Fetching fresh data from RapidAPI (Cricbuzz)");
     const response = await axios.get( 
       "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live", 
       { 
         headers: { 
           "x-rapidapi-key": getRapidKey(), 
           "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com", 
         }, 
       } 
     ); 
  
     const typeMatches = response.data?.typeMatches || []; 
     let matches = []; 
  
     typeMatches.forEach(type => { 
       type.seriesMatches?.forEach(series => { 
         series.seriesAdWrapper?.matches?.forEach(match => { 
           matches.push(match); 
         }); 
       }); 
     }); 
  
     return matches; 
   } catch (error) { 
     console.error("API error:", error.message); 
     return []; 
   } 
 } 
 
 function isIPL(match) { 
   const name = 
     match?.matchInfo?.seriesName?.toLowerCase() || 
     ""; 
  
   return name.includes("indian premier league") || name.includes("ipl"); 
 } 
 
 function normalizeMatch(match) { 
   const info = match.matchInfo; 
   const score = match.matchScore;
   
   const team1Name = info.team1?.teamName;
   const team2Name = info.team2?.teamName;
 
   // Extract scores for mergeScheduleWithLive compatibility
   const scores = [];
   if (score?.team1Score?.inngs1) {
     scores.push({
       inning: team1Name,
       r: score.team1Score.inngs1.runs,
       w: score.team1Score.inngs1.wickets,
       o: score.team1Score.inngs1.overs
     });
   }
   if (score?.team2Score?.inngs1) {
     scores.push({
       inning: team2Name,
       r: score.team2Score.inngs1.runs,
       w: score.team2Score.inngs1.wickets,
       o: score.team2Score.inngs1.overs
     });
   }
 
   return { 
     id: String(info.matchId), 
     teams: [team1Name, team2Name],
     team1: team1Name, 
     team2: team2Name, 
     status: info.status, 
     venue: info.venueInfo?.ground, 
     matchState: info.state,
     matchStarted: info.state !== "Preview",
     matchEnded: info.state === "Complete",
     score: scores
   }; 
 } 
 
 export async function fetchCurrentMatches(force = false) { 
   const now = Date.now();
   
   if (isFetchingLive) {
     return { data: cachedLiveMatches, fromCache: true };
   }
 
   if (!force && (now - lastLiveFetch < POLL_INTERVAL) && cachedLiveMatches.length > 0) {
     return { data: cachedLiveMatches, fromCache: true };
   }
 
   isFetchingLive = true;
   try {
     const matches = await fetchLiveMatches(); 
     const iplMatches = matches.filter(isIPL); 
     const formatted = iplMatches.map(normalizeMatch); 
  
     if (formatted.length > 0 || matches.length > 0) {
       cachedLiveMatches = formatted;
       lastLiveFetch = now;
     }
   } catch (err) {
     console.error("❌ [RAPIDAPI] Error fetching live matches:", err.message);
   } finally {
     isFetchingLive = false;
   }
 
   return { data: cachedLiveMatches, fromCache: false }; 
 } 
 
 export function getCachedScores() {
   return { data: cachedLiveMatches };
 }
 
 export function getApiStatus(mergedMatches = []) {
   const hasLiveMatch = mergedMatches.some((m) => m.status === "live");
   if (hasLiveMatch) return "live";
   if (cachedLiveMatches.length === 0 && lastLiveFetch === 0) return "unavailable";
   return "no-match";
 }
 
 // Maintain existing exports for server.js
 export const fetchScores = fetchCurrentMatches;
 
 // Minimal implementation for match details since we switched to Cricbuzz
 // In a real scenario, we'd call Cricbuzz match info/scorecard endpoints.
 export async function getMatchDetails(matchId) { 
   const match = cachedLiveMatches.find(m => m.id === String(matchId));
   if (match) {
     return {
       ...match,
       team1: { shortName: match.team1, logo: "🏏" },
       team2: { shortName: match.team2, logo: "🏏" },
       team1Score: match.score[0]?.r ? `${match.score[0].r}/${match.score[0].w}` : "",
       team2Score: match.score[1]?.r ? `${match.score[1].r}/${match.score[1].w}` : "",
       team1Overs: match.score[0]?.o || "",
       team2Overs: match.score[1]?.o || "",
       statusText: match.status,
       commentary: [],
       batting: [],
       bowling: []
     };
   }
   return null;
 } 
 
 // Compatibility helpers for server.js
 export function getPollInterval(hasLiveMatch) {
   return POLL_INTERVAL;
 }
 
 export function getCurrentPollingMode() {
   return "live";
 }
 
 export function setCurrentPollingMode(mode) {
   // No-op for now as we have a fixed interval
 }
 
 export function isMatchLive(match) {
   return match.matchStarted && !match.matchEnded;
 }
