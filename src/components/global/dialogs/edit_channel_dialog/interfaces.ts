import { DialogProps, OnSubmit } from 'globalid-react-ui'

export interface EditChannelForm {
  title: string
  description: string
}

export interface EditChannelDetails {
  title?: string | null
  description?: string | null
}

export interface EditChannelProps extends DialogProps {
  onFormSubmit: OnSubmit
  channel: EditChannelDetails
  formKey: string
}
