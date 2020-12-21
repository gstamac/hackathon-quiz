import React from 'react'
import { TextInput, partiallyUpdateValueObject } from 'globalid-react-ui'
import { EditChannelProps, EditChannelForm } from './interfaces'
import { FormDialog } from '..'
import { useStyles } from './styles'
import { getString } from '../../../../utils/general_utils'
import { CustomFieldDefinition } from '../../../interfaces'

const conversationFieldDefinitions: CustomFieldDefinition<EditChannelForm> = {
  title: [['maxLength', '20']],
  description: [['maxLength', '100']],
}

export const EditChannelDialog: React.FC<EditChannelProps> = ({ onFormSubmit, onExit, open, channel, formKey }: EditChannelProps) => {
  const classes = useStyles()

  return <FormDialog
    title={getString('edit-conversation-dialog-title')}
    formSubtitle={getString('edit-conversation-dialog-subtitle')}
    formTitle={getString('edit-conversation-dialog-description')}
    formDescription={getString('edit-conversation-dialog-help')}
    onFormSubmit={onFormSubmit}
    open={open}
    onFormLoad={() => {
      partiallyUpdateValueObject(formKey, 'title', {
        value: channel.title ?? '',
        has_changed: false,
      })
      partiallyUpdateValueObject(formKey, 'description', {
        value: channel.description ?? '',
        has_changed: false,
      })}}
    formId={formKey}
    fieldId='description'
    fieldDefinition={conversationFieldDefinitions}
    onExit={onExit}
    fullScreenOnMobile={true}
  >
    <TextInput
      fieldId='title'
      label={getString('edit-conversation-dialog-input-title')}
      fullWidth
    />

    <TextInput
      className={classes.topMargin}
      fieldId='description'
      label={getString('edit-conversation-dialog-input-description')}
      value={channel.description}
      fullWidth
      multiline
      rows={7}
    />
  </FormDialog>
}
