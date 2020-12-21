import React from 'react'
import { JoinGroupDialog } from './join_group_dialog'
import { JoinGroupDialogProps } from './interfaces'
import { getString } from '../../../../utils'
import { act, cleanup, render, userEvent, RenderResult } from '../../../../../tests/test_utils'

describe('JoinGroupDialog', () => {
  let renderResult: RenderResult

  const groupName: string = 'Opica'
  const onExitMock: jest.Mock = jest.fn()
  const onFormSubmitMock: jest.Mock = jest.fn().mockResolvedValue(undefined)
  const joinGroupDialogProperties: JoinGroupDialogProps = {
    formId: 'test-form',
    fieldDefinition: {},
    groupName,
    onExit: onExitMock,
    onFormSubmit: onFormSubmitMock,
    open: true,
    switchFieldId: 'switch-field',
  }

  const renderJoinGroupDialog = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(
        <JoinGroupDialog {...joinGroupDialogProperties } />
      )
    })
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render join group dialog', async () => {
    await renderJoinGroupDialog()

    const dialogTitle: Element = renderResult.getByText(getString('join-group-title'))
    const dialogSubtitle: Element = renderResult.getByText(getString('join-group-dialog-subtitle').replace('{group}', groupName))
    const dialogDescription: Element = renderResult.getByText(getString('join-group-visibility-description'))
    const switchComponent: Element = renderResult.getByRole('checkbox')
    const joinGroupButton: Element = renderResult.getByText(getString('join-group-button'))
    const cancelButton: Element = renderResult.getByText(getString('button-text-cancel'))

    expect(dialogTitle).toBeDefined()
    expect(dialogSubtitle).toBeDefined()
    expect(dialogDescription).toBeDefined()
    expect(joinGroupButton).toBeDefined()
    expect(switchComponent).toBeDefined()
    expect(cancelButton).toBeDefined()
  })

  it('should call onFormSubmit when clicking join group button', async () => {
    await renderJoinGroupDialog()

    const joinGroupButton: Element = renderResult.getByText(getString('join-group-button'))

    act(() => {
      userEvent.click(joinGroupButton)
    })

    expect(onFormSubmitMock).toHaveBeenCalledTimes(1)
  })

  it('should call onExit when clicking cancel button', async () => {
    await renderJoinGroupDialog()

    const cancelButton: Element = renderResult.getByText(getString('button-text-cancel'))

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(1)
  })

  it('should call onExit when clicking close button', async () => {
    await renderJoinGroupDialog()

    const closeButton: Element = renderResult.getByAltText('close')

    expect(closeButton).not.toBeNull()

    act(() => {
      userEvent.click(closeButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(1)
  })
})
