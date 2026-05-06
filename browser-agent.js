const puppeteer = require("puppeteer-core");

(async () => {

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/usr/bin/chromium",

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const page = await browser.newPage();

  await page.goto("https://x.com");

  console.log("Browser Working ✅");

  await browser.screenshot({
    path: "test.png"
  });

  await browser.close();

})();
