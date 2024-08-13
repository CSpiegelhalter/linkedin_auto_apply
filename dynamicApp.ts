import { Bot, BotAction } from "./interfaces";
import * as constants from "./constants";
import { buttons, input, view } from "./selectors";
import { log } from "./utils";

export const isOnPage =
  (selector: string): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    log(`Checking if on correct page. Xpath: ${selector}`);
    const exists = await bot.page.evaluate(
      (args) => {
        const matchingElement = document.evaluate(
          args.selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        return !!matchingElement;
      },
      { selector }
    );
    return !!exists;
  };

const allXpathsExist =
  ({
    xpaths,
    exists = true,
  }: {
    xpaths: string[];
    exists?: boolean;
  }): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const promises = [];

    for (const path of xpaths) {
      promises.push(isOnPage(path)(bot));
    }

    const results = await Promise.all(promises);

    return results.every((item) => item === exists);
  };

export const apply =
  (url: string): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const { click, waitForTimeout, waitForSelector } = bot.actions;

    const prevPage = bot.page;
    log(`Job posting: ${url} \n`);

    // Opens a new tab to use
    bot.page = await bot.context.newPage();
    await waitForSelector({ selector: view.JOB })(bot);
    await waitForTimeout({ timeout: 2500 })(bot);

    const alreadyApplied = await isOnPage(view.ALREADY_APPLIED)(bot);
    const easyApplyButtonExists = await isOnPage(buttons.EASY_APPLY)(bot);
    if (alreadyApplied || !easyApplyButtonExists) {
      await bot.page.close();
      bot.page = prevPage;
      return false;
    }

    const easyApplyButton = await bot.page.$(buttons.EASY_APPLY);
    const easyApplyButtonId = await easyApplyButton.getAttribute("id");

    await click({ selector: `[id="${easyApplyButtonId}"]` })(bot);
    await waitForSelector({ selector: view.APPLICATION_MODAL })(bot);

    const success = await handleDynamicSteps()(bot);
    await bot.page.close();
    bot.page = prevPage;
    return success;
  };

export const handleDynamicSteps =
  (): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const { click, waitForTimeout, waitForSelector } = bot.actions;

    // This means we failed to fill everything out
    if (bot.retries > 15) {
      bot.retries = 0;
      return false;
    }
    bot.retries++;
    await waitForTimeout({ timeout: 1500 })(bot);

    return true;
  };

export const handleNext =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    const { click, waitForTimeout, waitForSelector } = bot.actions;

    if (await isOnPage(buttons.REVIEW)(bot)) {
      log("On review page...");
      try {
        const reviewButton = await bot.page.$$(buttons.REVIEW);
        await reviewButton[0].click();
      } catch (e) {
        log(`Failed to click review button... ${e}`);
      }
    } else {
      log("Handling next page...");
      try {
        const nextButton = await bot.page.$(buttons.NEXT);
        await nextButton.click();
      } catch (e) {
        log(`Failed to click next button... ${e}`);
      }
    }
    return await handleDynamicSteps()(bot);
  };
