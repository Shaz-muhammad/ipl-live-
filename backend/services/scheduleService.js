import fs from "fs/promises"; 
 import path from "path"; 
 import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
 const schedulePath = path.resolve(__dirname, "..", "data", "iplSchedule.json"); 
 
 export async function getIplSchedule() { 
   try {
     const raw = await fs.readFile(schedulePath, "utf-8"); 
     return JSON.parse(raw); 
   } catch (error) {
     console.error("Error reading IPL schedule:", error);
     return [];
   }
 } 
