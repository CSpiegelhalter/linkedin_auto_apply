import { configDotenv } from 'dotenv'
import { buttons } from './selectors'
import { urls } from './constants'
import { initializeBot } from './init'
import { log } from './utils'
import {
  easyApplyFilter,
  gotoJobs,
  jobApplyLoop,
  lastDayPosts,
  login,
  openFilters,
  remoteOnly,
  searchForJobs,
  test,
} from './navigation'
import * as constants from './constants'
import { Bot, BotAction } from './interfaces'
import { NodeBot } from './Bot'

configDotenv()

const jobSearch =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    const { click } = bot.actions

    log('Job Search...')
    await gotoJobs()(bot)
    await searchForJobs(constants.JOB_TITLE)(bot)
    await openFilters()(bot)
    await lastDayPosts()(bot)
    await remoteOnly()(bot)
    await easyApplyFilter()(bot)

    await click({ selector: buttons.SEARCH })(bot)
  }

async function main() {
  const bot = await initializeBot()
  const { goto } = bot.actions

  try {
    log(process.env.TEST)
    await goto({ url: urls.LOGIN })(bot)

    await login()(bot)

    if (false) {
      await test(constants.TEST_URL)(bot)
    } else {
      await jobSearch()(bot)
      await jobApplyLoop()(bot)
    }
  } finally {
    log(`Successfully applied for: ${bot.jobsAppliedFor} jobs total`)
    await bot.browser.close()
    log('Browser closed!')
  }
}

process.on('SIGINT', async () => {
  log('Caught interrupt signal (Ctrl + C)')
  const bot = await NodeBot.getInstance()
  await bot.browser.close()
  log(`Succesfully applied for: ${bot.jobsAppliedFor} jobs total`)
  process.exit()
})

main().then(() => {
  console.log('All done!')
})
