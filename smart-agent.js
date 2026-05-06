require("dotenv").config();

const fs = require("fs");
const axios = require("axios");

const {
  Scraper
} = require("agent-twitter-client");

// ========================
// X SESSION LOGIN
// ========================

const scraper = new Scraper();

// ========================
// LOAD CONFIG
// ========================

const config = JSON.parse(
  fs.readFileSync("config.json")
);

const keywords = config.keywords;
const hashtags = config.hashtags;
const accounts = config.accounts;
const modes = config.modes;

// ========================
// EMOJIS
// ========================

const emojis = [
  "🔥",
  "👀",
  "🚀",
  "🌊",
  "⚡",
  "📈",
  "💧",
  "🧠",
  "🛠️"
];

// ========================
// FALLBACK STYLES
// ========================

const fallbackStyles = [
  "{k} feels massively underrated right now.",
  "Watching smart builders move into {k}.",
  "Feels like we're still early to {k}.",
  "Strong communities are forming around {k}.",
  "There’s real momentum building around {k}.",
  "Interesting developments happening around {k}.",
  "Feels like adoption around {k} is quietly growing.",
  "Smart money seems to be paying attention to {k}.",
  "Builders focusing on {k} seem very early."
];

// ========================
// HELPERS
// ========================

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDelay() {

  const min = 20;
  const max = 90;

  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

// ========================
// BUILD FINAL TWEET
// ========================

function buildTweet(text) {

  let tweet =
    text +
    " " +
    random(emojis) +
    " " +
    random(hashtags) +
    " " +
    random(hashtags);

  // ALWAYS ADD OFFICIAL TAG
  tweet += " " + random(accounts);

  return tweet.slice(0, 280);
}

// ========================
// GEMINI AI GENERATOR
// ========================

async function generateAITweet(keyword, mode) {

  try {

    const prompt = `
Generate a smart crypto Twitter/X post.

Topic: ${keyword}

Mode: ${mode}

Rules:
- Human-like
- Smart
- Alpha style
- Natural
- Engaging
- Max 220 characters
- No markdown
- No cringe
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const text =
      response.data.candidates[0]
      .content.parts[0].text;

    return text;

  } catch (err) {

    console.log(
      "Gemini Error:",
      err.message
    );

    return random(fallbackStyles)
      .replace("{k}", keyword);
  }
}

// ========================
// THREAD MODE
// ========================

async function generateThread(keyword) {

  return `
1/ Feels like we're still early to ${keyword}. 👀

2/ Most users only focus on short-term price action.

3/ Infrastructure + liquidity + ecosystem growth matter long term.

4/ Watching closely how ${keyword} evolves this cycle. 🚀

${random(hashtags)} ${random(hashtags)} ${random(accounts)}
`;
}

// ========================
// CONTENT ENGINE
// ========================

async function generateContent() {

  const keyword = random(keywords);

  const mode = random(modes);

  // THREAD MODE
  if (mode === "thread") {
    return await generateThread(keyword);
  }

  const aiTweet =
    await generateAITweet(
      keyword,
      mode
    );

  return buildTweet(aiTweet);
}

// ========================
// SAVE LOGS
// ========================

function saveTweet(tweet) {

  fs.appendFileSync(
    "daily-log.txt",
    `\n[${new Date().toISOString()}]\n${tweet}\n`
  );

  fs.writeFileSync(
    "latest.txt",
    tweet
  );
}

// ========================
// LOGIN TO X
// ========================

async function loginToX() {

  try {

    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL
    );

    console.log(
      "Logged into X ✅"
    );

  } catch (err) {

    console.log(
      "X Login Error:",
      err.message
    );
  }
}

// ========================
// POST TWEET
// ========================

async function postTweet(tweet) {

  try {

    await scraper.sendTweet(tweet);

    console.log(
      "Tweet Posted 🚀"
    );

  } catch (err) {

    console.log(
      "Twitter Post Error:",
      err.message
    );
  }
}

// ========================
// MAIN AGENT
// ========================

async function runAgent() {

  const tweet =
    await generateContent();

  console.log(
    "\n========================"
  );

  console.log(
    "Tipsdeck AI Agent"
  );

  console.log(
    "========================"
  );

  console.log(tweet);

  console.log(
    "========================\n"
  );

  saveTweet(tweet);

  await postTweet(tweet);
}

// ========================
// MAIN LOOP
// ========================

async function loop() {

  // LOGIN FIRST
  await loginToX();

  while (true) {

    await runAgent();

    const delay =
      randomDelay();

    console.log(
      `Sleeping for ${delay} minutes...`
    );

    await new Promise(resolve =>
      setTimeout(
        resolve,
        delay * 60 * 1000
      )
    );
  }
}

// START
loop();
