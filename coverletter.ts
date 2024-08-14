import axios from 'axios'

export async function createCoverletter(description) {
  const message = `Write a cover letter (5 paragraphs or less) in the format of:
      "Dear Hiring Manager,
      
      (write content here)
      
      Sincerely,
  
      ${process.env.FULL_NAME}"
  
      Do NOT use words like "keen", "resonated", "top-tier", or "seamlessly". 
      Avoid talking about college degrees as I do not have a degree. Do not use bullet points. Make sure to emphasize how excited I am of the prospect of working for whatever the name of the company is.
  
      I have over 3 years of work experience as a Software Engineer using tools like Typescript/Javascript, Python, Node, Jenkins, Jira, Postgres, MySQL, Github, React, Angular, Docker, Kubernetes, along with several AWS tools like Lambda, RDS, Neptune, DynamoDB, S3, Timestream, API Gateway, AWS CDK. 
      I have built internal tooling and monitoring as well as customer-facing products. I excel in turning ambiguous requirments into real-world products.
      Only mention that I work in Healthcare if the company description says they are in the healthcare sector.
  
      Keep the number of paragraphs below 5.
  
      Here is the job description to use to make the cover letter - Only mention the technologies that are mentioned on the job description I provide. If in this description there is a tool or technology that I did NOT mention I have experience with, do not mention it:
  
  "${description}"
      
  
  `

  const chatgptApiUrl = 'https://api.openai.com/v1/chat/completions'
  const data = {
    // The request payload should be in a `data` property
    model: 'gpt-4',
    messages: [
      {
        // Use `messages` array with the message object
        role: 'user',
        content: message,
      },
    ],
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHAT_GPT_API_KEY}`,
  }

  try {
    const result = await axios.post(chatgptApiUrl, data, { headers: headers })
    return result.data.choices[0].message.content
  } catch (e) {
    console.log('====================================')
    console.log(`Failed to reach Chat GPT api: ${e}`)
    console.log('====================================')
    return false
  }
}

export async function createShortDescription(description) {
  const message = `Based off this description, write 2- 3 short sentences why I would want to work for the company: 
    ${description}`

  const chatgptApiUrl = 'https://api.openai.com/v1/chat/completions'
  const data = {
    // The request payload should be in a `data` property
    model: 'gpt-4',
    messages: [
      {
        // Use `messages` array with the message object
        role: 'user',
        content: message,
      },
    ],
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHAT_GPT_API_KEY}`,
  }

  try {
    const result = await axios.post(chatgptApiUrl, data, { headers: headers })
    return result.data.choices[0].message.content
  } catch (e) {
    console.log('====================================')
    console.log(`Failed to reach Chat GPT api: ${e}`)
    console.log('====================================')
    return false
  }
}
