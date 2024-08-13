import { Bot, BotAction } from "../interfaces";
import { log } from "../utils";

export const goto =
  ({ url }: { url: string }): BotAction =>
  async (bot: Bot) => {
    log(`Going to: ${url}`);
    await bot.page.goto(url);
  };

export const click =
  ({ selector }: { selector: string }): BotAction =>
  async (bot: Bot) => {
    log(`Clicking: ${selector}`);
    await bot.page.click(selector);
  };


  export const waitForTimeout =
  ({ timeout }: { timeout: number }): BotAction =>
  async (bot: Bot) => {
    log(`Waiting for timeout: ${timeout}ms`)
    await bot.page.waitForTimeout(timeout)
  };