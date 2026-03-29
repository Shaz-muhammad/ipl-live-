import axios from "axios"; 
 
 // 🚀 Global State
 let cachedLiveMatches = [];
 let lastFetchTime = 0;
 let isFetching = false;
 let pauseUntil = 0;
 let currentPollingMode = "standby"; // "standby" | "live"
 
 // ⚙️ Constants
 const STANDBY_INTERVAL = 20 * 60 * 1000; // 20 minutes
 const LIVE_INTERVAL = 60 * 1000;         // 1 minute
 const PAUSE_DURATION = 20 * 60 * 1000;   // 20 minutes
 
 function getRapidKey() { 
   const key = process.env.RAPID_API_KEY; 
   if (!key) throw new Error("RAPID_API_KEY is not configured"); 
   return key; 
 } 
 
 export function pauseAPI(minutes = 20) {
   pauseUntil = Date.now() + minutes * 60 * 1000;
   console.log(`⚠️ API blocked/rate-limited, pausing for ${minutes} minutes`);
 }
 
 async function fetchLiveMatchesFromAPI() { 
   try { 
     console.log("Fetching fresh live-score data from RapidAPI");
     const response = await axios.get( 
       "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live", 
       { 
         headers: { 
           "x-rapidapi-key": getRapidKey(), 
           "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com", 
         }, 
         timeout: 15000
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
     // Trigger pause on rate limit or other API failures
     if (error.response?.status === 429 || error.message.includes("timeout") || error.message.includes("network")) {
       pauseAPI(20);
     }
     return null; 
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
 
 export async function fetchScores(force = false) { 
   const now = Date.now();
   
   // 1. Check if paused
   if (now < pauseUntil) {
     console.log("API paused, returning cached data");
     return { data: cachedLiveMatches, fromCache: true };
   }
 
   // 2. Prevent duplicate parallel requests
   if (isFetching) {
     return { data: cachedLiveMatches, fromCache: true };
   }
 
   // 3. Check interval based on currentPollingMode
   const activeInterval = currentPollingMode === "live" ? LIVE_INTERVAL : STANDBY_INTERVAL;
   if (!force && (now - lastFetchTime < activeInterval) && cachedLiveMatches.length > 0) {
     console.log("Returning cached data");
     return { data: cachedLiveMatches, fromCache: true };
   }
 
   isFetching = true;
   try {
     const matches = await fetchLiveMatchesFromAPI(); 
     
     if (matches === null) {
       // API failed, return cache
       return { data: cachedLiveMatches, fromCache: true };
     }

     const iplMatches = matches.filter(isIPL); 
     const formatted = iplMatches.map(normalizeMatch); 
  
     cachedLiveMatches = formatted;
     lastFetchTime = now;

     // Update polling mode based on live IPL match status
     const hasLiveMatch = formatted.some(m => isMatchLive(m));
     const newMode = hasLiveMatch ? "live" : "standby";
     if (newMode !== currentPollingMode) {
       currentPollingMode = newMode;
       console.log(`Polling mode: ${currentPollingMode}`);
     }

     if (now >= pauseUntil && pauseUntil !== 0) {
        // Log resume if it was paused before
        console.log("API resumed");
        pauseUntil = 0;
     }

   } catch (err) {
     console.error("❌ Error in fetchScores:", err.message);
     pauseAPI(20);
   } finally {
     isFetching = false;
   }
 
   return { data: cachedLiveMatches, fromCache: false }; 
 } 
 
 export function getCachedScores() {
   return { data: cachedLiveMatches };
 }
 
 export function getApiStatus(mergedMatches = []) {
   const now = Date.now();
   const hasLiveMatch = mergedMatches.some((m) => m.status === "live");

   if (hasLiveMatch) return "live";
   if (now < pauseUntil) {
     // If paused but we have cached live matches, it's still "live" (frontend logic will handle)
     // But for status field:
     return cachedLiveMatches.length > 0 ? "live" : "paused";
   }
   if (cachedLiveMatches.length === 0 && lastFetchTime === 0) return "unavailable";
   return "no-match";
 }
 
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
 
 export function getPollInterval(hasLiveMatch) {
   return hasLiveMatch ? LIVE_INTERVAL : STANDBY_INTERVAL;
 }
 
 export function getCurrentPollingMode() {
   return currentPollingMode;
 }
 
 export function setCurrentPollingMode(mode) {
   currentPollingMode = mode;
 }
 
 export function isMatchLive(match) {
   // A match should be considered live if:
   // - matchStarted === true and matchEnded === false
   // OR
   // - matchState === "live"
   // OR
   // - score exists and match is active
   const state = String(match?.matchState ?? "").toLowerCase();
   const status = String(match?.status ?? "").toLowerCase();
   
   const isActiveState = state === "live" || state === "in progress" || state === "inprogress";
   const hasScore = match?.score?.length > 0;
   
   return (match?.matchStarted && !match?.matchEnded) || isActiveState || (hasScore && !match?.matchEnded);
 }
