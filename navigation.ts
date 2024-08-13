import { Bot, BotAction } from "./interfaces";
import { log } from "./utils";
import { buttons, input, view } from "./selectors";
import * as constants from "./constants";

export const login = (): BotAction => async (bot: Bot) => {
  const { waitForSelector, fill, click } = bot.actions;

  log("Logging in...");
  await waitForSelector({ selector: input.USERNAME })(bot);
  await fill({ selector: input.USERNAME, value: process.env.EMAIL })(bot);
  await fill({ selector: input.PASSWORD, value: process.env.PASSWORD })(bot);
  await click({ selector: buttons.SIGNIN })(bot);
};

export const gotoJobs = (): BotAction => async (bot: Bot) => {
  const { waitForSelector, goto } = bot.actions;

  log("Navigating to job page...");
  await waitForSelector({ selector: view.JOBS_ICON })(bot);
  await goto({ url: constants.urls.JOBS })(bot);
};

export const searchForJobs =
  (jobTitle: string): BotAction =>
  async (bot: Bot) => {
    const { waitForSelector, waitForTimeout, fill } = bot.actions;

    log(`Searching for ${jobTitle} jobs...`);
    await waitForSelector({ selector: input.JOB_SEARCH })(bot);
    await fill({ selector: input.JOB_SEARCH, value: jobTitle })(bot);

    await waitForTimeout({ timeout: 1500 })(bot);
    await bot.page.keyboard.down("Enter");
    log("Searching!!");
  };

export const openFilters = (): BotAction => async (bot: Bot) => {
  const { click, waitForTimeout } = bot.actions;

  log("Opening filters...");
  await click({ selector: buttons.FILTERS })(bot);
  await waitForTimeout({ timeout: 1500 })(bot);
};

export const lastDayPosts = (): BotAction => async (bot: Bot) => {
  const { click, waitForTimeout } = bot.actions;

  log("Jobs posted within the last 24 hours...");
  await click({ selector: buttons.LAST_DAY_FILTER })(bot);
  await waitForTimeout({ timeout: 500 })(bot);
};

export const remoteOnly = (): BotAction => async (bot: Bot) => {
  const { click, waitForTimeout } = bot.actions;

  if (!constants.REMOTE_ONLY) return;

  log("Only remote roles...");
  await click({ selector: buttons.REMOTE_ONLY_FILTER })(bot);
  await waitForTimeout({ timeout: 500 })(bot);
};

export const easyApplyFilter = (): BotAction => async (bot: Bot) => {
  const { click, waitForTimeout } = bot.actions;

  log("Easy apply jobs only...");
  await click({ selector: buttons.EASY_APPLY })(bot);
  await waitForTimeout({ timeout: 1500 })(bot);
};

export const scrollForLazyLoadedJobs = (): BotAction => async (bot: Bot) => {
  const { waitForTimeout } = bot.actions;

  log("Scrolling...");
  await waitForTimeout({ timeout: 3000 })(bot);

  const scrollableElement = await bot.page.$(view.SCROLLABLE_PAGE);
  const pageIndices = [8, 7, 6, 5, 4, 3, 2.5, 2, 1.75, 1.5, 1.25, 1];

  for (const i of pageIndices) {
    // Scroll to the bottom of the element (slowly to allow for lazy loading)
    await scrollableElement.evaluate(
      (element, args) => {
        const i = args.i;
        const scroll =
          i === 1 ? element.scrollHeight : element.scrollHeight / i;
        element.scrollTop = scroll;
      },
      { i }
    );

    await waitForTimeout({ timeout: 1000 })(bot);
  }
};

export const getValidJobs = (): BotAction => async (bot: Bot) => {
  log("Grabbing all valid jobs to apply to...");
  try {
    const hrefs = await bot.page.evaluate(
      (args) => {
        const { jobsToAvoid, avoidCompanies } = args;
        const everyCard = Array.from(
          document.querySelectorAll(
            ".scaffold-layout__list-container > li > div > div"
          )
        );

        // Don't grab ones we already applied to
        const alreadyApplied = everyCard.filter((ele) => {
          const titleContainer = ele.querySelector("div > div:nth-child(2)");

          const jobTitle = titleContainer?.querySelector(
            "div > a"
          ) as HTMLElement;

          const company = titleContainer?.querySelector(
            "div:nth-child(2)"
          ) as HTMLElement;

          const companyText = company?.innerText?.trim();
          const jobTitleText = jobTitle?.innerText?.trim();

          console.log(companyText);
          console.log(jobTitleText);
          const element = ele.querySelector(
            "ul > li > strong > span"
          ) as HTMLElement;
          return (
            !element?.innerText?.includes("Applied") &&
            !avoidCompanies.includes(companyText) &&
            !jobsToAvoid.some((word) =>
              jobTitleText?.toLowerCase()?.includes(word.toLowerCase())
            )
          );
        });

        const links = alreadyApplied.map((ele) => {
          // Query for the specific "a" element within each card
          const link = ele.querySelector("div > div:nth-child(2) > div > a");
          return link; // This will be an Element or null if not found
        });
        const validLinks = links.filter((link) => !!link);

        return validLinks.map((ele) => ele.getAttribute("href"));
      },
      {
        jobsToAvoid: constants.JOB_KEYWORDS_TO_AVOID,
        avoidCompanies: constants.COMPANIES_TO_AVOID,
      }
    );
    log(`Found ${hrefs.length} valid jobs to apply for!`);
    return hrefs;
  } catch (e) {
    console.log(`Could not get valid jobs: ${e}`);
  }
};
