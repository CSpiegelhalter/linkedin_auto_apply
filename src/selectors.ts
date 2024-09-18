export const buttons = {
  SEARCH:
    '[class="reusable-search-filters-buttons search-reusables__secondary-filters-show-results-button artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]',
  SIGNIN: '[aria-label="Sign in"]',
  FILTERS:
    '[aria-label="Show all filters. Clicking this button displays all available filter options."]',
  LAST_DAY_FILTER: "//label[p/span[text()='Past 24 hours']]",
  REMOTE_ONLY_FILTER: '[for="advanced-filter-workplaceType-2"] > p',
  EASY_APPLY_FILTER:
    '[class="search-reusables__advanced-filters-binary-toggle"] > div',
  EASY_APPLY:
    "//*[contains(@aria-label, 'Easy Apply') and not(contains(@aria-label, '{:companyName}'))]",
  REVIEW: '//form//button[@aria-label="Review your application"]',
  NEXT: '//form//button[@aria-label="Continue to next step"]',
  SUBMIT: "//button[@aria-label='Submit application']",
  AGREE_TO_TERMS: '//label[contains(translate(string(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "agree") and contains(translate(string(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "terms")]',
  CHECKBOXES:
    "//form//label[following-sibling::input[@type='checkbox'] | preceding-sibling::input[@type='checkbox']]",
};

export const input = {
  USERNAME: "#username",
  PASSWORD: "#password",
  JOB_SEARCH: '[aria-label="Search by title, skill, or company"]',
  YOUR_NAME:
    "//input[preceding-sibling::label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'signature')] | following-sibling::label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'signature')]]",
  DATE: "//input[@placeholder='mm/dd/yyyy']",
  ADDRESS: "//form//h3[contains(., 'address')]",
  YEARS_EXPERIENCE:
    "//form//input[not(@type='checkbox') and not(@type='radio')]",
  RATE: "//input[preceding-sibling::label[contains(translate(text(), 'RATE', 'rate'), 'rate')]]",
  PAID: "//input[preceding-sibling::label[contains(translate(text(), 'PAID', 'paid'), 'paid')]]",
  SALARY:
    "//input[preceding-sibling::label[contains(translate(text(), 'SALARY', 'salary'), 'salary')]]",
  GOOD_FIT:
    "//input[preceding-sibling::label[contains(translate(text(), 'GOOD FIT', 'good fit'), 'good fit')]]",
  GOOD_FIT_TEXTAREA:
    "//textarea[preceding-sibling::label[contains(translate(text(), 'GOOD FIT', 'good fit'), 'good fit')]]",
  REFERRED_BY:
    "//input[preceding-sibling::label[contains(translate(text(), 'REFERRED', 'referred'), 'referred')]]",
  START_BY:
    "//input[preceding-sibling::label[contains(translate(text(), 'DATE', 'date'), 'date')]]",
  CITY: "//input[preceding-sibling::label[contains(translate(text(), 'CITY', 'city'), 'city')]]",
  INTERESTED:
    "//input[preceding-sibling::label[contains(translate(text(), 'INTERESTED', 'interested'), 'interested')]]",
};

export const view = {
  JOBS_ICON: '[href="https://www.linkedin.com/jobs/?"]',
  SCROLLABLE_PAGE: ".scaffold-layout__list  > div",
  JOB: '[class="app-aware-link "]',
  ALREADY_APPLIED: "//span[contains(., 'Application submitted')]",
  APPLICATION_MODAL: '[aria-labelledby="jobs-apply-header"]',
  CONTACT_INFO: "//h3[text()='Contact info']",
  PROFILE_PIC: `//img[@title='${process.env.FULL_NAME}']`,
  DIVERSITY_PAGE: "//form//h3[contains(., 'Diversity')]",
  WORK_AUTH_PAGE: "//form//h3[contains(., 'authorization')]",
  SELF_IDENTITY_PAGE: "//form//h3[contains(., 'identification')]",
  RESUME_PAGE:
    "//*[@aria-label='Upload resume button. Only, DOC, DOCX, PDF formats are supported. Max file size is (2 MB).']",
  ADDITIONAL_QUESTIONS: "//form//h3[contains(., 'Additional')]",
  CURRENTLY_AN_EMPLOYEE:
    "//select[preceding-sibling::label[.//span[contains(text(), 'employee')]]]",
  ENVIRONMENT_TYPE:
    "//select[preceding-sibling::label[.//span[contains(text(), 'environment')]]]",
  REQUIRES_SPONSORSHIP:
    "//select[preceding-sibling::label[.//span[contains(text(), 'require sponsorship')]]]",
  HOW_DID_YOU_HEAR_ABOUT:
    "//form//select[preceding-sibling::label[.//span[contains(text(), 'hear about')]] | following-sibling::label[.//span[contains(text(), 'hear about')]]]",
  HOW_DID_YOU_LEARN_ABOUT:
    "//form//select[preceding-sibling::label[.//span[contains(text(), 'learn about')]] | following-sibling::label[.//span[contains(text(), 'learn about')]]]",
};
