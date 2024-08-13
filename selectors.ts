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
};

export const input = {
  USERNAME: "#username",
  PASSWORD: "#password",
  JOB_SEARCH: '[aria-label="Search by title, skill, or company"]',
  YOUR_NAME:
    "//input[preceding-sibling::label[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'signature')] | following-sibling::label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'your name') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'signature')]]",
  DATE: "//input[@placeholder='mm/dd/yyyy']",
};

export const view = {
  JOBS_ICON: '[href="https://www.linkedin.com/jobs/?"]',
  SCROLLABLE_PAGE: ".scaffold-layout__list  > div",
  JOB: '[class="app-aware-link "]',
  ALREADY_APPLIED: "//span[contains(., 'Application submitted')]",
  APPLICATION_MODAL: '[aria-labelledby="jobs-apply-header"]',
};
