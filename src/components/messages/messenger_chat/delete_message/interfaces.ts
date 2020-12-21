import { DialogProps } from 'globalid-react-ui'

export interface DeleteMessageDialogProps extends DialogProps {
  handleDelete: () => void
}

export enum ConversationType {
  PRIMARY = 'primary conversation',
  GROUP = 'group conversation',
  OTHER = 'other conversation',
}
