import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, 'backend', 'data', 'iplSchedule.json');

function formatDisplayDate(dateRaw) {
  const date = new Date(dateRaw);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours}:${minutes}`;
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const transformedData = rawData.map(match => {
  return {
    id: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    dateRaw: match.date, // original YYYY-MM-DD
    date: formatDisplayDate(match.date), // new display format
    timeRaw: convertTo24Hour(match.time), // new 24h format
    time: match.time, // original 12h format
    venue: match.venue
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(transformedData, null, 2));
console.log('Successfully transformed iplSchedule.json');
