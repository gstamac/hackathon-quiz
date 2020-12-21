import { GeneralObject } from './interfaces'

export const reshapeNumberOfUnreadMessages = (count: number): string => {
  switch (true) {
  case (count > 0 && count < 10):
    return count.toString()
  case (count > 9):
    return '9+'
  default:
    return ''
  }
}

export const getNumberOfUnreadMessages = (counters: GeneralObject<number>): number => {
  const reducer = (accumulator: number, currentValue: string): number => accumulator + counters[currentValue]

  return Object.keys(counters).reduce(reducer, 0)
}
