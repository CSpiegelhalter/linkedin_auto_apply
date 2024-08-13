import { configDotenv } from "dotenv";
import { BrowserContext, chromium, Page } from "playwright";
import { apply } from "./application";
import { buttons } from "./selectors";
import { urls } from "./constants";
import { initializeBot } from "./init";
import { log } from "./utils";
import {
  easyApplyFilter,
  getValidJobs,
  gotoJobs,
  lastDayPosts,
  login,
  openFilters,
  remoteOnly,
  scrollForLazyLoadedJobs,
  searchForJobs,
} from "./navigation";
import * as constants from "./constants";
import { Bot, BotAction } from "./interfaces";

configDotenv();

const doesNextPageExist = (pageNumber: number) => async (page: Page) => {
  console.log(`Checking if page ${pageNumber} exists...`);
  const exists = await page.$(`//button[@aria-label='Page ${pageNumber}']`);
  return !!exists;
};

async function test(context: BrowserContext) {
  await apply({ url: `https://www.linkedin.com$}`, context });
}

const jobSearch = (): BotAction => async (bot: Bot) => {
  const { click } = bot.actions;

  log("Job Search...");
  await gotoJobs()(bot);
  await searchForJobs(constants.JOB_TITLE)(bot);
  await openFilters()(bot);
  await lastDayPosts()(bot);
  await remoteOnly()(bot);
  await easyApplyFilter()(bot);

  await click({ selector: buttons.SEARCH })(bot);
};

async function main() {
  const bot = await initializeBot();
  const { goto } = bot.actions;

  let jobsAppliedFor = 0;
  try {
    await goto({ url: urls.LOGIN })(bot);

    await login()(bot);

    await jobSearch()(bot);

    let loop = true;
    let currentPage = 1;

    while (loop) {
      await scrollForLazyLoadedJobs()(bot);
      const hrefs = await getValidJobs()(bot);

      for (const url of hrefs) {
        log(`Successfully aplied for ${bot.jobsAppliedFor} jobs`);
        try {
          const success = await apply({
            url: `https://www.linkedin.com${url}`,
            context: bot.context,
          });
          if (success) bot.jobsAppliedFor++;
        } catch (e) {
          console.log(
            `Failed to apply for https://www.linkedin.com${url} \n\n${e}`
          );
        }
      }

      const totalPages = await doesNextPageExist(currentPage + 1)(bot.page);
      if (totalPages) {
        currentPage++;
        const button = await bot.page.$(
          `//button[@aria-label='Page ${currentPage}']`
        );
        await button.click();
      } else {
        loop = false;
      }
    }
  } finally {
    console.log(`Successfully applied for: ${jobsAppliedFor} jobs total`);
    console.log("Waiting....");
    // await page.waitForTimeout(1000000);
    // await browser.close();
    console.log("Browser closed!");
  }
}

main().then(() => {
  console.log("All done!");
});
