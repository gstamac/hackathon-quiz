import { messageCardByType, TextOrEncryptedTextMessageCard, CardViewMessageCardComponent } from './get_messages_card_by_type'
import { publicIdentityMock } from '../../../../tests/mocks/identity_mock'
import { ChannelType } from '../../../store/interfaces'
import { ChatMessageCards, MessageCardByTypeMap } from './interfaces'
import { SystemMessageCard, TextMessageCard, DeletedMessageCard } from './chat_message_cards'
import React from 'react'
import { IdentityByUUID } from '../interfaces'
import {
  messageDataMock,
  systemMessageDataMock,
  messageSendImageMock,
  deletedMessageDataMock,
  unsupportedMessageDataMock,
  cardViewInvitationMessageMock,
  cardViewMessageButton,
} from '../../../../tests/mocks/messages_mock'
import { ImageMessageCard } from './chat_message_cards/image_message_card'
import { UnsupportedMessageCard } from './chat_message_cards/unsupported_message_card'

describe('MessageCardByType', () => {

  const participants: IdentityByUUID = {
    'participant_1': { ...publicIdentityMock, gid_uuid: 'participant_1' },
    'participant_2': { ...publicIdentityMock, gid_uuid: 'participant_2' },
  }

  const mapMessageCallback: MessageCardByTypeMap =
    messageCardByType(publicIdentityMock, undefined, participants, 'seen_id', ChannelType.MULTI, true)

  it('Should return SystemMessageCard', () => {
    const messageCard: ChatMessageCards = <SystemMessageCard text='system message'/>

    const message: ChatMessageCards = mapMessageCallback(null, systemMessageDataMock, null)

    expect(message?.props).toEqual(messageCard.props)
    expect(message?.type).toEqual(messageCard.type)
  })

  it('Should return DeletedMessageCard', () => {
    const messageCard: ChatMessageCards =
      <DeletedMessageCard
        channelType={ChannelType.MULTI}
        seen={false}
        me={publicIdentityMock}
        messageContext={{ prevMessage: null, message: deletedMessageDataMock, nextMessage: null }}
        hideOwner={false}
      />

    const message: ChatMessageCards = mapMessageCallback(null, deletedMessageDataMock, null)

    expect(message?.type).toEqual(messageCard.type)
    expect(message?.props).toEqual(messageCard.props)
  })

  it('Should return ImageMessageCard', () => {
    const messageCard: ChatMessageCards = <ImageMessageCard
      channelType={ChannelType.MULTI}
      seen={false}
      me={publicIdentityMock}
      messageContext={{ prevMessage: null, message: messageSendImageMock, nextMessage: null }}
      hideOwner={false}
    />

    const message: ChatMessageCards = mapMessageCallback(null, messageSendImageMock, null)

    expect(message?.props).toEqual(messageCard.props)
    expect(message?.type).toEqual(messageCard.type)
  })

  it('Should return TextMessageCard', () => {
    const mapMessageCallbackTextMessage: MessageCardByTypeMap =
      messageCardByType(publicIdentityMock, undefined, participants, 'seen_id', ChannelType.MULTI, true, '', false)

    const messageCard: ChatMessageCards = <TextMessageCard
      channelType={ChannelType.MULTI}
      seen={false}
      me={publicIdentityMock}
      messageContext={{ prevMessage: null, message: messageDataMock, nextMessage: null }}
      hideOwner={false}
      isHiddenMember={false}
      admin={undefined}
      author={undefined}
      encryptedChannelSecret={''}
    />

    const message: ChatMessageCards = mapMessageCallbackTextMessage(null, messageDataMock, null)

    expect(message?.props).toEqual(expect.objectContaining(messageCard.props))
  })

  it('Should return UnsupportedMessageCard', () => {
    const messageCard: ChatMessageCards = <UnsupportedMessageCard
      channelType={ChannelType.MULTI}
      seen={false}
      me={publicIdentityMock}
      messageContext={{ prevMessage: null, message: unsupportedMessageDataMock, nextMessage: null }}
      hideOwner={false}/>

    const message: ChatMessageCards = mapMessageCallback(null, unsupportedMessageDataMock, null)

    expect(message?.props).toEqual(messageCard.props)
    expect(message?.type).toEqual(messageCard.type)
  })

  it('Should return UnsupportedMessageCard when type is TEXT but parsedContent is missing', () => {
    const message: ChatMessageCards = mapMessageCallback(null, { ...messageDataMock, parsedContent: null }, null)

    expect(message?.type).toEqual(TextOrEncryptedTextMessageCard)
  })

  it('Should return UnsupportedMessageCard when CardView message contents is not supported', () => {
    const message: ChatMessageCards = mapMessageCallback(null, {
      ...cardViewInvitationMessageMock,
      content: JSON.stringify({
        'text': 'Join the group New group for Hex',
        'elements': {
          'title_text': 'You have been invited to',
          'primary_text': 'Join the group New group for Hex',
          'secondary_text': 'message',
          'icon': { 'type': 'GROUP_ICON' },
          'buttons': [{ ...cardViewMessageButton, cta_link: 'invalid-url' }, { ...cardViewMessageButton }],
        },
      }),
    }, null)

    expect(message?.type).toEqual(CardViewMessageCardComponent)
  })

  it('Should return CardViewMessageCard when message type is CARD_VIEW', () => {
    const message: ChatMessageCards = mapMessageCallback(null, {
      ...cardViewInvitationMessageMock,
      parsedContent: null,
    }, null)

    expect(message?.type).toEqual(CardViewMessageCardComponent)
  })
})
