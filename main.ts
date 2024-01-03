require("dotenv").config();

import { Console } from "console";
import { chromium, Page } from "playwright";
import { apply } from "./application";

async function openBrowser() {
  return await chromium.launch({ headless: false });
}

const gotoJobs = () => async (page: Page) => {
  await page.waitForSelector('[href="https://www.linkedin.com/jobs/?"]');

  await page.goto("https://www.linkedin.com/jobs/");
};

const searchForJobs = () => async (page: Page) => {
  console.log("Navigating to jobs page...");
  const jobTitle = "Software Engineer";
  await page.waitForSelector(
    '[aria-label="Search by title, skill, or company"]'
  );

  await page.fill(
    '[aria-label="Search by title, skill, or company"]',
    jobTitle
  );
  await page.waitForTimeout(1500);
  await page.keyboard.down("Enter");
  console.log("Searching!!");
};

const login = () => async (page: Page) => {
  console.log("Logging in...");
  await page.waitForSelector("#username");
  await page.fill("#username", process.env.EMAIL);
  await page.fill("#password", process.env.PASSWORD);
  await page.click('[aria-label="Sign in"]');
};

const enableRemoteOnly = () => async (page: Page) => {
  console.log("Filtering to remote only roles...");
  await page.click('[for="advanced-filter-workplaceType-2"] > p');
};

const easyApplyOnly = () => async (page: Page) => {
  console.log("Easy apply jobs only...");
  await page.click(
    '[class="search-reusables__advanced-filters-binary-toggle"] > div'
  );
};

const openFilters = () => async (page: Page) => {
  console.log("Easy apply jobs only...");
  await page.click(
    '[aria-label="Show all filters. Clicking this button displays all available filter options."]'
  );
  await page.waitForTimeout(1500);
};

const doesNextPageExist = (pageNumber: number) => async (page: Page) => {
  console.log("Checking if page exists...");
  const exists = await page.$(`//span[text()="${pageNumber}"]`);
  return !!exists;
};

const getValidJobs = () => async (page: Page) => {
  console.log("Grabbing all valid jobs to apply to...");
  const hrefs = await page.evaluate(() => {
    const allElements = document.querySelectorAll(
      ".scaffold-layout__list-container > li > div > div > div > div:nth-child(2) > div > a"
    );
    const filteredAnchors = Array.from(allElements).filter((anchor) => {
      // Check if the parent `li` has the disqualifying structure
      return !anchor.closest("li").querySelector("li > div > ul > li > strong");
    });
    return filteredAnchors.map((ele) => ele.getAttribute("href"));
  });
  console.log(hrefs.length);
  return hrefs;
};

const scrollForLazyLoadedJobs = () => async (page: Page) => {
  console.log("Scrolling...");
  await page.waitForTimeout(3000);
  // Select the element by its class
  const scrollableElement = await page.$(".scaffold-layout__list  > div");

  // Scroll to the bottom of the element (slowly to allow for lazy loading)
  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 8;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 7;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 6;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 5;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 4;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 3;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 2.5;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 2;
  });
  await page.waitForTimeout(1000);

  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 1.5;
  });
  await page.waitForTimeout(1000);
  await scrollableElement.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.waitForTimeout(1000);
};

async function main() {
  const browser = await openBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  let jobsAppliedFor = 0;
  try {
    await page.goto("https://www.linkedin.com/login");

    await login()(page);

    await gotoJobs()(page);

    await searchForJobs()(page);

    await openFilters()(page);

    await enableRemoteOnly()(page);

    await easyApplyOnly()(page);

    // Search
    await page.click(
      '[class="reusable-search-filters-buttons search-reusables__secondary-filters-show-results-button artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]'
    );

    let loop = true;
    let currentPage = 1;

    while (loop) {
      await scrollForLazyLoadedJobs()(page);
      const hrefs = await getValidJobs()(page);

      for (const url of hrefs) {
        try {
          await apply({ url: `https://www.linkedin.com${url}`, context });
          jobsAppliedFor++;
        } catch (e) {
          console.log(
            `Failed to apply for https://www.linkedin.com${url} \n\n${e}`
          );
        }
      }

      const totalPages = await doesNextPageExist(currentPage + 1)(page);
      if (totalPages) {
        currentPage++;
        const button = await page.$(
          `//button[@aria-label='Page ${currentPage}']`
        );
        await button.click();
      } else {
        loop = false;
      }
    }
  } finally {
    console.log(`Successfully applied for: ${jobsAppliedFor} jobs`);
    console.log("Waiting....");
    await page.waitForTimeout(1000000);
    await browser.close();
    console.log("Browser closed!");
  }
}

main().then(() => {
  console.log("All done!");
});
