import type * as actions from './actions/index'
import type { BrowserContext, Browser, Page } from "playwright";


export type BaseFunction = (...args: any[]) => any

export interface Bot {
    actions: AllActions
    browser: Browser
    context: BrowserContext
    page: Page
    jobsAppliedFor: number
}

export interface BotAction<R = any> extends BaseFunction {
    (bot: any): Promise<R>
}

export type AllActions = typeof actions

// export interface Page {
//     goto(url: string, options?: {
//         referer?: string,
//         timeout?: number,
//         waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
//     })
// }