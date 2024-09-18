import { NodeBot } from './Bot'

export const initializeBot = async (): Promise<NodeBot> => {
  return await NodeBot.getInstance()
}
