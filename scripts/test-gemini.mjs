import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

let apiKey = process.env.GEMINI_API_KEY || process.env.GEMNAI_API_KEY;
let model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!apiKey) {
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const keyMatch = envContent.match(/GEM(?:I|NA)I_API_KEY=([^\r\n]+)/);
    if (keyMatch) apiKey = keyMatch[1].trim();
    const modelMatch = envContent.match(/GEMINI_MODEL=([^\r\n]+)/);
    if (modelMatch) model = modelMatch[1].trim();
  } catch {}
}

if (!apiKey) {
  console.error("❌ ERROR: No GEMINI_API_KEY found in .env.local or environment.");
  process.exit(1);
}

console.log("🔍 Checking Gemini connection with key:", apiKey.substring(0, 8) + "...");
console.log("🤖 Using model:", model);

const client = new GoogleGenAI({ apiKey });

async function verify() {
  try {
    const prompt = "Please introduce yourself to a senior citizen in 2 friendly sentences.";
    console.log(`\n📤 Sending test prompt: "${prompt}"`);

    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });

    console.log("\n✅ SUCCESS! Gemini is working perfectly on your machine:");
    console.log("--------------------------------------------------");
    console.log(response.text?.trim());
    console.log("--------------------------------------------------\n");
  } catch (err) {
    console.error("\n❌ Gemini API Error:", err.message || err);
  }
}

verify();

