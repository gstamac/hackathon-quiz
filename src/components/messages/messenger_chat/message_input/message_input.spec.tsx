import React from 'react'
import { MessageInputProps } from './interfaces'
import { MessageInput } from './message_input'
import { act } from 'react-dom/test-utils'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core'
import { userEvent, RenderResult, render, cleanup } from '../../../../../tests/test_utils'
import { sendImageToChannel, sendMessageToChannel } from '../../../../utils/messages_utils'
import { store } from '../../../../store'
import { setChannel } from '../../../../store/channels_slice/channels_slice'
import { channelWithMoreParticipantsMock } from '../../../../../tests/mocks/channels_mock'
import { fireEvent } from '@testing-library/react'
import { eventMock, invalidEventMock } from '../../../../../tests/mocks/messages_mock'
import { mocked } from 'ts-jest/utils'
import { getChannelMembers } from '../../../../services/api/channels_api'
import { identitiesArrayMock } from '../../../../../tests/mocks/identity_mock'
import { getAvatar } from '../../../../services/api/avatar_api'

jest.mock('../../../../services/api/messaging_api')
jest.mock('../../../../services/api/channels_api')
jest.mock('../../../../utils/messages_utils')
jest.mock('../../../../services/api/avatar_api')
jest.mock('@reduxjs/toolkit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('@reduxjs/toolkit') as {},
  unwrapResult: jest.fn().mockReturnValue([]),
}))

describe('Message input', () => {

  const handleOnSend = mocked(sendMessageToChannel)
  const sendImageMock = mocked(sendImageToChannel)
  const getMembersMock = mocked(getChannelMembers)
  const getAvatarMock = mocked(getAvatar)

  let renderResult: RenderResult

  const defaultProps: MessageInputProps = {
    disabled: false,
    isMobile: false,
    gid_uuid: 'gid_uuid',
    channel_id: channelWithMoreParticipantsMock.id,
  }

  const renderMessageInput = async (props: MessageInputProps = defaultProps): Promise<void> => {
    await act(async () => {
      renderResult = render(<MuiThemeProvider theme={mainTheme}><MessageInput {...props}/></MuiThemeProvider>)
    })
  }

  beforeAll(() => {
    store.dispatch(setChannel({...channelWithMoreParticipantsMock, title: 'Channel title'}))
  })

  beforeEach(() => {
    getMembersMock.mockResolvedValue(identitiesArrayMock)
    getAvatarMock.mockResolvedValue('test')
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should display component', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')

    expect(messageField).toBeDefined()

    const sendButton = renderResult.container.querySelector('span') as HTMLSpanElement

    expect(sendButton).toBeDefined()
  })

  it('should call onSend on click', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')

    expect(messageField).toBeDefined()
    const textWritten: string = 'tt'

    await userEvent.type(messageField, textWritten)

    const sendButton = renderResult.container.querySelector('span') as HTMLSpanElement

    expect(sendButton).toBeDefined()
    expect(sendButton).toBeEnabled()

    act(() => {
      userEvent.click(sendButton)
    })

    expect(handleOnSend).toHaveBeenCalled()
    expect(handleOnSend.mock.calls).toHaveLength(1)
    expect(handleOnSend.mock.calls[0][0]).toBe(textWritten)
  })

  it('should not call onSend function after clicking to send button when text has only empty spaces', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')

    expect(messageField).toBeDefined()
    const textWritten: string = '          '

    await userEvent.type(messageField, textWritten)

    const sendButton = renderResult.container.querySelector('span') as HTMLSpanElement

    act(() => {
      userEvent.click(sendButton)
    })

    expect(handleOnSend).not.toHaveBeenCalled()
  })

  it('should call onSend on keypress ENTER', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')
    const textWritten: string = 'test'

    await userEvent.type(messageField, `${textWritten}{enter}`)

    expect(handleOnSend).toHaveBeenCalled()
  })

  it('should not call onSend on keypress ENTER action when provided text has only empty spaces', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')
    const textWritten: string = '          '

    await userEvent.type(messageField, `${textWritten}{enter}`)

    expect(handleOnSend).not.toHaveBeenCalled()
  })

  it('should render disabled sendButton when input is empty', async () => {
    await renderMessageInput()

    const messageField = renderResult.getByRole('textbox')
    const textWritten: string = 't'

    await userEvent.type(messageField, textWritten)
    await userEvent.type(messageField, '{backspace}')

    const sendButton = renderResult.container.querySelector('span') as HTMLSpanElement

    expect(sendButton).toBeEnabled()
  })

  it('should call sendImage function on click', async () => {
    await renderMessageInput()

    const input: Element = renderResult.getByTestId('image_upload')

    act(() => {
      userEvent.click(input)
    })

    act(() => {
      fireEvent.change(input, eventMock)
    })

    const sendButton: Element = renderResult.getByTestId('send_button')

    act(() => {
      userEvent.click(sendButton)
    })

    expect(sendImageMock).toHaveBeenCalled()
    expect(sendImageMock.mock.calls).toHaveLength(1)
  })

  it('should not display Input Adornment when user selects too small image', async () => {
    await renderMessageInput()

    const input: Element = renderResult.getByTestId('image_upload')

    act(() => {
      userEvent.click(input)
    })

    act(() => {
      fireEvent.change(input, invalidEventMock)
    })

    const fileAdornment: Element | null = renderResult.queryByText('test.jpg')

    expect(fileAdornment).toBeNull()
  })

  it('should display Input Adornment when user selects an image and remove it when a user removes the selected image', async () => {
    await renderMessageInput()

    const input: Element = renderResult.getByTestId('image_upload')

    act(() => {
      userEvent.click(input)
    })

    expect(input).toBeDefined()

    act(() => {
      fireEvent.change(input, eventMock)
    })

    let fileAdornment: Element | null = renderResult.getByText('test.jpg')

    expect(fileAdornment).not.toBeNull()

    const removeImage: Element = renderResult.getByAltText('remove_image')

    act(() => {
      userEvent.click(removeImage)
    })

    fileAdornment = renderResult.queryByText('test.jpg')

    expect(fileAdornment).toBeNull()
  })

  it('should display disabled component', async () => {
    await renderMessageInput({
      ...defaultProps,
      disabled: true,
    })

    const messageField = renderResult.queryByPlaceholderText('Only group admin can send messages in the channel with hidden group members.')

    expect(messageField).toBeDefined()
  })

  it('should not render when channel is not fetched yet', async () => {
    await renderMessageInput({
      ...defaultProps,
      channel_id: 'not_fetched_yet',
    })

    const sendButton: HTMLElement | null = renderResult.queryByTestId('send_button')

    expect(sendButton).toBeNull()
  })
})
