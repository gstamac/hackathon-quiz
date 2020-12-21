import React, { useEffect } from 'react'
import { DialogActions } from '@material-ui/core'
import { useStyles } from './styles'
import {
  ButtonState,
  DefaultFormButton,
  Dialog as GlobaliDDialog,
  Form,
  FormSubmissionState,
  SecondaryButton,
} from 'globalid-react-ui'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { FormDialogProps } from '../interfaces'
import { getString } from '../../../../utils'
import clsx from 'clsx'
import ReactHTMLParser from 'react-html-parser'
import { useIsMobileView } from '../../helpers'

// eslint-disable-next-line complexity
export const FormDialog: React.FC<FormDialogProps> = (props: FormDialogProps) => {
  const {
    title,
    open,
    fullScreenOnMobile = false,
    showCancelButton = false,
    formCancelButtonText,
    formSubmitButtonText,
    children,
    onExit,
    formId,
    fieldId,
    onFormChange,
    onFormSubmit,
    fieldDefinition,
    formTitle,
    formSubtitle,
    formDescription,
    onFormLoad,
    adornment,
    dialog,
    submitButtonColor,
    className,
    TransitionComponent: transition,
  } = props

  const classes = useStyles()

  const isMobile: boolean = useIsMobileView()

  const formValueIsReset = useSelector((state: RootState) => (
    state.form.forms[formId]?.has_mounted
    && fieldId !== undefined
    && state.form.forms[formId]?.form_data?.values[fieldId]?.has_changed !== true)
  )

  useEffect(() => {
    if (formValueIsReset && onFormLoad !== undefined) {
      onFormLoad()
    }
  }, [formValueIsReset])

  const formSubmissionState: FormSubmissionState | undefined = useSelector((state: RootState) => state.form.forms[formId]?.form_submission_state)
  const cancelButtonState = formSubmissionState === FormSubmissionState.IN_PROGRESS ? ButtonState.DISABLED : ButtonState.DEFAULT

  return (
    <GlobaliDDialog
      title={title}
      open={open}
      onExit={onExit}
      className={clsx(className, {
        [classes.formDialogDrawer]: isMobile && !fullScreenOnMobile,
      }, dialog)}
      TransitionComponent={transition}
    >
      <Form className={classes.formContainer} formId={formId} onSubmit={onFormSubmit} onChange={onFormChange} fieldDefinition={fieldDefinition}>
        <div className={classes.formContent}>
          {formSubtitle && <div className={classes.formSubtitle}>
            {formSubtitle}
          </div>}
          {formTitle && <div className={classes.formTitle}>
            {formTitle}
          </div>}
          {children}
          {formDescription && <div className={classes.formDescription}>
            {ReactHTMLParser(formDescription)}
          </div>}
        </div>
        <DialogActions className={clsx('dialog-actions', classes.dialogActions)} disableSpacing={true}>
          <DefaultFormButton color={submitButtonColor} className={classes.submitButton}>
            {formSubmitButtonText ?? getString('button-text-save')}
          </DefaultFormButton>
          {(showCancelButton || formCancelButtonText) && <SecondaryButton buttonState={cancelButtonState} onClick={onExit}>
            {formCancelButtonText ?? getString('button-text-cancel')}
          </SecondaryButton>}
        </DialogActions>
        {adornment}
      </Form>
    </GlobaliDDialog>
  )
}
