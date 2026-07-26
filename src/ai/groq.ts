import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.warn("[Groq] Warning: GROQ_API_KEY environment variable is not defined.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ""
});
