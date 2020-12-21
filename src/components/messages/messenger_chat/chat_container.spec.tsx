import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../tests/test_utils'
import { getChannelMessages } from '../../../services/api/messaging_api'
import { getChannelMembers } from '../../../services/api/channels_api'
import { store } from '../../../store'
import { setChannel, setMembers } from '../../../store/channels_slice/channels_slice'
import { setChannelMessages } from '../../../store/messages_slice'
import { ChatContainer } from './chat_container'
import { MessagesType } from '../interfaces'
import { getChannelResponseMock } from '../../../../tests/mocks/channels_mocks'
import { getChannelMessagesResponseMock } from '../../../../tests/mocks/messages_mock'
import { identitiesArrayMock, identityMock } from '../../../../tests/mocks/identity_mock'
import { mocked } from 'ts-jest/utils'

jest.mock('../../../services/api/messaging_api')
jest.mock('../../../services/api/channels_api')

Element.prototype.scrollTo = () => ({})

describe('Chat container tests', () => {

  describe('Group chat container tests', () => {

    let renderResult: RenderResult

    mocked(getChannelMessages)
    const getMembersMock = mocked(getChannelMembers)

    const channel_id: string = getChannelResponseMock.id

    const renderChatContainer = async (type: MessagesType = MessagesType.GROUPS): Promise<void> => {
      await act(async () => {
        renderResult = render(
          <ChatContainer messagesType={type} channelId={channel_id}/>
        )
      })
    }

    beforeAll(() => {
      store.dispatch(setMembers([identityMock]))
    })

    beforeEach(() => {
      getMembersMock.mockResolvedValue(identitiesArrayMock)
    })

    afterEach(() => {
      cleanup()
      jest.resetAllMocks()
    })

    it('should render loader when channel, channel messages and participants are not loaded', async () => {
      await renderChatContainer()

      const loader: Element | null = renderResult.getByTestId('globalid-loader')

      expect(loader).not.toBeNull()
    })

    it('should render loader when channel is loaded but messages are undefined', async () => {
      store.dispatch(setChannel(getChannelResponseMock))
      await renderChatContainer()

      const loader: Element[] | null = renderResult.getAllByTestId('globalid-loader')

      expect(loader).not.toBeNull()
    })

    it('should render messages when channel, messages and identity are loaded', async () => {
      store.dispatch(setChannel(getChannelResponseMock))
      store.dispatch(setChannelMessages({
        key: channel_id,
        value: getChannelMessagesResponseMock,
      }))

      await renderChatContainer()

      const chatMessages: Element | null = renderResult.getByTestId('scroll-container')

      expect(chatMessages).not.toBeNull()
    })

    it('Should render the Messages Input Component in messages page', async () => {

      await renderChatContainer()

      const messageField: Element = renderResult.getByRole('textbox')

      expect(messageField).toBeDefined()
    })
  })
})
