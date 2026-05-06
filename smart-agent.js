require("dotenv").config();

const fs = require("fs");
const axios = require("axios");

const {
  Scraper
} = require("agent-twitter-client");

// ========================
// SCRAPER
// ========================

const scraper = new Scraper();

// ========================
// COOKIE AUTH
// ========================

async function setupTwitterSession() {

  try {

    await scraper.setCookies([
      `auth_token=${process.env.TWITTER_AUTH_TOKEN}`,
      `ct0=${process.env.TWITTER_CT0}`
    ]);

    console.log(
      "X Cookie Session Loaded ✅"
    );

  } catch (err) {

    console.log(
      "Cookie Session Error:",
      err
    );
  }
}

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
// FALLBACK TEMPLATES
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

  return arr[
    Math.floor(
      Math.random() * arr.length
    )
  ];
}

// ========================
// SLOW SAFE DELAY
// ========================

function randomDelay() {

  // 3 HOURS TO 7 HOURS

  const min = 180;
  const max = 420;

  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

// ========================
// BUILD TWEET
// ========================

function buildTweet(text) {

  let tweet =
    text +
    " " +
    random(emojis) +
    " " +
    random(hashtags);

  // 50% chance to tag account

  if (Math.random() > 0.5) {

    tweet +=
      " " +
      random(accounts);
  }

  return tweet.slice(0, 280);
}

// ========================
// GEMINI AI
// ========================

async function generateAITweet(
  keyword,
  mode
) {

  try {

    const prompt = `
Generate a natural human crypto Twitter/X post.

Topic: ${keyword}

Mode: ${mode}

Rules:
- Human-like
- Smart
- Natural
- No hype spam
- Max 180 chars
- No markdown
- No emojis inside text
`;

    const response =
      await axios.post(
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

    return response.data
      .candidates[0]
      .content.parts[0]
      .text;

  } catch (err) {

    console.log(
      "Gemini Error:",
      err.message
    );

    return random(
      fallbackStyles
    ).replace("{k}", keyword);
  }
}

// ========================
// THREAD MODE
// ========================

async function generateThread(
  keyword
) {

  return `
1/ Feels like we're still early to ${keyword}.

2/ Most users only focus on short-term price action.

3/ Infrastructure + liquidity + ecosystem growth matter long term.

4/ Watching closely how ${keyword} evolves this cycle.

${random(hashtags)}
`;
}

// ========================
// CONTENT ENGINE
// ========================

async function generateContent() {

  const keyword =
    random(keywords);

  const mode =
    random(modes);

  // LOW THREAD USAGE

  if (
    mode === "thread" &&
    Math.random() > 0.7
  ) {

    return await generateThread(
      keyword
    );
  }

  const aiTweet =
    await generateAITweet(
      keyword,
      mode
    );

  return buildTweet(
    aiTweet
  );
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
// POST TO X
// ========================

async function postTweet(tweet) {

  try {

    await scraper.sendTweet(
      tweet
    );

    console.log(
      "Tweet Posted 🚀"
    );

  } catch (err) {

    console.log(
      "Twitter Post Error:"
    );

    console.log(err);
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
// LOOP
// ========================

async function loop() {

  await setupTwitterSession();

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
