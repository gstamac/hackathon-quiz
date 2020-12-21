export interface IconButtonProps {
  icon: iconType
  title: string
  disabled?: boolean
  loading: boolean
  tooltipText?: string
  handleClick?: () => Promise<void>
}

export enum iconType {
  REQUEST_VOUCHER = 'Request vouch',
  SEND_FUNDS = 'Send or request funds',
  SEND_MESSAGE = 'Send message',
  ADD_TO_CONTACTS = 'Add to contacts',
  REMOVE_FROM_CONTACTS = 'Remove from contacts',
}
