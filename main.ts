import { configDotenv } from "dotenv";
import { BrowserContext, chromium, Page } from "playwright";
import { apply } from "./application";

configDotenv()

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

const pastDayPosts = () => async (page: Page) => {
  const pastDayXpath = "//label[p/span[text()='Past 24 hours']]";
  await page.click(pastDayXpath);
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
    const everyCard = Array.from(
      document.querySelectorAll(
        ".scaffold-layout__list-container > li > div > div"
      )
    );

    const alreadyApplied = everyCard.filter((ele) => {
      const element = ele.querySelector(
        "ul > li > strong > span"
      ) as HTMLElement;
      return !element?.innerText?.includes("Applied");
    });

    const links = alreadyApplied.map((ele) => {
      // Query for the specific "a" element within each card
      const link = ele.querySelector("div > div:nth-child(2) > div > a");
      return link; // This will be an Element or null if not found
    });
    const validLinks = links.filter((link) => !!link);

    return validLinks.map((ele) => ele.getAttribute("href"));
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

async function test(context: BrowserContext) {
  await apply({ url: `https://www.linkedin.com$}`, context });
}

async function main() {
  const browser = await openBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  let jobsAppliedFor = 0;
  try {
    await page.goto("https://www.linkedin.com/login");

    await login()(page);

    await gotoJobs()(page);

    // Used to test specific applications
    // await test(context);

    await searchForJobs()(page);

    await openFilters()(page);

    await pastDayPosts()(page);

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
        console.log(`Successfully aplied for ${jobsAppliedFor} jobs`);
        try {
          const success = await apply({
            url: `https://www.linkedin.com${url}`,
            context,
          });
          if (success) jobsAppliedFor++;
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
    console.log(`Successfully applied for: ${jobsAppliedFor} jobs total`);
    console.log("Waiting....");
    await page.waitForTimeout(1000000);
    await browser.close();
    console.log("Browser closed!");
  }
}

main().then(() => {
  console.log("All done!");
});
