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

`npx tsx main.ts` or just `npm run`

# IMPORTANT

This script does its best to go through the application process, but each job posting on LinkedIn can be different so there could be things I did not account for. It may hang/skip postings after a while of trying and it could fill in some inputs with something you did not expect (ie. fills in an hourly rate with your number of years of experience)
