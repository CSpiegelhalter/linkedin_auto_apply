import { Browser, BrowserContext, Page } from "playwright";
import { createCoverletter } from "./coverletter";
import { createPdf } from "./pdf";

type Apply = {
  url: string;
  context: BrowserContext;
};

const closePage = async (page: Page) => {
  await page.close();
};

const isOnPage = async (page: Page, xpath: string): Promise<boolean> => {
  const exists = await page.evaluate(
    (args) => {
      const matchingElement = document.evaluate(
        args.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      return !!matchingElement;
    },
    { xpath }
  );
  return !!exists;
};

export const apply = async ({ url, context }: Apply) => {
  const page = await context.newPage();
  const hardCoded =
    "https://www.linkedin.com/jobs/view/3777165579/?eBP=CwEAAAGMx5igqex1DUMhy1iH2w3bHa-lv7PjD0mbiUy53bz9Dh49Dl7d8MbQRyaiNLGwAwEmXpY2zjy8KmmfCtl8vOCOxALOCavV2L2s4ur6RaYOBlPDTLMI9dsGQrDQLZiiyVfeNZTwReVCewIIwzr3rfvhf53kbYG5PmWJR3HvCyBRr1WzbwwI4RKsRendoAFp7B4lanl6s95rl-vaejGSCuZ3BpBXO41f6EgeuRoPmT_DzRbN76kK6CPSBUfvBOZJmg2ho9gVqIglXbKi4Pe62oKDKT521_-jxGqPaCYqM59yWGR_Mwx853OCoQ3KovKoqfCkbpA3eiiJ6cjFhZwzjNyWgovihIEM38uLFT9teQVJPVGJUm4L_uDkaVRghB5gABPpOD0&refId=e0zw1tjGlFOM%2FTaVaKNP6g%3D%3D&trackingId=l4CGE5HwD%2FsTp5ab3ST8aA%3D%3D&trk=flagship3_search_srp_jobs";
  await page.goto(url);

  console.log(`Job posting: ${url}`);

  await page.waitForSelector('[class="app-aware-link "]');

  const alreadyAppliedNoticeXpath =
    "//span[contains(., 'Application submitted')]";
  const alreadyApplied = await isOnPage(page, alreadyAppliedNoticeXpath);

  if (alreadyApplied) {
    await closePage(page);
    return;
  }

  const easyApplyXpath =
    "//*[contains(@aria-label, 'Easy Apply') and not(contains(@aria-label, '{:companyName}'))]";
  const easyApplyButtonExists = await isOnPage(page, easyApplyXpath);

  if (!easyApplyButtonExists) {
    await closePage(page);
    return;
  }

  const description = await page.evaluate(() => {
    let description = "";
    const block = document.querySelector("#job-details > span");
    const children = Array.from(block?.children);

    for (const child of children) {
      const text = child as HTMLElement;
      description += text.innerText;
      description += "\n";
    }
    return description;
  });

  await page.waitForTimeout(1500);

  const buttonId = await getAttributeFromXpath({
    page,
    attribute: "id",
    xpath: easyApplyXpath,
  });
  await page.click(`[id="${buttonId}"]`);

  await page.waitForSelector('[aria-labelledby="jobs-apply-header"]');

  await handleDynamicSteps(page, description);
  await closePage(page)
};

const getAttributeFromXpath = async ({ page, attribute, xpath }) => {
  const element = await page.$(xpath);
  const foundAttribute = await element.getAttribute(attribute);
  return foundAttribute;
};

const findAllXpaths = async (xpaths: string[], page) => {
  const promises = [];

  for (const path of xpaths) {
    promises.push(isOnPage(page, path));
  }

  const results = await Promise.all(promises);

  return results.every((item) => item === true);
};

let count = 0;
const handleDynamicSteps = async (page: Page, description: string) => {
  count++;
  await page.waitForTimeout(1500);
  // Submit application
  const submitButtonXpath = "//button[@aria-label='Submit application']";

  const submitApplicationPage = await findAllXpaths([submitButtonXpath], page);

  if (submitApplicationPage) {
    console.log("Submitted application!");
    await page.click(submitButtonXpath);
    await page.waitForTimeout(1500);
    console.log(`Number of resets: ${count}`);
    count = 0;
    return;
  }
  // For contact page
  const contactInfoXpath = "//h3[text()='Contact info']";
  const profilePic = `//img[@title='${process.env.FULL_NAME}']`;

  // For resume page
  const resumePageXpath =
    "//*[@aria-label='Upload resume button. Only, DOC, DOCX, PDF formats are supported. Max file size is (2 MB).']";

  // Need to test on "Additional Questions" as well
  const additionalQuestionsXpath = "//form//h3[contains(., 'Additional')]";

  const diversityQuestionsXpath = "//form//h3[contains(., 'Diversity')]";

  const reviewButtonXpath =
    '//form//button[@aria-label="Review your application"]';

  const coverLetterButtonXpath =
    '//*[@aria-label="Upload resume button. Only, DOC, DOCX, PDF formats are supported. Max file size is (512 KB)."]';

  const contactInfoPage = await findAllXpaths(
    [contactInfoXpath, profilePic],
    page
  );

  const coverLetterOnPage = await findAllXpaths([coverLetterButtonXpath], page);
  const pageBeforeReview = await findAllXpaths([reviewButtonXpath], page);

  async function handleNext() {
    if (pageBeforeReview) {
      console.log("On review page...");
      try {
        const reviewButton = await page.$$(reviewButtonXpath);
        await reviewButton[0].click();
      } catch (e) {
        console.log(`Failed to click review button... ${e}`);
      }
    } else {
      console.log("Handling next page...");
      try {
        const nextButton = await page.$(
          '//form//button[@aria-label="Continue to next step"]'
        );
        await nextButton.click();
      } catch (e) {
        console.log(`Failed to click next button... ${e}`);
      }
    }
    return await handleDynamicSteps(page, description);
  }

  if (coverLetterOnPage) {
    console.log("Cover letter page...");
    const coverLetterMessage = await createCoverletter(description);

    if (coverLetterMessage) {
      createPdf(coverLetterMessage);
      const coverletterButton =
        '[aria-label="Upload resume button. Only, DOC, DOCX, PDF formats are supported. Max file size is (512 KB)."]';

      const pdfFilePath = "./coverletter.pdf";

      await page.setInputFiles(coverletterButton, pdfFilePath);

      return await handleNext();
    }
  }

  const diversityPage = await findAllXpaths([diversityQuestionsXpath], page);
  const resumePage = await findAllXpaths([resumePageXpath], page);

  if (resumePage || contactInfoPage || diversityPage) {
    console.log("Resume or contact or diversity page...");
    return await handleNext();
  }

  const additionalQuestionsPage = await findAllXpaths(
    [additionalQuestionsXpath],
    page
  );

  if (additionalQuestionsPage) {
    console.log("Question page...");
    // XPath to select inputs with a parent label that includes "How many years"
    const inputsXPath = "//form//input[not(@type='checkbox')]";

    // Find all matching inputs
    const inputs = await page.$$(inputsXPath);

    let dropdowns = await page.$$("select");

    // There is always a hidden dropdown that lets you select the language on the page
    dropdowns.pop();

    try {
      for (const input of inputs) {
        // Fill each input with the number 3
        const inputId = await input.getAttribute("id");
        await page.fill(`[id="${inputId}"]`, "3");
      }
    } catch (e) {
      console.log("====================================");
      console.log(`Failed to fill out years experience question: ${e}`);
      console.log("====================================");
    }

    try {
      for (const drop of dropdowns) {
        const selectId = await drop.getAttribute("id");
        await page.selectOption(`[id="${selectId}"]`, "Yes");
      }
    } catch (e) {
      console.log("====================================");
      console.log(`Failed to fill out YES dropdown: ${e}`);
      console.log("====================================");
    }

    const noDropdownsXpath =
      "//select[preceding-sibling::label[.//span[contains(text(), 'require sponsorship')]]]";

    const noDropdowns = await page.$$(noDropdownsXpath);

    try {
      for (const drop of noDropdowns) {
        const selectId = await drop.getAttribute("id");
        await page.selectOption(`[id="${selectId}"]`, "No");
      }
    } catch (e) {
      console.log("====================================");
      console.log(`Failed to fill NO dropdowns: ${e}`);
      console.log("====================================");
    }

    const checkboxesXpath =
      "//form//label[following-sibling::input[@type='checkbox'] | preceding-sibling::input[@type='checkbox']]";

    const checkboxesLength = (await page.$$(checkboxesXpath)).length;

    try {
      for (let i = 0; i < checkboxesLength; i++) {
        // Have to re-grab the checkboxes because clicking them causes a re-render
        const checkboxes = await page.$$(checkboxesXpath);
        await checkboxes[i].click();
      }
    } catch (e) {
      console.log("====================================");
      console.log(`Failed to click checkboxes: ${e}`);
      console.log("====================================");
    }

    return await handleNext();
  }

  // Try to go to next page
  return await handleNext();
};
