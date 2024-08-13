import { Bot, BotAction } from "./interfaces";
import * as constants from "./constants";
import { buttons, input, view } from "./selectors";
import { getFormattedDate, log } from "./utils";
import { ElementHandle } from "playwright";

const personalInfo = [
  {
    xpath: input.YOUR_NAME,
    value: process.env.FULL_NAME,
    errorMessage: "Could not fill name...",
  },
  {
    xpath: input.DATE,
    value: getFormattedDate(new Date()),
    errorMessage: "Could not fill date...",
  },
  {
    xpath: input.ADDRESS,
    value: process.env.CITY_STATE_COUNTRY,
    errorMessage: "Failed to fill in the city",
  },
];

const selectDropdowns = [
  // This one needs to be first (yes is default, we overwrite after)
  {
    xpath: "select",
    errorMessage: "Failed to fill out YES dropdown",
    values: ["Yes"],
    pop: true,
  },
  {
    xpath: view.CURRENTLY_AN_EMPLOYEE,
    values: ["No"],
    errorMessage: 'Failed to fill "not an employee" dropdown',
  },
  {
    xpath: view.ENVIRONMENT_TYPE,
    values: ["Remote", "Fully remote", "Fully-remote"],
    errorMessage: 'Failed to fill "not an employee" dropdown',
  },
  {
    xpath: view.REQUIRES_SPONSORSHIP,
    errorMessage: "Failed to fill NO dropdowns",
    values: ["No"],
  },
];

const fillInputsArray = [
  {
    xpath: input.RATE,
    errorMessage: "Failed to fill out hourly rate expectations",
    value: constants.HOURLY_RATE,
  },
  {
    xpath: input.PAID,
    errorMessage: "Failed to fill out salary expectations",
    value: constants.SALARY_RATE,
  },
  {
    xpath: input.SALARY,
    errorMessage: "Failed to fill out salary expectations",
    value: constants.SALARY_RATE,
  },
  {
    xpath: input.GOOD_FIT,
    errorMessage: "Failed to fill out good fit input",
    value: "NA", // TODO
  },
  {
    xpath: input.GOOD_FIT_TEXTAREA,
    errorMessage: "Failed to fill out good fit textarea",
    value: "NA", // TODO
  },
  {
    xpath: input.INTERESTED,
    errorMessage: "Failed to fill out interested input",
    value: "NA", // TODO
  },
  {
    xpath: input.REFERRED_BY,
    errorMessage: "Failed to fill out referred by",
    value: "NA",
  },
  {
    xpath: input.START_BY,
    value: getFormattedDate(new Date()),
    errorMessage: "Could not fill start by date...",
  },
  {
    xpath: input.CITY,
    value: process.env.CITY_STATE_COUNTRY,
    errorMessage: "Could not fill my city...",
  },
];

const fillAllInputsById =
  ({
    xpath,
    value,
    errorMessage,
  }: {
    xpath: string;
    value: string;
    errorMessage: string;
  }): BotAction =>
  async (bot: Bot): Promise<void> => {
    const { fill } = bot.actions;
    const findAll = await bot.page.$$(xpath);

    try {
      for (const ele of findAll) {
        const selectId = await ele.getAttribute("id");
        await fill({ selector: `[id="${selectId}"]`, value })(bot);

        // Blur the element
        await bot.page.evaluate(() => {
          const activeElement = document.activeElement;
          if (activeElement && activeElement instanceof HTMLElement) {
            activeElement.blur();
          }
        });
      }
    } catch (e) {
      log(`${errorMessage}: ${e}`);
    }
  };

const isOnPage =
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

const anyXpathExists =
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
    return results.some((item) => item === exists);
  };

const fillAllDropdownsById =
  ({
    xpath,
    values,
    errorMessage,
    pop = false,
  }: {
    xpath: string;
    values: string[];
    errorMessage: string;
    pop?: boolean;
  }): BotAction =>
  async (bot: Bot): Promise<void> => {
    const findAll = await bot.page.$$(xpath);

    if (findAll?.length > 0 && pop) {
      findAll.pop();
    }
    for (const fill of values) {
      try {
        for (const ele of findAll) {
          const selectId = await ele.getAttribute("id");
          await bot.page.selectOption(`[id="${selectId}"]`, fill);
        }
      } catch (e) {
        log(`${errorMessage}: ${e}`);
      }
    }
  };

const clickCheckboxes =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    const checkboxesLength = (await bot.page.$$(buttons.CHECKBOXES)).length;

    try {
      for (let i = 0; i < checkboxesLength; i++) {
        // Have to re-grab the checkboxes because clicking them causes a re-render
        const checkboxes = await bot.page.$$(buttons.CHECKBOXES);
        await checkboxes[i].click();
      }
    } catch (e) {
      log(`Failed to click checkboxes: ${e}`);
    }
  };

const handleYesNo =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    try {
      await bot.page.evaluate(() => {
        function answerYesOrNo(question: string): string {
          question = question.toLowerCase();
          if (question.includes("worked for")) {
            return "No";
          } else if (question.includes("related to")) {
            return "No";
          } else if (question.includes("experience")) {
            return "Yes";
          } else if (question.includes("reside")) {
            return "Yes";
          } else if (question.includes("authorized")) {
            return "Yes";
          } else if (question.includes("sponsorship")) {
            return "No";
          } else if (question.includes("currently an")) {
            return "No";
          } else if (question.includes("currently work")) {
            return "No";
          } else if (question.includes("accommodation")) {
            return "Yes";
          } else if (question.includes("agree")) {
            return "Yes";
          } else if (question.includes("older")) {
            return "Yes";
          } else if (question.includes("willing")) {
            return "Yes";
          } else if (question.includes("working")) {
            return "No";
          } else if (question.includes("eligible")) {
            return "Yes";
          } else if (
            question.includes("Degree") ||
            question.includes("degree")
          ) {
            return "No";
          } else if (question.includes("clearance")) {
            return "No";
          } else {
            return "Yes";
          }
        }

        function convert(yesNo) {
          if (yesNo === "Yes") return 1;
          return 0;
        }

        const forms = Array.from(document.querySelectorAll("fieldset"));
        const yesNoForms = forms.filter((form) =>
          form.querySelector('div > [type="radio"]')
        );

        for (const form of yesNoForms) {
          const questionElement = form.querySelector(
            "legend > span > span"
          ) as HTMLElement;
          const question = questionElement?.innerText;
          const answer = answerYesOrNo(question);
          const radioButtons = Array.from(form.querySelectorAll("div"));
          for (const button of radioButtons) {
            const inputElement = button.querySelector(
              `input[value="${answer}"]`
            );
            if (!!inputElement) {
              const clickableLabel = button.querySelector("label");
              clickableLabel.click();
            } else {
              const inputElement = button.querySelector(
                `input[value="${convert(answer)}"]`
              );
              if (!!inputElement) {
                const clickableLabel = button.querySelector("label");
                clickableLabel.click();
              }
            }
          }
        }
      });
    } catch (e) {
      log(`Failed to fill yes or no radios: ${e}`);
    }
  };

const hearAboutUs =
  (element: ElementHandle<SVGElement | HTMLElement>): BotAction =>
  async (bot: Bot): Promise<void> => {
    try {
      const values = await element.evaluate((select) => {
        // Ensure the element is a select element
        if (select instanceof HTMLSelectElement) {
          return Array.from(select.options).map((option) => option.value);
        }
      });

      const linkedIn = values.findIndex((element) =>
        element.includes("LinkedIn")
      );
      const indeed = values.findIndex((element) => element.includes("Indeed"));
      const other = values.findIndex((element) => element.includes("Other"));

      if (linkedIn > -1) {
        element.selectOption(values[linkedIn]);
      } else if (indeed) {
        element.selectOption(values[indeed]);
      } else {
        element.selectOption(values[other]);
      }
    } catch (e) {
      console.log(`Failed to tell them how we hear about them... ${e}`);
    }
  };
const handleAdditionalQuestions =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    log("Filling additional questions...");
    await fillAllInputsById({
      xpath: input.YEARS_EXPERIENCE,
      value: constants.YEARS_EXPERIENCE,
      errorMessage: "Failed to fill out years experience questions",
    })(bot);

    for (const fill of selectDropdowns) {
      await fillAllDropdownsById(fill)(bot);
    }

    const learnAbout = await bot.page.$(view.HOW_DID_YOU_LEARN_ABOUT);
    const hearAboutUsSelect = await bot.page.$(view.HOW_DID_YOU_HEAR_ABOUT);

    if (hearAboutUsSelect || learnAbout) {
      const toSelect = hearAboutUsSelect ? hearAboutUsSelect : learnAbout;
      await hearAboutUs(toSelect)(bot);
    }

    for (const fill of fillInputsArray) {
      await fillAllInputsById(fill)(bot);
    }

    await clickCheckboxes()(bot);

    await handleYesNo()(bot);
  };

export const apply =
  (url: string): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const { click, waitForTimeout, waitForSelector, goto } = bot.actions;

    const prevPage = bot.page;
    log(`Job posting: ${url} \n`);

    // Opens a new tab to use
    bot.page = await bot.context.newPage();
    await goto({ url })(bot);
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

    if (await isOnPage(buttons.SUBMIT)(bot)) {
      log("Application submitted!");
      await click({ selector: buttons.SUBMIT })(bot);
      await waitForTimeout({ timeout: 1000 })(bot);
      log(`Number of resets: ${bot.retries}`);
      bot.retries = 0;
      return true;
    }

    // This means we failed to fill everything out
    if (bot.retries > 15) {
      bot.retries = 0;
      return false;
    }
    bot.retries++;
    await waitForTimeout({ timeout: 1500 })(bot);

    const contactInfoPage = await allXpathsExist({
      xpaths: [view.CONTACT_INFO, view.PROFILE_PIC],
    })(bot);

    const skipPages = await anyXpathExists({
      xpaths: [view.DIVERSITY_PAGE, view.RESUME_PAGE, view.WORK_AUTH_PAGE],
    })(bot);

    if (contactInfoPage || skipPages) {
      log("Resume, contact, diversity, or work auth page...");
      return await handleNext()(bot);
    }

    for (const info of personalInfo) {
      await fillAllInputsById(info)(bot);
    }

    if (await isOnPage(view.ADDITIONAL_QUESTIONS)(bot)) {
      await handleAdditionalQuestions()(bot);
    }

    return await handleNext()(bot);
  };

export const handleNext =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
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
