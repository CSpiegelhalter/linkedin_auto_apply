import { configDotenv } from "dotenv";
import { BrowserContext, chromium, Page } from "playwright";
import { apply } from "./application";

configDotenv();

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
  console.log(`Checking if page ${pageNumber} exists...`);
  const exists = await page.$(`//button[@aria-label='Page ${pageNumber}']`);
  return !!exists;
};

const getValidJobs = () => async (page: Page) => {
  console.log("Grabbing all valid jobs to apply to...");
  try {
    const hrefs = await page.evaluate(() => {
      const avoidCompanies = [
        "CapTech",
        "Jobot",
        "CyberCoders",
        "Crossover",
        "Insight Global",
      ];
      const jobsToAvoid = [
        "C++",
        ".Net",
        "Staff",
        "Clearance",
        ".NET",
        "Maya",
        "Dotnet",
        "Android",
        "Mobile",
        "Machine",
        "Senior",
        "Sr",
        "Principal",
        "Ruby",
        "Oracle",
        'Java ',
        " Java",
        "Platform",
        "DevOps",
        "Devops",
        "Salesforce",
        "C#",
        "Azure",
        "Data",
        "ML",
        "Security",
        "Scientist",
        "Lead"
      ];

      const everyCard = Array.from(
        document.querySelectorAll(
          ".scaffold-layout__list-container > li > div > div"
        )
      );
      console.log("after selector all");

      const alreadyApplied = everyCard.filter((ele) => {
        console.log("in the filter");
        const titleContainer = ele.querySelector("div > div:nth-child(2)");

        console.log("after title");
        const jobTitle = titleContainer?.querySelector(
          "div > a"
        ) as HTMLElement;

        console.log("after actual title -- not container");
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

      console.log(alreadyApplied.length);

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
  } catch (e) {
    console.log(`Could not get valid jobs: ${e}`);
  }
};

const scrollForLazyLoadedJobs = () => async (page: Page) => {
  console.log("Scrolling...");
  await page.waitForTimeout(3000);
  // Select the element by its class
  const scrollableElement = await page.$(".scaffold-layout__list  > div");
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

    await page.waitForTimeout(1000);
  }
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
