import { sentMessage } from './use_message_input'
import * as messages_utils from '../../../../utils/messages_utils'
import { deviceKeyManager } from '../../../../init'
import { messageDataMock, imageFileMock } from '../../../../../tests/mocks/messages_mock'
import { encryptedMessageContentMock } from '../../../../../tests/mocks/device_key_manager_mocks'

jest.mock('../../../../utils/messages_utils')
jest.mock('../../../../init')

describe('Message input hooks', () => {

  const sendMessageToChannelMock: jest.Mock = jest.fn()
  const sendImageToChannelMock: jest.Mock = jest.fn()
  const encryptMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock>messages_utils.sendMessageToChannel) = sendMessageToChannelMock;
    (<jest.Mock>messages_utils.sendImageToChannel) = sendImageToChannelMock;
    (<jest.Mock>deviceKeyManager.encrypt) = encryptMock
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should send text message to back end', async () => {
    sendMessageToChannelMock.mockResolvedValue([messageDataMock])

    const channel_id: string = 'da1cef25-9109-421d-be0f-173f8d78bfc3'
    const gid_uuid: string = 'dbff45d9-2b6b-44b2-b135-0f93cc25e4ac'
    const message = 'Test message.'

    const sendFunction = sentMessage(channel_id, gid_uuid)

    expect(sendFunction).toBeDefined()

    await sendFunction(message)

    expect(sendMessageToChannelMock.mock.calls).toHaveLength(1)
    expect(sendMessageToChannelMock.mock.calls[0][0]).toBe(message)
    expect(sendMessageToChannelMock.mock.calls[0][1]).toBe(channel_id)
    expect(sendMessageToChannelMock.mock.calls[0][2]).toBe(gid_uuid)
  })

  it('Should send encrypted text message to back end', async () => {
    sendMessageToChannelMock.mockResolvedValue([encryptedMessageContentMock])

    const channel_id: string = 'da1cef25-9109-421d-be0f-173f8d78bfc3'
    const gid_uuid: string = 'dbff45d9-2b6b-44b2-b135-0f93cc25e4ac'
    const message = 'Test message.'

    const sendFunction = sentMessage(channel_id, gid_uuid, 'secret')

    expect(sendFunction).toBeDefined()

    await sendFunction(message)

    expect(sendMessageToChannelMock.mock.calls).toHaveLength(1)
    expect(sendMessageToChannelMock.mock.calls[0][0]).toBe(message)
    expect(sendMessageToChannelMock.mock.calls[0][1]).toBe(channel_id)
    expect(sendMessageToChannelMock.mock.calls[0][2]).toBe(gid_uuid)
  })

  it('Should send image message to back end', async () => {
    sendImageToChannelMock.mockResolvedValue([messageDataMock])

    const channel_id: string = 'da1cef25-9109-421d-be0f-173f8d78bfc3'
    const gid_uuid: string = 'dbff45d9-2b6b-44b2-b135-0f93cc25e4ac'
    const imageFile: File = imageFileMock

    const sendFunction = sentMessage(channel_id, gid_uuid)

    expect(sendFunction).toBeDefined()

    await sendFunction(imageFile)

    expect(sendImageToChannelMock.mock.calls).toHaveLength(1)
    expect(sendImageToChannelMock.mock.calls[0][0]).toBe(imageFile)
    expect(sendImageToChannelMock.mock.calls[0][1]).toBe(channel_id)
    expect(sendImageToChannelMock.mock.calls[0][2]).toBe(gid_uuid)
  })
})
