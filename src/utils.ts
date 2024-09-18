export const log = (text: string) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp}: ${text}`)
}

export function getFormattedDate(date: Date) {
  let year = date.getFullYear()
  let month = (1 + date.getMonth()).toString().padStart(2, '0')
  let day = date.getDate().toString().padStart(2, '0')

  return month + '/' + day + '/' + year
}
