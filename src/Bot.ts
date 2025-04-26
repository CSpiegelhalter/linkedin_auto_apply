import type { BrowserContext, Browser, Page } from 'playwright'
import { AllActions, Bot } from './interfaces'
import { chromium } from 'playwright'
import * as allActions from './actions/index'

/**
 * Singleton bot
 */
export class NodeBot implements Bot {
  private static instance: NodeBot | null = null
  actions: AllActions
  page: Page
  browser: Browser
  context: BrowserContext
  jobsAppliedFor: number
  retries: number
  constructor({
    page,
    context,
    browser,
    actions,
  }: {
    page: Page
    context: BrowserContext
    browser: Browser
    actions: AllActions
  }) {
    this.page = page
    this.context = context
    this.browser = browser
    this.actions = actions
    this.jobsAppliedFor = 0
    this.retries = 0
  }

  public static async getInstance(): Promise<NodeBot> {
    if (!NodeBot.instance) {
      const env = process.env.ENV_NAME !== 'local'
      const browser = await chromium.launch({ headless: env })
      const context = await browser.newContext()
      const page = await context.newPage()
      const actions = allActions
      NodeBot.instance = new NodeBot({ page, context, browser, actions })
    }
    return NodeBot.instance
  }
}
