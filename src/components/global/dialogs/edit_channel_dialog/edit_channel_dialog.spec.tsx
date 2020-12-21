import React from 'react'
import { RenderResult, render, act, cleanup, userEvent } from '../../../../../tests/test_utils'
import { EditChannelDialog } from './edit_channel_dialog'
import { EditChannelProps } from './interfaces'
import { updateChannelPropsMock } from '../../../../../tests/mocks/channels_mock'
import { getString } from '../../../../utils'

describe('Edit channel dialog tests', () => {

  let renderResult: RenderResult

  const props: EditChannelProps = {
    formKey: 'formKey',
    channel: updateChannelPropsMock,
    title: 'title',
    open: true,
    onFormSubmit: jest.fn(),
    onExit: jest.fn(),
  }

  const renderDialog = (): void => {
    act(() => {
      renderResult = render(
        <EditChannelDialog {...props } />
      )
    })
  }

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    renderDialog()
  })

  it('should render dialog', () => {
    const title: Element | null = renderResult.queryByText(getString('edit-conversation-dialog-title'))
    const formSubtitle: Element | null = renderResult.queryByText(getString('edit-conversation-dialog-subtitle'))
    const formTitle: Element | null = renderResult.queryByText(getString('edit-conversation-dialog-description'))
    const submitButton: Element | null = renderResult.queryByRole('button')
    const inputElements: Element[] = renderResult.queryAllByRole('textbox')

    expect(title).not.toBeNull()
    expect(formSubtitle).not.toBeNull()
    expect(formTitle).not.toBeNull()
    expect(submitButton).not.toBeNull()
    expect(inputElements).toHaveLength(2)
  })

  it('should call onExit when clicking close button', async () => {
    const closeButton: Element = renderResult.getByAltText('close')

    expect(closeButton).not.toBeNull()

    act(() => {
      userEvent.click(closeButton)
    })

    expect(props.onExit).toHaveBeenCalledTimes(1)
  })
})
