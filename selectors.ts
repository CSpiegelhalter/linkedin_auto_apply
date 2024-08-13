export const buttons = {
  SEARCH:
    '[class="reusable-search-filters-buttons search-reusables__secondary-filters-show-results-button artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]',
  SIGNIN: '[aria-label="Sign in"]',
  FILTERS:
    '[aria-label="Show all filters. Clicking this button displays all available filter options."]',
  LAST_DAY_FILTER: "//label[p/span[text()='Past 24 hours']]",
  REMOTE_ONLY_FILTER: '[for="advanced-filter-workplaceType-2"] > p',
  EASY_APPLY: '[class="search-reusables__advanced-filters-binary-toggle"] > div',
};

export const input = {
  USERNAME: "#username",
  PASSWORD: "#password",
  JOB_SEARCH: '[aria-label="Search by title, skill, or company"]',
};

export const view = {
  JOBS_ICON: '[href="https://www.linkedin.com/jobs/?"]',
  SCROLLABLE_PAGE: ".scaffold-layout__list  > div"
};
