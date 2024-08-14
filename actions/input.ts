import { Bot, BotAction } from '../interfaces'
import { log } from '../utils'

export const fill =
  ({ selector, value }: { selector: string; value: string }): BotAction =>
  async (bot: Bot) => {
    log(`Filling selector: ${selector} with value: ${value}`)
    await bot.page.fill(selector, value)
  }

export const waitForSelector =
  ({ selector }: { selector: string }): BotAction =>
  async (bot: Bot) => {
    log(`Waiting for selector: ${selector}`)
    await bot.page.waitForSelector(selector)
  }
