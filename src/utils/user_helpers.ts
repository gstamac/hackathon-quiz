import { redirectTo } from '.'
import { SUPPORT_EMAIL_ADDRESS } from '../constants'
import { GidName } from '../store/interfaces'

export const reportUserByEmail = (user: GidName, reporter?: GidName): void => {
  const reportOrigin: string = reporter ? ` from user ${reporter}` : ''
  const mailSubject: string = `GlobaliD: complaint report${reportOrigin} on user ${user}`
  const mailBody: string = `Please list your comments about ${user}`

  redirectTo(`mailto:${SUPPORT_EMAIL_ADDRESS}?subject=${mailSubject}&body=${mailBody}`)
}
