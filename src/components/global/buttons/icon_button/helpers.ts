import requestVoucherIcon from '../../../../assets/icons/request_vouch_icon.svg'
import SendFundsIcon from '../../../../assets/icons/send_funds_icon.svg'
import AddToContactsIcon from '../../../../assets/icons/add_contact_icon.svg'
import SendMessageIcon from '../../../../assets/icons/send_message_icon.svg'
import RemoveFromContactsIcon from '../../../../assets/icons/remove_from_contacts_icon.svg'

import { iconType } from './interfaces'

const iconSwitch: { [key: string]: string } = {
  [iconType.ADD_TO_CONTACTS]:  AddToContactsIcon,
  [iconType.REQUEST_VOUCHER]: requestVoucherIcon,
  [iconType.SEND_FUNDS]: SendFundsIcon,
  [iconType.SEND_MESSAGE]: SendMessageIcon,
  [iconType.REMOVE_FROM_CONTACTS]: RemoveFromContactsIcon,
}

export const getPeopleIcons = (icon: iconType): string =>
  iconSwitch[icon]
