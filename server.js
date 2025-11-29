require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function scrape(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 1500);
  } catch {
    return null;
  }
}

app.post("/chat", async (req, res) => {
  const { message, url } = req.body;

  const scrapedText = await scrape(url);

  const context = scrapedText
    ? `This bot is embedded on a webpage. Here is visible page content:\n"${scrapedText}".`
    : `No readable content was extracted from the webpage.`;

  const prompt = `
You are an embedded website assistant chatbot. 
You should help the user navigate the website, explain sections, and answer questions.

Webpage context: ${context}

User message: "${message}"

Respond clearly and conversationally.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.json({ reply: completion.choices[0].message.content });
});

app.listen(3000, () => console.log("🚀 Bot running at http://localhost:3000"));