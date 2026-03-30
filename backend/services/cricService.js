import axios from "axios"; 
 
 // 🚀 Global State
 let cachedData = []; 
 let lastFetchTime = 0; 
 let isFetching = false; 
 let pauseUntil = 0; 
 let currentPollingMode = "standby"; 
 
 // ⚙️ Constants
 const STANDBY_INTERVAL = 20 * 60 * 1000; 
 const LIVE_INTERVAL = 60 * 1000; 
 const PAUSE_DURATION = 20 * 60 * 1000; 
 
 function getRapidKey() { 
   const key = process.env.RAPID_API_KEY; 
   if (!key) throw new Error("RAPID_API_KEY is not configured"); 
   return key; 
 } 
 
 function pauseAPI(minutes = 20) { 
   pauseUntil = Date.now() + minutes * 60 * 1000; 
   console.log(`API paused for ${minutes} minutes`); 
 } 
 
 async function fetchRapidLiveMatches() { 
   try { 
     const response = await axios.get( 
       "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live", 
       { 
         headers: { 
           "x-rapidapi-key": getRapidKey(), 
           "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com", 
         }, 
         timeout: 15000, 
       } 
     ); 
  
     return response.data; 
   } catch (error) { 
     console.error("RapidAPI fetch error:", error.response?.data || error.message); 
     throw error; 
   } 
 } 
 
 function extractMatches(apiResponse) { 
   const typeMatches = apiResponse?.typeMatches || []; 
   const matches = []; 
  
   typeMatches.forEach((typeItem) => { 
     typeItem?.seriesMatches?.forEach((seriesItem) => { 
       const seriesMatches = seriesItem?.seriesAdWrapper?.matches || []; 
       seriesMatches.forEach((match) => matches.push(match)); 
     }); 
   }); 
  
   return matches; 
 } 
 
 function isIPLMatch(match) { 
   const seriesName = 
     match?.seriesName?.toLowerCase() || 
     match?.matchInfo?.seriesName?.toLowerCase() || 
     ""; 
  
   const team1 = 
     match?.matchInfo?.team1?.teamName?.toLowerCase() || ""; 
   const team2 = 
     match?.matchInfo?.team2?.teamName?.toLowerCase() || ""; 
  
   return ( 
     seriesName.includes("indian premier league") || 
     seriesName.includes("ipl") || 
     seriesName.includes("t20") || // More lenient for IPL matches often categorized as T20
     team1.includes("mumbai") || 
     team1.includes("chennai") || 
     team1.includes("royal challengers") || 
     team1.includes("kolkata") || 
     team1.includes("hyderabad") || 
     team1.includes("delhi capitals") || 
     team1.includes("rajasthan") || 
     team1.includes("punjab") || 
     team1.includes("lucknow") || 
     team1.includes("gujarat") || 
     team2.includes("mumbai") || 
     team2.includes("chennai") || 
     team2.includes("royal challengers") || 
     team2.includes("kolkata") || 
     team2.includes("hyderabad") || 
     team2.includes("delhi capitals") || 
     team2.includes("rajasthan") || 
     team2.includes("punjab") || 
     team2.includes("lucknow") || 
     team2.includes("gujarat") 
   ); 
 } 
 
 function isLiveMatch(match) { 
   const info = match?.matchInfo; 
   const score = match?.matchScore; 
   const state = info?.state?.toLowerCase?.() || ""; 
   const stateTitle = info?.stateTitle?.toLowerCase?.() || ""; 
   const status = info?.status?.toLowerCase?.() || ""; 
 
   return Boolean( 
     state === "in progress" || 
     state === "live" ||
     stateTitle === "in progress" || 
     status.includes("need") || 
     status.includes("opt to bat") || 
     status.includes("won toss") || 
     score?.team1Score?.inngs1 || 
     score?.team2Score?.inngs1 
   ); 
 } 
 
 function normalizeMatch(match) { 
   const info = match?.matchInfo || {}; 
   const score = match?.matchScore || {}; 
 
   const team1Innings = score?.team1Score?.inngs1; 
   const team2Innings = score?.team2Score?.inngs1; 
 
   // Extract target if available (usually team2's innings has it when chasing)
   const target = team2Innings?.target || 0;

   return { 
     id: String(info?.matchId || ""), 
     team1: info?.team1?.teamName || "Team 1", 
     team2: info?.team2?.teamName || "Team 2", 
     team1Short: info?.team1?.teamSName || "", 
     team2Short: info?.team2?.teamSName || "", 
     team1Logo: String(info?.team1?.imageId || ""), 
     team2Logo: String(info?.team2?.imageId || ""), 
     status: info?.status || "", 
     venue: info?.venueInfo?.ground || "", 
     matchState: info?.state || "", 
     team1Score: team1Innings 
       ? `${team1Innings.runs || 0}/${team1Innings.wickets || 0}` 
       : "", 
     team2Score: team2Innings 
       ? `${team2Innings.runs || 0}/${team2Innings.wickets || 0}` 
       : "", 
     team1Overs: team1Innings?.overs ? String(team1Innings.overs) : "", 
     team2Overs: team2Innings?.overs ? String(team2Innings.overs) : "", 
     target: target,
     result: info?.status || "", 
     commentary: [], 
   }; 
 } 
 
 export async function fetchScores() { 
   const now = Date.now(); 
  
   if (now < pauseUntil) { 
     console.log("API paused, returning cached data"); 
     return { 
       apiStatus: cachedData.length ? "live" : "paused", 
       data: cachedData, 
     }; 
   } 
  
   if (isFetching) { 
     console.log("Already fetching, returning cache"); 
     return { 
       apiStatus: cachedData.length ? "live" : "paused", 
       data: cachedData, 
     }; 
   } 
  
   const activeInterval = 
     currentPollingMode === "live" ? LIVE_INTERVAL : STANDBY_INTERVAL; 
  
   if (now - lastFetchTime < activeInterval && cachedData.length > 0) { 
     console.log("Returning cached data"); 
     return { 
       apiStatus: cachedData.length ? "live" : "no-match", 
       data: cachedData, 
     }; 
   } 
  
   isFetching = true; 
  
   try { 
     console.log("Fetching fresh RapidAPI live data"); 
  
     const apiResponse = await fetchRapidLiveMatches(); 
     const allMatches = extractMatches(apiResponse); 
     console.log(`Total matches extracted: ${allMatches.length}`);

     const iplMatches = allMatches.filter(isIPLMatch); 
     console.log(`IPL matches found: ${iplMatches.length}`);

     // Log all IPL matches found before live filtering to help debug
     iplMatches.forEach(m => {
       console.log(`IPL Match: ${m.matchInfo?.team1?.teamName} vs ${m.matchInfo?.team2?.teamName} | State: ${m.matchInfo?.state} | Status: ${m.matchInfo?.status}`);
     });

     const liveIPLMatches = iplMatches.filter(isLiveMatch); 
     console.log(`Live IPL matches found: ${liveIPLMatches.length}`);

     liveIPLMatches.forEach(m => {
       console.log(`Live IPL: ${m.matchInfo?.team1?.teamName} vs ${m.matchInfo?.team2?.teamName} | ${m.matchInfo?.state} | ${m.matchInfo?.status}`);
     });

     const normalized = liveIPLMatches.map(normalizeMatch); 
  
     lastFetchTime = now; 
  
     if (normalized.length > 0) { 
       cachedData = normalized; 
       currentPollingMode = "live"; 
       console.log("Polling mode: live");
       return { apiStatus: "live", data: cachedData }; 
     } 
  
     currentPollingMode = "standby"; 
     console.log("Polling mode: standby");
  
     return { apiStatus: "no-match", data: cachedData.length ? cachedData : [] }; 
   } catch (error) { 
     console.error("RapidAPI failed, pausing for 20 minutes"); 
     pauseAPI(20); 
  
     return { 
       apiStatus: cachedData.length ? "live" : "unavailable", 
       data: cachedData, 
     }; 
   } finally { 
     isFetching = false; 
   } 
 } 
 
 export function getCachedScores() {
   return { 
     apiStatus: cachedData.length ? "live" : (Date.now() < pauseUntil ? "paused" : "no-match"), 
     data: cachedData 
   };
 }
 
 export function getApiStatus(mergedMatches = []) {
   const now = Date.now();
   const hasLiveMatch = mergedMatches.some((m) => m.status === "live" || m.matchState === "live" || m.matchState === "In Progress");

   if (hasLiveMatch) return "live";
   if (now < pauseUntil) return cachedData.length > 0 ? "live" : "paused";
   if (cachedData.length === 0 && lastFetchTime === 0) return "unavailable";
   return "no-match";
 }
 
 export async function getMatchDetails(matchId) { 
   const match = cachedData.find(m => m.id === String(matchId));
   if (match) {
     return {
       ...match,
       team1: String(match.team1 || "Team 1"),
       team2: String(match.team2 || "Team 2"),
       team1Short: String(match.team1Short || match.team1 || "T1").substring(0, 4).toUpperCase(),
       team2Short: String(match.team2Short || match.team2 || "T2").substring(0, 4).toUpperCase(),
       team1Score: match.team1Score,
       team2Score: match.team2Score,
       team1Overs: match.team1Overs,
       team2Overs: match.team2Overs,
       status: match.status,
       commentary: match.commentary || [],
       batting: match.batting || [],
       bowling: match.bowling || []
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
   const state = String(match?.matchState ?? "").toLowerCase();
   const status = String(match?.status ?? "").toLowerCase();
   
   return (
     state === "live" || 
     state === "inprogress" || 
     status.includes("opt to bat") || 
     status.includes("need") || 
     status.includes("trail")
   );
 }
