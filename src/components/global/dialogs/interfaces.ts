import { FieldDefinition, OnSubmit, OnChange } from 'globalid-react-ui'
import { DialogProps as MuiDialogProps, PropTypes} from '@material-ui/core'

export interface DialogProps {
  open: boolean
  handleOpenState: () => void
}

export interface StyledDialogProps {
  open: boolean
  handleOpenState: () => void
  handleClick?: () => void
  actionText?: string
  children: JSX.Element
  name?: string
  className?: string
}

export interface FormDialogProps extends MuiDialogProps {
  title: string
  showCancelButton?: boolean
  formCancelButtonText?: string
  formSubmitButtonText?: string
  formId: string
  fieldId?: string
  formTitle?: string
  formSubtitle?: string
  formDescription?: string
  fieldDefinition: FieldDefinition
  fullScreenOnMobile?: boolean
  adornment?: JSX.Element
  dialog?: string
  onFormSubmit: OnSubmit
  onFormChange?: OnChange
  onExit(): void
  onFormLoad?(): void
  submitButtonColor?: PropTypes.Color
}

export interface VerifiedDataProps {
  icon: string | undefined
  name: string
  description: string
}
