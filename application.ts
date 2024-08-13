import { Browser, BrowserContext, Page } from "playwright";
import { createCoverletter, createShortDescription } from "./coverletter";
import { createPdf } from "./pdf";

type Apply = {
  url: string;
  context: BrowserContext;
};

interface FillAllDropdowns {
  xpath: string;
  fillValues: string[];
  errorMessage: string;
  pop?: boolean;
}

interface FillAllDropdownsFunction extends FillAllDropdowns {
  page: Page;
}

interface FillAllInputs {
  xpath: string;
  fillValue: string;
  errorMessage: string;
}

interface FillAllInputsFunction extends FillAllInputs {
  page: Page;
}

let coverLetterMessage: string;
let shortDescription: string;

const closePage = async (page: Page) => {
  await page.close();
};

const isOnPage = async (page: Page, xpath: string): Promise<boolean> => {
  console.log(`Checking if on correct page. Xpath: ${xpath}`);
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

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
}

export const apply = async ({ url, context }: Apply): Promise<boolean> => {
  const page = await context.newPage();

  const testUrl =
    "https://www.linkedin.com/jobs/view/3726600309/?eBP=CwEAAAGM1rc0ekFbGcYy_oioTMg8DbW4XPaPVUqp4sNJ1UqAo9SBQ_G2463eAVZVqomDVe_rkKP_cJWQaUSrAjB8XbvBnCtGmd2GRuG8Khn0tFCr6Wf7t4ByEa2BUvrVf8Ajepa30iLG655-EUVjRGPkLl_xWrWoq2JAJxJ8drW2CPA5iY-pFAcL8MrZEvSauwvGUaMxS_VjZqy8_0rHomSFMe-qMVPQjEBLui_uhVhyYgKfTHBUnQTiOb0dPKmCr2vPz0ZCqcXlR9E0XcuNQC66LkTaNTQrOwYZkCwg1D22QDtztuAPb6NanzPsVc8oVgTW10b7C8K-4X9-_UxgnYB7tmK28uIZQGdPfzx08h86j0_az0_jilW-qojLmPTvHgieOeTnPgY&refId=48l6bUxB67OuuXGbem4TkA%3D%3D&trackingId=hpB9H3QWNQlplsS9IpSe2g%3D%3D&trk=flagship3_search_srp_jobs";
  const hardCoded =
    "https://www.linkedin.com/jobs/view/3784801818/?eBP=CwEAAAGM1rAKNIw8AW_wZAQ6CKfiG3aIDrkd5CcPOVYDqa8EGVVONNnTNsoiUIQTePKEiQ3KkNadHh9bnNarY0zTZ08PRrS2evXYfVSQastgz0zeX42c1UZ9i4m_OISct9vT8ApfQAlTwi4dQ1JTefBtpxoKY7GU7qvbWKL1fBk8DY5dmfuA-9MjcPr6ZNni0Hm9ZBh-AtITlBwZTt0ZFKjYWIDk3p9GjnkxcTP7xfpy-KS7D4w6bswOajHUf71lFb2RpEKnODN21gqWxXhUARFzeN4hWQ-mR3UStBc3CGkKuhhv4n5rPc7QMl-TNFN4U8wQgw2G9XymU6jRbASiusdEseq0_pQ0mxDGQzKhSdfDNZBPyEAqlQrxeSE56xuqDXxbMZVkgqZIvHhczh8&refId=t%2Ftu%2FFPn993UEkik%2BxzM0g%3D%3D&trackingId=wftMuY2De3Gf51%2Fkvh3Glw%3D%3D&trk=flagship3_search_srp_jobs";
  await page.goto(url);

  console.log(`Job posting: ${url} \n`);

  await page.waitForSelector('[class="app-aware-link "]');
  await page.waitForTimeout(2500);

  const alreadyAppliedNoticeXpath =
    "//span[contains(., 'Application submitted')]";
  const alreadyApplied = await isOnPage(page, alreadyAppliedNoticeXpath);

  if (alreadyApplied) {
    await closePage(page);
    return false;
  }

  const easyApplyXpath =
    "//*[contains(@aria-label, 'Easy Apply') and not(contains(@aria-label, '{:companyName}'))]";
  const easyApplyButtonExists = await isOnPage(page, easyApplyXpath);

  if (!easyApplyButtonExists) {
    await closePage(page);
    return false;
  }

  console.log("Getting description...");

  let description: string;
  try {
    description = await page.evaluate(() => {
      let description = "";
      const block = document.querySelector("#job-details > div");
      const children = Array.from(block?.children);

      for (const child of children) {
        const text = child as HTMLElement;
        description += text.innerText;
        description += "\n";
      }
      return description;
    });
  } catch {
    console.log("Failed to get descsription...");
  }

  console.log(description)


  await page.waitForTimeout(1500);

  const buttonId = await getAttributeFromXpath({
    page,
    attribute: "id",
    xpath: easyApplyXpath,
  });
  await page.click(`[id="${buttonId}"]`);

  await page.waitForSelector('[aria-labelledby="jobs-apply-header"]');

  const success = await handleDynamicSteps(page, description);
  await closePage(page);
  return success;
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
const handleDynamicSteps = async (
  page: Page,
  description: string
): Promise<boolean> => {
  if (count > 15) {
    count = 0;
    return false;
  }
  count++;
  console.log(`Count: ${count}`);
  await page.waitForTimeout(1500);

  // case insensitive
  const yourNameXpath =
    "//input[preceding-sibling::label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'signature')] | following-sibling::label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'signature')]]";

  const dateXpath = "//input[@placeholder='mm/dd/yyyy']";

  const yourNameInput = await page.$(yourNameXpath);
  if (dateXpath) {
    await fillAllInputsById({
      page,
      xpath: dateXpath,
      fillValue: getFormattedDate(new Date()),
      errorMessage: "Could not fill date...",
    });
  }
  if (yourNameInput) {
    await fillAllInputsById({
      page,
      xpath: yourNameXpath,
      fillValue: "Curt Spiegelhalter",
      errorMessage: "Could not fill name...",
    });
  }
  // Submit application
  const submitButtonXpath = "//button[@aria-label='Submit application']";

  const submitApplicationPage = await findAllXpaths([submitButtonXpath], page);

  if (submitApplicationPage) {
    console.log("Submitted application!");
    await page.click(submitButtonXpath);
    await page.waitForTimeout(1000);
    console.log(`Number of resets: ${count}`);
    count = 0;
    return true;
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

  const workAuthPageXpath = "//form//h3[contains(., 'authorization')]";

  const addressXpath = "//form//h3[contains(., 'address')]";
  const addressPage = await findAllXpaths([addressXpath], page);

  const cityInputXpath =
    "//form//label[.//span[contains(text(), 'City')]]/following-sibling::div/input";
  if (addressPage) {
    await fillAllInputsById({
      page,
      xpath: cityInputXpath,
      errorMessage: "Failed to fill in the city",
      fillValue: "Los Angeles, California, United States",
    });
  }

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

  if (coverLetterOnPage && description) {
    console.log("Cover letter page...");
    coverLetterMessage = await createCoverletter(description);

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
  const workAuthPage = await findAllXpaths([workAuthPageXpath], page);

  if (resumePage || contactInfoPage || diversityPage || workAuthPage) {
    console.log("Resume, contact, diversity, or work auth page...");
    return await handleNext();
  }

  const additionalQuestionsPage = await findAllXpaths(
    [additionalQuestionsXpath],
    page
  );

  if (additionalQuestionsPage) {
    console.log("Question page...");
    // XPath to select inputs with a parent label that includes "How many years"
    const inputsXPath =
      "//form//input[not(@type='checkbox') and not(@type='radio')]";

    // Fill years experience inputs
    await fillAllInputsById({
      page,
      xpath: inputsXPath,
      errorMessage: "Failed to fill out years experience questions",
      fillValue: "4",
    });

    const currentlyAnEmployeeXpath =
      "//select[preceding-sibling::label[.//span[contains(text(), 'employee')]]]";

    const environmentTypeXpath =
      "//select[preceding-sibling::label[.//span[contains(text(), 'environment')]]]";

    const noDropdownsXpath =
      "//select[preceding-sibling::label[.//span[contains(text(), 'require sponsorship')]]]";
    const selectDropdowns: FillAllDropdowns[] = [
      // This one needs to be first (yes is default, we overwrite after)
      {
        xpath: "select",
        errorMessage: "Failed to fill out YES dropdown",
        fillValues: ["Yes"],
        pop: true,
      },
      {
        xpath: currentlyAnEmployeeXpath,
        fillValues: ["No"],
        errorMessage: 'Failed to fill "not an employee" dropdown',
      },
      {
        xpath: environmentTypeXpath,
        fillValues: ["Remote", "Fully remote", "Fully-remote"],
        errorMessage: 'Failed to fill "not an employee" dropdown',
      },
      {
        xpath: noDropdownsXpath,
        errorMessage: "Failed to fill NO dropdowns",
        fillValues: ["No"],
      },
    ];

    for (const fill of selectDropdowns) {
      await fillAllDropdownsById({ ...fill, page });
    }

    const howDidYouHearAboutUsXpath =
      "//form//select[preceding-sibling::label[.//span[contains(text(), 'hear about')]] | following-sibling::label[.//span[contains(text(), 'hear about')]]]";

    const howdYouLearnAboutXpath =
      "//form//select[preceding-sibling::label[.//span[contains(text(), 'learn about')]] | following-sibling::label[.//span[contains(text(), 'learn about')]]]";
    const learnAbout = await page.$(howdYouLearnAboutXpath);
    const hearAboutUsSelect = await page.$(howDidYouHearAboutUsXpath);

    if (hearAboutUsSelect || learnAbout) {
      const toSelect = hearAboutUsSelect ? hearAboutUsSelect : learnAbout;
      try {
        const values = await toSelect.evaluate((select) => {
          // Ensure the element is a select element
          if (select instanceof HTMLSelectElement) {
            return Array.from(select.options).map((option) => option.value);
          }
        });

        const linkedIn = values.findIndex((element) =>
          element.includes("LinkedIn")
        );
        const indeed = values.findIndex((element) =>
          element.includes("Indeed")
        );
        const other = values.findIndex((element) => element.includes("Other"));

        if (linkedIn > -1) {
          try {
            hearAboutUsSelect.selectOption(values[linkedIn]);
          } catch (e) {
            console.log(`Failed to make hear about us selection... ${e}`);
          }
        } else if (indeed) {
          try {
            hearAboutUsSelect.selectOption(values[indeed]);
          } catch (e) {
            console.log(`Failed to make hear about us selection... ${e}`);
          }
        } else {
          try {
            hearAboutUsSelect.selectOption(values[other]);
          } catch (e) {
            console.log(`Failed to make hear about us selection... ${e}`);
          }
        }
        console.log("HEYYYY BOIIIII");
        console.log(values);
      } catch (e) {
        console.log(`Failed to tell them how we hear about them... ${e}`);
      }
    }

    const rateExpectationXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'RATE', 'rate'), 'rate')]]";

    const paidXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'PAID', 'paid'), 'paid')]]";

    const salaryXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'SALARY', 'salary'), 'salary')]]";

    const goodFitInputXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'GOOD FIT', 'good fit'), 'good fit')]]";

    const goodFitTextAreaXpath =
      "//textarea[preceding-sibling::label[contains(translate(text(), 'GOOD FIT', 'good fit'), 'good fit')]]";

    const referredByXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'REFERRED', 'referred'), 'referred')]]";

    const startByDateXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'DATE', 'date'), 'date')]]";

    const cityXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'CITY', 'city'), 'city')]]";

    const interestedXpath =
      "//input[preceding-sibling::label[contains(translate(text(), 'INTERESTED', 'interested'), 'interested')]]";

    async function getShortDescription() {
      const descriptionToShorten = coverLetterMessage
        ? coverLetterMessage
        : description;
      shortDescription = await createShortDescription(descriptionToShorten);
      return shortDescription;
    }

    const fillInputsArray: FillAllInputs[] = [
      {
        xpath: rateExpectationXpath,
        errorMessage: "Failed to fill out hourly rate expectations",
        fillValue: "40",
      },
      {
        xpath: paidXpath,
        errorMessage: "Failed to fill out salary expectations",
        fillValue: "90000",
      },
      {
        xpath: salaryXpath,
        errorMessage: "Failed to fill out salary expectations",
        fillValue: "90000",
      },
      {
        xpath: goodFitInputXpath,
        errorMessage: "Failed to fill out good fit input",
        fillValue: await getShortDescription(),
      },
      {
        xpath: goodFitTextAreaXpath,
        errorMessage: "Failed to fill out good fit textarea",
        fillValue: await getShortDescription(),
      },
      {
        xpath: interestedXpath,
        errorMessage: "Failed to fill out interested input",
        fillValue: await getShortDescription(),
      },
      {
        xpath: referredByXpath,
        errorMessage: "Failed to fill out referred by",
        fillValue: "NA",
      },
      {
        xpath: startByDateXpath,
        fillValue: getFormattedDate(new Date()),
        errorMessage: "Could not fill start by date...",
      },
      {
        xpath: cityXpath,
        fillValue: "Pace, Florida, United States",
        errorMessage: "Could not fill my city...",
      },
    ];

    for (const fill of fillInputsArray) {
      await fillAllInputsById({ ...fill, page });
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

    try {
      await page.evaluate(() => {
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
      console.log(`Failed to fill yes or no radios: ${e}`);
    }

    return await handleNext();
  }

  console.log("Found no valid selectors...");

  // Try to go to next page
  return await handleNext();
};

async function fillAllInputsById({
  page,
  xpath,
  fillValue,
  errorMessage,
}: FillAllInputsFunction) {
  const findAll = await page.$$(xpath);

  try {
    for (const ele of findAll) {
      const selectId = await ele.getAttribute("id");
      await page.fill(`[id="${selectId}"]`, fillValue);

      // Blur the element
      await page.evaluate(() => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
      });
    }
  } catch (e) {
    console.log("====================================");
    console.log(`${errorMessage}: ${e}`);
    console.log("====================================");
  }
}

async function fillAllDropdownsById({
  page,
  xpath,
  fillValues,
  errorMessage,
  pop = false,
}: FillAllDropdownsFunction) {
  const findAll = await page.$$(xpath);

  if (findAll?.length > 0 && pop) {
    findAll.pop();
  }
  for (const fill of fillValues) {
    try {
      for (const ele of findAll) {
        const selectId = await ele.getAttribute("id");
        await page.selectOption(`[id="${selectId}"]`, fill);
      }
    } catch (e) {
      console.log("====================================");
      console.log(`${errorMessage}: ${e}`);
      console.log("====================================");
    }
  }
}
