import { configDotenv } from "dotenv";
import { BrowserContext, Page } from "playwright";
// import { apply } from "./application";
import { apply } from "./dynamicApp";

import { buttons } from "./selectors";
import { urls } from "./constants";
import { initializeBot } from "./init";
import { log } from "./utils";
import {
  easyApplyFilter,
  getValidJobs,
  gotoJobs,
  jobApplyLoop,
  lastDayPosts,
  login,
  openFilters,
  remoteOnly,
  scrollForLazyLoadedJobs,
  searchForJobs,
} from "./navigation";
import * as constants from "./constants";
import { Bot, BotAction } from "./interfaces";
import { NodeBot } from "./Bot";

configDotenv();

// async function test(context: BrowserContext) {
//   await apply({ url: `https://www.linkedin.com$}`, context });
// }

// TO test
// https://www.linkedin.com/jobs/view/4000545974/?eBP=CwEAAAGRTqVKQuW4uLuJOKhD6b_ieYj-53C8HsUdFngCEzzW-y33gYlmztNUYsJsN68E3EduZL79726BpfbGApAjFg5lw2HKdJWumjk3tfDcKl2o3YMAjV4mpYqM-TGg_r8cBBrXb5_8mmSA6KRmGlMOpG0nGyQyrbnjzZNdF5bD4cPQWC8LTebWiBZxN_MWLecJeAphb-0cWsVaQScCkGWmillHXSlCYz8mEL_R-ORquDCEQ3QxOuXWYQ_uXUMupxCImD77x1PpRllmEdr1bV6-DiOYuvYurWa6GL1GJ8PBKkcZZNP1ny0fakkjINgMFbHEGh-_eIasgJAPQa0Y7utzBBJpjN4SW_85N3jGpXwucVH5g45Rf2r9Xz3hXqKNhuEBcwSdqyV9fvhGnRL-egCbf2IVwS_Mcvbo4UNTLI37sJuzJ9lm1_3-Q7WoU-oBavwiqSIBTvfgRwMe0UXqsokW2On4cwDGQJk&refId=H1Z1SucyQuSm0MSAXk%2FdjQ%3D%3D&trackingId=Op3ELOgGPJUyYP%2B6mkdG4g%3D%3D&trk=flagship3_search_srp_jobs

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

  try {
    await goto({ url: urls.LOGIN })(bot);

    await login()(bot);

    await jobSearch()(bot);

    await jobApplyLoop()(bot);
  } finally {
    log(`Successfully applied for: ${bot.jobsAppliedFor} jobs total`);
    await bot.browser.close();
    log("Browser closed!");
  }
}

process.on("SIGINT", async () => {
  log("Caught interrupt signal (Ctrl + C)");
  const bot = await NodeBot.getInstance();
  log(`Succesfully applied for: ${bot.jobsAppliedFor} jobs total`);
  process.exit();
});

main().then(() => {
  console.log("All done!");
});
