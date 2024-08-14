# linkedin_auto_apply

Automated way of applying to jobs on linkedin

# Before you run

1. Create a `.env` file
2. Add `EMAIL=yourlinkedinemail@email.com`
3. Add `PASSWORD=yourlinkedinpassword`
4. (Optional) Add `CHAT_GPT_API_KEY=yourapikey` (this is to create a cover letter)
5. Add `FULL_NAME=First Last`
6. Add `CITY_STATE_COUNTRY=City, State, Country`

## Additionally

Go to the `constants.ts` file and look over what you will be filling in. You can change accordingly.

# How to run:

`npx tsx main.ts` or just `npm run-script run`

# Testing

If you come across a job posting that breaks, you can try to fix it by inserting the URL in the `TEST_URL` in the `constants.ts` file then run `TEST=true npm run-script run` or `TEST=true npx tsx main.ts`

This allows you to just go to the broken path and you can work to fix it.

# IMPORTANT

This script does its best to go through the application process, but each job posting on LinkedIn can be different so there could be things I did not account for. It may hang/skip postings after a while of trying and it could fill in some inputs with something you did not expect (ie. fills in an hourly rate with your number of years of experience)
