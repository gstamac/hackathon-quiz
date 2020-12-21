import {
  MessageEncryptionHeader,
  MessageTemplateEncryptedText,
  MessageTemplateMedia,
} from '@globalid/messaging-service-sdk'
import { MaybeMocked } from 'ts-jest/dist/util/testing'
import { mocked } from 'ts-jest/utils'
import {
  channelWithParticipantsTypeGroup,
  channelWithParticipantsTypeMulti,
  channelWithParticipantsTypePersonal,
  messageMock,
  toChannelWithParsedMessage,
} from '../../../../tests/mocks/channels_mock'
import {
  encryptedChannelSecretMock,
  encryptedMessageContentMock,
} from '../../../../tests/mocks/device_key_manager_mocks'
import { publicIdentityMock } from '../../../../tests/mocks/identity_mock'
import {
  assetImageMock,
  cardViewInvitationMessageMock,
  invitationCardViewMessageContent,
  messageMediaMock,
  messageMediaWithEncryptedTextMock,
  messageMediaWithTextMock,
} from '../../../../tests/mocks/messages_mock'
import { ChannelType, ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'
import { getString, getStringWithText } from '../../../utils'
import * as messagesUtils from '../../../utils/messages_utils'
import { IdentityByUUID } from '../interfaces'
import { MessageType } from '../messenger_chat/interfaces'
import {
  getChannelParticipant,
  getChannelParticipantsByChannelType,
  getLastMessageAuthor,
  getMessageAuthorName,
  getLastMessage,
  getImageTextBasedOnAuthorAssetsAndText,
} from './channels_list_item_helpers'
import { deviceKeyManager } from '../../../init'
import * as messagesSlice from '../../../store/messages_slice'

jest.mock('../../../init')

describe('Channel list item helpers', () => {
  const groupTypeChannelMock: ChannelWithParticipantsAndParsedMessage =
    toChannelWithParsedMessage(channelWithParticipantsTypeGroup)

  const multiTypeChannelMock: ChannelWithParticipantsAndParsedMessage =
    toChannelWithParsedMessage(channelWithParticipantsTypeMulti)

  const personalTypeChannelMock: ChannelWithParticipantsAndParsedMessage =
    toChannelWithParsedMessage(channelWithParticipantsTypePersonal)

  const identitiesMock: IdentityByUUID = {
    'participant_1': { ...publicIdentityMock, gid_uuid: 'participant_1' },
    'participant_2': { ...publicIdentityMock, gid_uuid: 'participant_2' },
    '6196ffd4-d433-49d2-a658-6ca9122ffe32': publicIdentityMock,
    '6022a28e-cf69-4dfd-8ddb-46668b5cb7a2': { ...publicIdentityMock, gid_uuid: '6022a28e-cf69-4dfd-8ddb-46668b5cb7a2', gid_name: 'globaliD_notice' },
  }

  const deviceKeyManagerDecryptMock: MaybeMocked<typeof deviceKeyManager.decrypt> = mocked(deviceKeyManager.decrypt)

  const getEncryptedMessageContentSpy: jest.SpyInstance = jest.spyOn(messagesUtils, 'getEncryptedMessageContent')
  const getEncryptedMediaMessageContentSpy: jest.SpyInstance = jest.spyOn(messagesSlice, 'getEncryptedMediaMessageContent')
  const getMediaMessageContentSpy: jest.SpyInstance = jest.spyOn(messagesSlice, 'getMediaMessageContent')

  describe('getMessageAuthorName', () => {
    it('should return "author:" if channel type is GROUP', () => {
      expect(getMessageAuthorName(groupTypeChannelMock, 'author', true)).toEqual('author:')
    })

    it('should not return owner tag if channel type is GROUP and owner is hidden', () => {
      const groupTypeChannelWithAuthorMock: ChannelWithParticipantsAndParsedMessage = {
        ...groupTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          author: 'created_by',
        },
      }

      expect(getMessageAuthorName(groupTypeChannelWithAuthorMock, 'created_by', false)).toEqual('created_by:')
    })

    it('should return ":" if channel type is GROUP and gid name is undefined', () => {
      const groupTypeChannelWithAuthorMock: ChannelWithParticipantsAndParsedMessage = {
        ...groupTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          author: 'created_by',
        },
      }

      expect(getMessageAuthorName(groupTypeChannelWithAuthorMock, 'created_by', true))
        .toEqual(`created_by ${getString('group-owner')}:`)
    })

    it('should return "author:" if channel type is MULTI', () => {
      expect(getMessageAuthorName(multiTypeChannelMock, 'author', true)).toEqual('author:')
    })

    it('should return empty string if channel type is PERSONAL', () => {
      expect(getMessageAuthorName(personalTypeChannelMock, '', true)).toEqual('')
    })

    it('should return empty string if message type is DELETED', () => {
      expect(getMessageAuthorName(personalTypeChannelMock, '', true)).toEqual('')
    })
  })

  describe('getChannelParticipant', () => {
    it('should return public identity', () => {
      expect(getChannelParticipant(identitiesMock, 'participant_1')).toEqual({
        ...identitiesMock.participant_1,
      })
    })

    it('should return undefined for null identities', () => {
      expect(getChannelParticipant(null, 'participant_1')).toBeUndefined()
    })
  })

  describe('getChannelParticipantsByChannelType', () => {
    it('should return an array with all participants', () => {
      expect(getChannelParticipantsByChannelType(
        identitiesMock,
        ChannelType.MULTI,
        ['participant_1', 'participant_2'])
      ).toEqual([
        { ...publicIdentityMock, gid_uuid: 'participant_1' },
        { ...publicIdentityMock, gid_uuid: 'participant_2' },
      ])
    })

    it('should return an array with first participant', () => {
      expect(getChannelParticipantsByChannelType(
        identitiesMock,
        ChannelType.PERSONAL,
        ['participant_1'])
      ).toEqual([{ ...publicIdentityMock, gid_uuid: 'participant_1' }])
    })

    it('should return empty array if channel type is GROUP', () => {
      expect(getChannelParticipantsByChannelType(
        identitiesMock,
        ChannelType.GROUP,
        ['participant_1'])
      ).toEqual([])
    })
  })

  describe('getLastMessageAuthor', () => {
    const multiTypeChannelWithAuthorMock: ChannelWithParticipantsAndParsedMessage = {
      ...multiTypeChannelMock,
      message: {
        ...messageMock,
        parsedContent: messageMock.content,
        author: 'participant_1',
      },
    }

    const groupTypeChannelWithAuthorMock: ChannelWithParticipantsAndParsedMessage = {
      ...groupTypeChannelMock,
      message: {
        ...messageMock,
        parsedContent: messageMock.content,
        author: 'participant_2',
      },
    }

    it('should return author if channel type is MULTI or GROUP', () => {
      expect(getLastMessageAuthor(identitiesMock, multiTypeChannelWithAuthorMock)).toEqual({
        ...publicIdentityMock,
        gid_uuid: 'participant_1',
      })

      expect(getLastMessageAuthor(identitiesMock, groupTypeChannelWithAuthorMock)).toEqual({
        ...publicIdentityMock,
        gid_uuid: 'participant_2',
      })
    })

    it('should return undefined if channel type is MULTI or GROUP and author hasn\'t been found in participants', () => {
      expect(getLastMessageAuthor(identitiesMock, multiTypeChannelMock)).toBeUndefined()
      expect(getLastMessageAuthor(identitiesMock, groupTypeChannelMock)).toBeUndefined()
    })

    it('should return undefined if channel type is PERSONAL', () => {
      expect(getLastMessageAuthor(identitiesMock, personalTypeChannelMock)).toBeUndefined()
    })
  })

  describe('getLastMessage', () => {
    it('should return "You deleted the message" when message was deleted by a logged in identity', async () => {
      const channelWithDeletedMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          type: MessageType.DELETED,
          deleted_by: publicIdentityMock.gid_name,
          content: JSON.stringify({ text: getString('you-deleted-msg')}),
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithDeletedMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock)
      ).toEqual({ text: 'You deleted the message' })
    })

    it('should return "gid name deleted the message" when a message was deleted by a non logged in identity', async () => {
      const channelWithDeletedMessageMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          type: MessageType.DELETED,
          deleted_by: 'participant_2',
          content: JSON.stringify({ text: `Message deleted by ${publicIdentityMock.gid_name}`}),
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(channelWithDeletedMessageMock, identitiesMock, publicIdentityMock))
        .toEqual({ text: `Message deleted by ${publicIdentityMock.gid_name}`, showAuthor: false })
    })

    it('should return "you sent an image" when a logged in identity sends an image', async () => {
      const channelWithImageMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          content: JSON.stringify({
            list_view_type: 'HORIZONTAL',
            assets: [assetImageMock],
          }),
          parsedContent: messageMock.content,
          type: MessageType.MEDIA,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithImageMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock
      )).toEqual({text: getString('you-sent-image')})
    })

    it('should return "gid name sent an image" when a non logged in identity sends an image', async () => {
      const channelWithImageMessageMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          content: JSON.stringify({
            list_view_type: 'HORIZONTAL',
            assets: [assetImageMock],
          }),
          parsedContent: messageMock.content,
          type: MessageType.MEDIA,
          author: 'participant_1',
        },
      }

      expect(await getLastMessage(channelWithImageMessageMock, identitiesMock, publicIdentityMock))
        .toEqual({text: `${publicIdentityMock.gid_name} sent an image` })
    })

    it('should return text when message type is CARD_VIEW', async () => {
      const channelWithBotMessageMock: ChannelWithParticipantsAndParsedMessage = {
        ...channelWithParticipantsTypePersonal,
        message: {...cardViewInvitationMessageMock},
      }

      expect(await getLastMessage(
        channelWithBotMessageMock,
        identitiesMock,
        publicIdentityMock
      )).toEqual({text: invitationCardViewMessageContent.text})
    })

    it('should return decrypted text when message was encrypted', async () => {
      const encryptionHeader: MessageEncryptionHeader = {
        enc: 'enc',
        iv: 'iv',
      }

      const response: MessageTemplateEncryptedText = {
        encryption_header: encryptionHeader,
        ciphertext: 'ciphertext',
      }

      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getEncryptedMessageContentSpy.mockReturnValue(response)

      const channelWithEncryptedTextMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          type: MessageType.ENCRYPTED_TEXT,
          content: JSON.stringify(encryptedMessageContentMock),
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithEncryptedTextMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: 'text', showAuthor: true })
    })

    it('should return null when decrypted content is null', async () => {
      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getEncryptedMessageContentSpy.mockReturnValue(null)

      const channelWithEncryptedTextMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMock,
          parsedContent: messageMock.content,
          type: MessageType.ENCRYPTED_TEXT,
          content: JSON.stringify(encryptedMessageContentMock),
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithEncryptedTextMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: null })
    })

    it('should return decrypted text when media message was encrypted', async () => {
      const encryptionHeader: MessageEncryptionHeader = {
        enc: 'enc',
        iv: 'iv',
      }

      const response: MessageTemplateEncryptedText = {
        encryption_header: encryptionHeader,
        ciphertext: 'ciphertext',
      }

      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getEncryptedMediaMessageContentSpy.mockReturnValue(response)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithEncryptedTextMock,
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_ENCRYPTED_TEXT,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: 'text', showAuthor: true })
    })

    it('should return "you sent an image" when media message was encrypted with empty text and 1 image asset sent by you', async () => {
      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getEncryptedMediaMessageContentSpy.mockReturnValue(null)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithEncryptedTextMock,
          content: messageMediaMock.content,
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_ENCRYPTED_TEXT,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: getString('you-sent-image') })
    })

    it('should return "you sent images" when media message was encrypted with empty text and 1 image asset sent by you', async () => {
      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getEncryptedMediaMessageContentSpy.mockReturnValue(null)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithEncryptedTextMock,
          content: JSON.stringify({
            list_view_type: 'HORIZONTAL',
            assets: [assetImageMock, assetImageMock],
          }),
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_ENCRYPTED_TEXT,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: getString('you-sent-images') })
    })

    it('should return text when media message has text', async () => {
      const response: MessageTemplateMedia = { ...JSON.parse(messageMediaWithTextMock.content) }

      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getMediaMessageContentSpy.mockReturnValue(response)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithTextMock,
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_TEXT,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: 'text', showAuthor: true })
    })

    it('should return "you sent an image" when media message has image and empty text', async () => {
      const response: MessageTemplateMedia = { ...JSON.parse(messageMediaWithTextMock.content), text: '' }

      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getMediaMessageContentSpy.mockReturnValue(response)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithTextMock,
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_TEXT,
          author: publicIdentityMock.gid_uuid,
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: getString('you-sent-image') })
    })

    it('should return "user sent images" when media message has images and empty text', async () => {
      const response: MessageTemplateMedia = { ...JSON.parse(messageMediaWithTextMock.content), text: '', assets: [assetImageMock, assetImageMock]}

      deviceKeyManagerDecryptMock.mockResolvedValue('text')
      getMediaMessageContentSpy.mockReturnValue(response)

      const channelWithMediaMessageLoggedInIdentityMock: ChannelWithParticipantsAndParsedMessage = {
        ...multiTypeChannelMock,
        message: {
          ...messageMediaWithTextMock,
          content: JSON.stringify({
            list_view_type: 'HORIZONTAL',
            assets: [assetImageMock, assetImageMock],
          }),
          parsedContent: messageMock.content,
          type: MessageType.MEDIA_WITH_TEXT,
          author: 'participant_2',
        },
      }

      expect(await getLastMessage(
        channelWithMediaMessageLoggedInIdentityMock,
        identitiesMock,
        publicIdentityMock,
        encryptedChannelSecretMock)
      ).toEqual({ text: getStringWithText('user-sent-images', [{match: 'user', replace: publicIdentityMock.display_name}]) })
    })
  })

  describe('getImageTextBasedOnAuthorAssetsAndText', () => {
    it('should return "gid name sent an image" when there is 1 image asset', () => {
      expect(getImageTextBasedOnAuthorAssetsAndText(
        messageMediaWithTextMock,
        JSON.parse(messageMediaWithTextMock.content),
        'text',
        identitiesMock,
        publicIdentityMock,
      )).toEqual(getStringWithText('user-sent-image', [{ match: 'user', replace: publicIdentityMock.gid_name}]))
    })

    it('should return "gid name sent images" when there is 2+ image asset', () => {
      const contentMock: MessageTemplateMedia = {
        list_view_type: 'HORIZONTAL',
        assets: [assetImageMock, assetImageMock],
      }

      expect(getImageTextBasedOnAuthorAssetsAndText(
        messageMediaWithTextMock,
        contentMock,
        'text',
        identitiesMock,
        publicIdentityMock,
      )).toEqual(getStringWithText('user-sent-images', [{ match: 'user', replace: publicIdentityMock.gid_name}]))
    })

    it('should return "you sent an image" when there is 1 image asset and you are the author', () => {
      expect(getImageTextBasedOnAuthorAssetsAndText(
        messageMediaWithTextMock,
        JSON.parse(messageMediaWithTextMock.content),
        '',
        identitiesMock,
        publicIdentityMock,
      )).toEqual(getString('you-sent-image'))
    })

    it('should return "you sent an image" when there is 1 image asset and you are the author and text is empty', () => {
      const contentMock: MessageTemplateMedia = {
        list_view_type: 'HORIZONTAL',
        assets: [assetImageMock, assetImageMock],
      }

      expect(getImageTextBasedOnAuthorAssetsAndText(
        messageMediaWithTextMock,
        contentMock,
        '',
        identitiesMock,
        publicIdentityMock,
      )).toEqual(getString('you-sent-images'))
    })

    it('should return empty string when there is 1 image asset', () => {
      expect(getImageTextBasedOnAuthorAssetsAndText(
        { ...messageMediaWithTextMock, author: 'someone else' },
        JSON.parse(messageMediaWithTextMock.content),
        'text',
        identitiesMock,
        publicIdentityMock,
      )).toEqual('')
    })
  })
})
