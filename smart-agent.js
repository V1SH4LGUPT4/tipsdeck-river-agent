const fs = require("fs");
const cron = require("node-cron");

const keywords = [
  "River",
  "satUSD",
  "River staking",
  "River governance",
  "River ecosystem",
  "Hyperliquid",
  "Base ecosystem",
  "chain abstraction",
  "cross-chain liquidity",
  "onchain stablecoins",
  "River Season 5",
  "DeFi infrastructure",
  "omnichain DeFi",
  "streaming liquidity",
  "yield infrastructure"
];

const shortStyles = [
  "{k} feels massively underrated right now.",
  "Watching smart builders move into {k}.",
  "Feels like we're still early to {k}.",
  "Most people are sleeping on what’s happening around {k}.",
  "Strong communities are forming around {k}.",
  "There’s real momentum building around {k}.",
  "Builders focusing on {k} seem very early.",
  "The ecosystem growth around {k} looks organic."
];

const questions = [
  "Anyone else watching {k} closely lately?",
  "What’s your biggest thesis around {k}?",
  "Do you think {k} becomes a major narrative this cycle?",
  "Still surprised more people aren’t talking about {k}.",
  "Bullish on where {k} could go from here."
];

const bullishStyles = [
  "{k} could become one of the strongest narratives this cycle.",
  "The upside around {k} still feels underestimated.",
  "Smart money seems to be paying attention to {k}.",
  "Feels like {k} is quietly gaining momentum.",
  "Very interested to see how fast {k} grows from here."
];

const analyticalStyles = [
  "{k} is becoming more interesting from an infrastructure perspective.",
  "The ecosystem expansion around {k} has been steady lately.",
  "Liquidity and adoption around {k} continue improving.",
  "Interesting to watch how builders are approaching {k}.",
  "The long-term positioning around {k} looks thoughtful."
];

const educationalStyles = [
  "{k} is worth researching if you're interested in long-term crypto infrastructure.",
  "A lot of people still misunderstand how {k} works.",
  "The mechanics behind {k} are actually pretty interesting.",
  "{k} is more than just short-term hype.",
  "Understanding {k} takes more than just watching price charts."
];

const hashtags = [
  "#River",
  "#DeFi",
  "#Base",
  "#Hyperliquid",
  "#Crypto",
  "#Web3",
  "#Yield",
  "#Onchain"
];

const tags = [
  "@RiverdotInc",
  "@River4fun",
  "@base",
  "@HyperliquidX"
];

const emojis = [
  "🔥",
  "👀",
  "🚀",
  "🌊",
  "⚡",
  "📈",
  "💧",
  "🛠️",
  "🧠"
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSingleTweet() {
  const keyword = random(keywords);

  const allStyles = [
    ...shortStyles,
    ...questions,
    ...bullishStyles,
    ...analyticalStyles,
    ...educationalStyles
  ];

  const style = random(allStyles);

  const emoji = random(emojis);

  const useTag = Math.random() < 0.35;

  let tweet =
    style.replace("{k}", keyword) +
    " " +
    emoji +
    " " +
    random(hashtags) +
    " " +
    random(hashtags);

  if (useTag) {
    tweet += " " + random(tags);
  }

  return tweet;
}

function generateThread() {
  const keyword = random(keywords);

  return `
1/ Feels like we're still early to ${keyword}. 👀

2/ Most users focus only on short-term price action.

3/ But infrastructure, liquidity, and ecosystem growth usually matter more long term.

4/ Watching closely to see how ${keyword} evolves this cycle. 🚀

${random(hashtags)} ${random(hashtags)}
`;
}

function generateContent() {
  const chance = Math.random();

  if (chance < 0.25) {
    return generateThread();
  }

  return generateSingleTweet();
}

function isDuplicate(content) {
  if (!fs.existsSync("history.json")) {
    return false;
  }

  const history = JSON.parse(fs.readFileSync("history.json"));

  return history.some(item => item.content === content);
}

function saveContent(content) {
  let history = [];

  if (fs.existsSync("history.json")) {
    history = JSON.parse(fs.readFileSync("history.json"));
  }

  history.push({
    content,
    time: new Date().toISOString()
  });

  fs.writeFileSync(
    "history.json",
    JSON.stringify(history, null, 2)
  );
}

function saveDailyLog(content) {
  const log =
    `[${new Date().toLocaleString()}]\n` +
    content +
    "\n\n";

  fs.appendFileSync("daily-log.txt", log);
}

function runAgent() {
  let content;

  do {
    content = generateContent();
  } while (isDuplicate(content));

  console.log("\n========================");
  console.log("Tipsdeck River Agent");
  console.log("========================");
  console.log(content);
  console.log("========================\n");

  saveContent(content);
  saveDailyLog(content);
}

runAgent();

cron.schedule("*/30 * * * *", () => {
  runAgent();
});
