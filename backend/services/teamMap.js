// Team mapping is mirrored from the frontend mock data so the UI can render consistently.
export const TEAMS = {
  csk: {
    id: "csk",
    name: "Chennai Super Kings",
    shortName: "CSK",
    logo: "🦁",
    primaryColor: "50 100% 55%",
    secondaryColor: "210 100% 40%",
  },
  mi: {
    id: "mi",
    name: "Mumbai Indians",
    shortName: "MI",
    logo: "🏏",
    primaryColor: "210 100% 50%",
    secondaryColor: "40 100% 50%",
  },
  rcb: {
    id: "rcb",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    logo: "👑",
    primaryColor: "0 100% 45%",
    secondaryColor: "45 100% 50%",
  },
  kkr: {
    id: "kkr",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    logo: "⚔️",
    primaryColor: "280 80% 50%",
    secondaryColor: "45 100% 50%",
  },
  dc: {
    id: "dc",
    name: "Delhi Capitals",
    shortName: "DC",
    logo: "🏛️",
    primaryColor: "210 100% 45%",
    secondaryColor: "0 100% 50%",
  },
  srh: {
    id: "srh",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    logo: "☀️",
    primaryColor: "25 100% 50%",
    secondaryColor: "0 0% 10%",
  },
  rr: {
    id: "rr",
    name: "Rajasthan Royals",
    shortName: "RR",
    logo: "🏰",
    primaryColor: "330 100% 50%",
    secondaryColor: "210 100% 50%",
  },
  pbks: {
    id: "pbks",
    name: "Punjab Kings",
    shortName: "PBKS",
    logo: "🗡️",
    primaryColor: "0 100% 50%",
    secondaryColor: "45 100% 50%",
  },
  gt: {
    id: "gt",
    name: "Gujarat Titans",
    shortName: "GT",
    logo: "🛡️",
    primaryColor: "200 80% 40%",
    secondaryColor: "45 100% 50%",
  },
  lsg: {
    id: "lsg",
    name: "Lucknow Super Giants",
    shortName: "LSG",
    logo: "🦅",
    primaryColor: "185 100% 40%",
    secondaryColor: "0 100% 50%",
  },
};

export const TEAM_NAME_MAP = {
  "Chennai Super Kings": "csk",
  "Mumbai Indians": "mi",
  "Royal Challengers Bengaluru": "rcb",
  "Royal Challengers Bangalore": "rcb",
  "Kolkata Knight Riders": "kkr",
  "Delhi Capitals": "dc",
  "Sunrisers Hyderabad": "srh",
  "Rajasthan Royals": "rr",
  "Punjab Kings": "pbks",
  "Gujarat Titans": "gt",
  "Lucknow Super Giants": "lsg",
};

export function resolveTeam(teamName) {
  const teamId = TEAM_NAME_MAP[teamName];
  return teamId && TEAMS[teamId]
    ? TEAMS[teamId]
    : {
        id: String(teamName || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .slice(0, 24),
        name: teamName || "Unknown Team",
        shortName: String(teamName || "")
          .substring(0, 3)
          .toUpperCase(),
        logo: "🏏",
        primaryColor: "160 100% 50%",
        secondaryColor: "280 100% 65%",
      };
}

