import { chromium } from "playwright";

async function openBrowser() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.google.com");
}

async function main() {
    const page = await openBrowser()
}

main().then(() => {
  console.log("All done!");
});
