import { Bot } from "./interfaces";
import { chromium } from "playwright";
import * as actions from "./actions/index";

export const initializeBot = async (): Promise<Bot> => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  return {
    page,
    context,
    browser,
    actions,
    applyPage: null,
    jobsAppliedFor: 0,
    retries: 0,
  };
};
