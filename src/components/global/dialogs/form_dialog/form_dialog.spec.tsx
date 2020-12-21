import React from 'react'
import { RenderResult, render, act, cleanup, userEvent } from '../../../../../tests/test_utils'
import { FormDialog } from './form_dialog'
import { FieldDefinition } from 'globalid-react-ui'
import { FormDialogProps } from '../interfaces'
import { store } from '../../../../store'

jest.useFakeTimers()
describe('FormDialog', () => {

  let renderResult: RenderResult

  const fieldDefinition: FieldDefinition = {
    test: [],
  }

  const props: FormDialogProps = {
    open: true,
    title: 'title',
    formSubmitButtonText: 'formSubmitButtonText',
    formId: 'formId',
    formTitle: 'formTitle',
    formSubtitle: 'formSubtitle',
    formDescription: 'formDescription',
    fieldDefinition,
    onFormSubmit: jest.fn(),
    onExit: jest.fn(),
    onFormLoad: jest.fn(),
  }

  const renderFormDialog = async (dialogProps: FormDialogProps = props): Promise<void> => {
    await act(async () => {
      renderResult = render(
        <FormDialog {...dialogProps } />
      )
    })
  }

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('should render form dialog', async () => {
    await renderFormDialog()

    const title: Element | null = renderResult.queryByText('title')
    const formSubtitle: Element | null = renderResult.queryByText('formSubtitle')
    const formTitle: Element | null = renderResult.queryByText('formTitle')
    const formDescription: Element | null = renderResult.queryByText('formDescription')
    const submitButton: Element | null = renderResult.queryByRole('button')
    const cancelButton: Element | null = renderResult.queryByText('Cancel')

    expect(title).not.toBeNull()
    expect(formSubtitle).not.toBeNull()
    expect(formTitle).not.toBeNull()
    expect(formDescription).not.toBeNull()
    expect(submitButton).not.toBeNull()
    expect(cancelButton).toBeNull()
  })

  it('should init form', async () => {
    await renderFormDialog()

    expect(store.getState().form.forms.formId).toBeDefined()
    expect(store.getState().form.forms.formId.form_data?.values?.test).toBeDefined()
  })

  it('should call onExit when clicking close button', async () => {
    await renderFormDialog()

    const closeButton: Element = renderResult.getByAltText('close')

    expect(closeButton).toBeDefined()

    act(() => {
      userEvent.click(closeButton)
    })

    expect(props.onExit).toHaveBeenCalledTimes(1)
  })

  it('should call onExit when clicking cancel button', async () => {
    await renderFormDialog({ ...props, showCancelButton: true })

    const cancelButton: Element = renderResult.getByText('Cancel')

    expect(cancelButton).toBeDefined()

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(props.onExit).toHaveBeenCalledTimes(1)
  })
})
