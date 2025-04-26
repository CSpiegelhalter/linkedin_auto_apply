import { Bot, BotAction } from './interfaces'
import * as constants from './constants'
import { buttons, input, view } from './selectors'
import { getFormattedDate, log } from './utils'
import { ElementHandle } from 'playwright'

const personalInfo = [
  {
    xpath: input.YOUR_NAME,
    value: process.env.FULL_NAME,
    errorMessage: 'Could not fill name...',
  },
  {
    xpath: input.DATE,
    value: getFormattedDate(new Date()),
    errorMessage: 'Could not fill date...',
  },
  {
    xpath: input.ADDRESS,
    value: process.env.CITY_STATE_COUNTRY,
    errorMessage: 'Failed to fill in the city',
  },
]

const selectDropdowns = [
  // This one needs to be first (yes is default, we overwrite after)
  {
    xpath: 'select',
    errorMessage: 'Failed to fill out YES dropdown',
    values: ['Yes'],
    pop: true,
  },
  {
    xpath: view.CURRENTLY_AN_EMPLOYEE,
    values: ['No'],
    errorMessage: 'Failed to fill "not an employee" dropdown',
  },
  {
    xpath: view.ENVIRONMENT_TYPE,
    values: ['Remote', 'Fully remote', 'Fully-remote'],
    errorMessage: 'Failed to fill "not an employee" dropdown',
  },
  {
    xpath: view.REQUIRES_SPONSORSHIP,
    errorMessage: 'Failed to fill NO dropdowns',
    values: ['No'],
  },
]

const fillInputsArray = [
  {
    xpath: input.RATE,
    errorMessage: 'Failed to fill out hourly rate expectations',
    value: constants.HOURLY_RATE,
  },
  {
    xpath: input.PAID,
    errorMessage: 'Failed to fill out salary expectations',
    value: constants.SALARY_RATE,
  },
  {
    xpath: input.SALARY,
    errorMessage: 'Failed to fill out salary expectations',
    value: constants.SALARY_RATE,
  },
  {
    xpath: input.GOOD_FIT,
    errorMessage: 'Failed to fill out good fit input',
    value: 'NA', // TODO
  },
  {
    xpath: input.GOOD_FIT_TEXTAREA,
    errorMessage: 'Failed to fill out good fit textarea',
    value: 'NA', // TODO
  },
  {
    xpath: input.INTERESTED,
    errorMessage: 'Failed to fill out interested input',
    value: 'NA', // TODO
  },
  {
    xpath: input.REFERRED_BY,
    errorMessage: 'Failed to fill out referred by',
    value: 'NA',
  },
  {
    xpath: input.START_BY,
    value: getFormattedDate(new Date()),
    errorMessage: 'Could not fill start by date...',
  },
  {
    xpath: input.CITY,
    value: process.env.CITY_STATE_COUNTRY,
    errorMessage: 'Could not fill my city...',
  },
]

const fillAllInputsById =
  ({
    xpath,
    value,
    errorMessage,
  }: {
    xpath: string
    value: string
    errorMessage: string
  }): BotAction =>
  async (bot: Bot): Promise<void> => {
    const { fill } = bot.actions
    const findAll = await bot.page.$$(xpath)

    try {
      for (const ele of findAll) {
        const selectId = await ele.getAttribute('id')
        await fill({ selector: `[id="${selectId}"]`, value })(bot)

        // Blur the element
        await bot.page.evaluate(() => {
          const activeElement = document.activeElement
          if (activeElement && activeElement instanceof HTMLElement) {
            activeElement.blur()
          }
        })
      }
    } catch (e) {
      log(`${errorMessage}: ${e}`)
    }
  }

const isOnPage =
  (selector: string): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    log(`Checking if on correct page. Xpath: ${selector}`)
    const exists = await bot.page.evaluate(
      (args) => {
        const matchingElement = document.evaluate(
          args.selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue

        return !!matchingElement
      },
      { selector }
    )
    return !!exists
  }

const allXpathsExist =
  ({
    xpaths,
    exists = true,
  }: {
    xpaths: string[]
    exists?: boolean
  }): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const promises = []

    for (const path of xpaths) {
      promises.push(isOnPage(path)(bot))
    }

    const results = await Promise.all(promises)

    return results.every((item) => item === exists)
  }

const anyXpathExists =
  ({
    xpaths,
    exists = true,
  }: {
    xpaths: string[]
    exists?: boolean
  }): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const promises = []
    for (const path of xpaths) {
      promises.push(isOnPage(path)(bot))
    }
    const results = await Promise.all(promises)
    return results.some((item) => item === exists)
  }

const fillAllDropdownsById =
  ({
    xpath,
    values,
    errorMessage,
    pop = false,
  }: {
    xpath: string
    values: string[]
    errorMessage: string
    pop?: boolean
  }): BotAction =>
  async (bot: Bot): Promise<void> => {
    try {
    const findAll = await bot.page.$$(xpath)

    if (findAll?.length > 0 && pop) {
      findAll.pop()
    }
    for (const fill of values) {
      try {
        for (const ele of findAll) {
          const selectId = await ele.getAttribute('id')
          await bot.page.selectOption(`[id="${selectId}"]`, fill)
        }
      } catch (e) {
        log(`${errorMessage}: ${e}`)
      }
    }
  } catch (e) {
    log(`${errorMessage } -- outside for loop?: ${e}`)
  }
  }

const clickCheckboxes =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    const checkboxesLength = (await bot.page.$$(buttons.CHECKBOXES)).length

    try {
      for (let i = 0; i < checkboxesLength; i++) {
        // Have to re-grab the checkboxes because clicking them causes a re-render
        const checkboxes = await bot.page.$$(buttons.CHECKBOXES)
        await checkboxes[i].click()
      }
    } catch (e) {
      log(`Failed to click checkboxes: ${e}`)
    }
  }
function answerYesOrNo(question) {
  question = question.toLowerCase()

  if (question.includes('worked for')) {
    return 'No'
  } else if (question.includes('related to')) {
    return 'No'
  } else if (question.includes('Citizen')) {
    return 'Yes'
  } else if (question.includes('remote')) {
  return 'Yes'
}  else if (question.includes('experience')) {
    return 'Yes'
  } else if (question.includes('reside')) {
    return 'Yes'
  } else if (question.includes('authorized')) {
    return 'Yes'
  } else if (question.includes('sponsorship')) {
    return 'No'
  } else if (question.includes('currently an')) {
    return 'No'
  } else if (question.includes('currently work')) {
    return 'No'
  } else if (question.includes('accommodation')) {
    return 'Yes'
  } else if (question.includes('agree')) {
    return 'Yes'
  } else if (question.includes('older')) {
    return 'Yes'
  } else if (question.includes('willing')) {
    return 'Yes'
  } else if (question.includes('working')) {
    return 'No'
  } else if (question.includes('eligible')) {
    return 'Yes'
  } else if (question.includes('Degree') || question.includes('degree')) {
    return 'No'
  } else if (question.includes('clearance')) {
    return 'No'
  } else {
    return 'Yes'
  }
}

const handleYesNoDropdowns =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    try {
      const labels = await bot.page.$$(
        '//label[following-sibling::span[following-sibling::select[@aria-required="true"]]]'
      )
      const labelInnerTexts = []
      for (const t of labels) {
        const tpromise = await t.innerText()
        const toAdd = tpromise?.split('\n')?.[0]?.trim()
        labelInnerTexts.push(toAdd)
      }


      // Step 2: Create an object mapping inner texts to answerYesOrNo results
      const labelAnswerMap: { [key: string]: string } = {}
      for (const text of labelInnerTexts) {
        labelAnswerMap[text] = answerYesOrNo(text)
      }
      for (const key of Object.keys(labelAnswerMap)) {
        const button = await bot.page.$(
          `//select[preceding-sibling::span[preceding-sibling::label[span[text()="${key}"]]]]`
        )
        await button.selectOption(labelAnswerMap[key])
      }
    } catch (e) {
      log(`FAILED TO FILL OUT DROPDOWNS: ${e}`)
    }
  }

const handleSelfIdentityForm =
(): BotAction =>
async (bot: Bot): Promise<void> => {
    try {
      // Fetch all <select> elements on the page
      const dropdowns = await bot.page.$$('select[aria-required="true"]') // Adjust selector if needed
      
      for (const dropdown of dropdowns) {
        const options = await dropdown.$$('option') // Get all options for the dropdown

        // Iterate over each option and select based on the values "White" or "Male"
        for (const option of options) {
          const optionText = (await option?.innerText()).replace(/\n/g, '').trim();

          if (optionText.toLowerCase().includes('white')) {
            // Select the "White" option
            await dropdown.selectOption({ value: optionText })
            console.log(`Selected "White" option: "${optionText}"`)
            break // Exit once the option is selected
          } else if (optionText.toLowerCase().includes('male')) {
            // Select the "Male" option
            await dropdown.selectOption({ value: optionText })
            console.log(`Selected "Male" option: "${optionText}"`)
            break // Exit once the option is selected
          }
        }
      }
    } catch (e) {
      console.log(`FAILED TO FILL OUT  SELF ID DROPDOWNS: ${e}`)
    }
    try {
      const noDisability = await bot.page.$('//label[contains(string(), "not have a disability")]')
      await noDisability.click()

      const notAVeteran = await bot.page.$('//legend[contains(string(), "protected veteran")]/following-sibling::div//input[@value="0"]/following-sibling::label')
      await notAVeteran.click()
    } catch (e) {
      console.log(`FAILED TO FILL OUT MULTICHOICE: ${e}`)
    }
  }

 
 const handleYesNo =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    function convert(yesNo) {
      if (yesNo === 'Yes') return 1
      return 0
    }

    try {
      // Grab the forms and return an object mapping the question to the answer
      const questionAnswerMap = await bot.page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('fieldset'))
        const yesNoForms = forms.filter((form) =>
          form.querySelector('div > [type="radio"]')
        )
        const questionAnswerMap = {}
        yesNoForms.forEach((form) => {
          const questionElement = form.querySelector('legend')
          const question = questionElement.innerText
          questionAnswerMap[question] = null // Initialize with null, will be filled later
        })
        return questionAnswerMap
      })

      // Fill the answers in the map
      for (const question in questionAnswerMap) {
        const answer = answerYesOrNo(question)
        questionAnswerMap[question] = {
          answer,
          convertedAnswer: convert(answer),
        }
      }

      // Go back into the eval if necessary to interact with the page
      await bot.page.evaluate((questionAnswerMap) => {
        const forms = Array.from(document.querySelectorAll('fieldset'))
        const yesNoForms = forms.filter((form) =>
          form.querySelector('div > [type="radio"]')
        )

        yesNoForms.forEach((form) => {
          const questionElement = form.querySelector('legend')
          const question = questionElement.innerText
          const { answer, convertedAnswer } = questionAnswerMap[question]

          const radioButtons = Array.from(form.querySelectorAll('div'))
          for (const button of radioButtons) {
            let inputElement = button.querySelector(`input[value="${answer}"]`)
            if (!inputElement) {
              inputElement = button.querySelector(
                `input[value="${convertedAnswer}"]`
              )
            }
            if (inputElement) {
              const clickableLabel = button.querySelector('label')
              clickableLabel.click()
            }
          }
        })
      }, questionAnswerMap)
    } catch (e) {
      console.log(`Failed to fill yes or no radios: ${e}`)
    }
  }

const hearAboutUs =
  (element: ElementHandle<SVGElement | HTMLElement>): BotAction =>
  async (bot: Bot): Promise<void> => {
    try {
      const values = await element.evaluate((select) => {
        // Ensure the element is a select element
        if (select instanceof HTMLSelectElement) {
          return Array.from(select.options).map((option) => option.value)
        }
      })

      const linkedIn = values.findIndex((element) =>
        element.includes('LinkedIn')
      )
      const indeed = values.findIndex((element) => element.includes('Indeed'))
      const other = values.findIndex((element) => element.includes('Other'))

      if (linkedIn > -1) {
        element.selectOption(values[linkedIn])
      } else if (indeed) {
        element.selectOption(values[indeed])
      } else {
        element.selectOption(values[other])
      }
    } catch (e) {
      log(`Failed to tell them how we hear about them... ${e}`)
    }
  }
const handleAdditionalQuestions =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    log('Filling additional questions...')
    await fillAllInputsById({
      xpath: input.YEARS_EXPERIENCE,
      value: constants.YEARS_EXPERIENCE,
      errorMessage: 'Failed to fill out years experience questions',
    })(bot)

    for (const fill of selectDropdowns) {
      await fillAllDropdownsById(fill)(bot)
    }

    const learnAbout = await bot.page.$(view.HOW_DID_YOU_LEARN_ABOUT)
    const hearAboutUsSelect = await bot.page.$(view.HOW_DID_YOU_HEAR_ABOUT)

    if (hearAboutUsSelect || learnAbout) {
      const toSelect = hearAboutUsSelect ? hearAboutUsSelect : learnAbout
      await hearAboutUs(toSelect)(bot)
    }

    for (const fill of fillInputsArray) {
      await fillAllInputsById(fill)(bot)
    }

    await clickCheckboxes()(bot)

    await handleYesNo()(bot)

    await handleYesNoDropdowns()(bot)
  }

export const apply =
  (url: string): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const { click, waitForTimeout, waitForSelector, goto } = bot.actions
    const prevPage = bot.page
    log(`Job posting: ${url} \n`)

    // Opens a new tab to use
    bot.page = await bot.context.newPage()
    await goto({ url })(bot)
    await waitForSelector({ selector: view.JOB })(bot)
    await waitForTimeout({ timeout: 2500 })(bot)

    const alreadyApplied = await isOnPage(view.ALREADY_APPLIED)(bot)
    const easyApplyButtonExists = await isOnPage(buttons.EASY_APPLY)(bot)
    if (alreadyApplied || !easyApplyButtonExists) {
      await bot.page.close()
      bot.page = prevPage
      return false
    }

    const easyApplyButton = await bot.page.$(buttons.EASY_APPLY)
    const easyApplyButtonId = await easyApplyButton.getAttribute('id')

    await click({ selector: `[id="${easyApplyButtonId}"]` })(bot)
    await waitForSelector({ selector: view.APPLICATION_MODAL })(bot)

    const success = await handleDynamicSteps()(bot)
    await bot.page.close()
    bot.page = prevPage
    return success
  }

export const handleDynamicSteps =
  (): BotAction =>
  async (bot: Bot): Promise<boolean> => {
    const { click, waitForTimeout, waitForSelector } = bot.actions

    if (await isOnPage(buttons.SUBMIT)(bot)) {
      log('Application submitted!')
      await click({ selector: buttons.SUBMIT })(bot)
      await waitForTimeout({ timeout: 1000 })(bot)
      log(`Number of resets: ${bot.retries}`)
      bot.retries = 0
      return true
    }

    // This means we failed to fill everything out
    if (bot.retries > 15) {
      bot.retries = 0
      return false
    }
    bot.retries++
    await waitForTimeout({ timeout: 1500 })(bot)

    const educationLabel = await isOnPage('//span[text()="Education"]')(bot)
    const cancelEducation = await isOnPage('//button[span[text()="Cancel"]]')(
      bot
    )
    if (educationLabel && cancelEducation) {
      await click({ selector: '//button[span[text()="Cancel"]]' })(bot)
    }
    const contactInfoPage = await allXpathsExist({
      xpaths: [view.CONTACT_INFO, view.PROFILE_PIC],
    })(bot)

    const skipPages = await anyXpathExists({
      xpaths: [view.DIVERSITY_PAGE, view.RESUME_PAGE, view.WORK_AUTH_PAGE],
    })(bot)

    const selfIdPage = await anyXpathExists({
      xpaths: [view.SELF_IDENTITY_PAGE],
    })(bot)

    if (selfIdPage) {
      await handleSelfIdentityForm()(bot)
    }

    if (contactInfoPage || skipPages) {
      log('Resume, contact, diversity, or work auth page...')
      return await handleNext()(bot)
    }

    for (const info of personalInfo) {
      await fillAllInputsById(info)(bot)
    }
    // await bot.actions.waitForTimeout({ timeout: 10000000 })(bot)


    if (await isOnPage(view.ADDITIONAL_QUESTIONS)(bot)) {
      await handleAdditionalQuestions()(bot)
    }

    const agreeToTermsButton = await anyXpathExists({
      xpaths: [buttons.AGREE_TO_TERMS],
    })(bot)

    if (agreeToTermsButton) {
      await click({ selector: buttons.AGREE_TO_TERMS })(bot)
    }
    return await handleNext()(bot)
  }

export const handleNext =
  (): BotAction =>
  async (bot: Bot): Promise<void> => {
    if (await isOnPage(buttons.REVIEW)(bot)) {
      log('On review page...')
      try {
        const reviewButton = await bot.page.$$(buttons.REVIEW)
        await reviewButton[0].click()
      } catch (e) {
        log(`Failed to click review button... ${e}`)
      }
    } else {
      log('Handling next page...')
      try {
        const nextButton = await bot.page.$(buttons.NEXT)
        await nextButton.click()
      } catch (e) {
        log(`Failed to click next button... ${e}`)
      }
    }
    return await handleDynamicSteps()(bot)
  }
