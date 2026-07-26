import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "northlane-api/.env") });

const apiKey = process.env.GROQ_API_KEY || "";

if (!process.env.GROQ_API_KEY) {
  console.log("[Groq] Configured Groq API key from environment fallback.");
}

export const groq = new Groq({
  apiKey
});
