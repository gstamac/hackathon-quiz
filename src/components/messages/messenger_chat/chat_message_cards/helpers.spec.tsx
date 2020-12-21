import {
  getMessageAdornment,
  parseContentWithLinks,
  toastHandler,
  getConversationTypeFromUrl,
  getChannelBeginningText,
  rejectOrApproveAction,
  retrieveMessageCardTypeFromLink,
  checkMessageCardType, retrieveMessageCardTypeFromButtons,
} from './helpers'
import { ConversationType } from '../delete_message/interfaces'
import { MessagesType } from '../../interfaces'
import {
  messageDataMock,
  messageNotDelieveredMock,
  cardViewMessageButton,
} from '../../../../../tests/mocks/messages_mock'
import { ChannelType, InvitationAction } from '../../../../store/interfaces'
import { MessageCardType } from './card_view_message/interfaces'

jest.mock('../../../../init')

describe('Chat message card helpers tests', () => {

  const onRetryClickMock: jest.Mock = jest.fn()
  const dispatcherMock: jest.Mock = jest.fn()
  const toastSetterMock: jest.Mock = jest.fn()

  const isLastMessage: boolean = true
  const isResending: boolean = true
  const adornmentStyle: string = 'adornmentClassName'

  describe('getMessageAdornment', () => {
    it('should return null if message was delivered when channel type is not PERSONAL', () => {
      expect(getMessageAdornment({
        message: messageDataMock,
        channelType: ChannelType.GROUP,
        resending: !isResending,
        adornmentStyle,
        isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
      })).toBeNull()
    })

    it('should return null if message was delivered and is not last message', () => {
      expect(getMessageAdornment({
        message: messageDataMock,
        channelType: ChannelType.PERSONAL,
        resending: !isResending,
        adornmentStyle,
        isLastMessage: !isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
      })).toBeNull()
    })

    it('should return adornment with retry message and adornment style as className', () => {
      const adornment: JSX.Element | null = getMessageAdornment({
        message: messageNotDelieveredMock,
        channelType: ChannelType.GROUP,
        resending: !isResending,
        adornmentStyle,
        isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
      })

      expect(adornment).not.toBeNull()

      expect(adornment?.props.className).toContain(adornmentStyle)
      expect(adornment?.props.children).toContain('Not delivered. Click to retry.')
    })

    it('should return adornment with error message and adornment style as className', () => {
      const adornment: JSX.Element | null = getMessageAdornment({
        message: messageNotDelieveredMock,
        channelType: ChannelType.GROUP,
        resending: !isResending,
        adornmentStyle,
        isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
        errorMessage: 'some_error',
      })

      expect(adornment).not.toBeNull()

      expect(adornment?.props.className).toContain(adornmentStyle)
      expect(adornment?.props.children).toContain('some_error')
    })

    it('should return adornment with sending messages and adornment style as className', () => {
      const adornment: JSX.Element | null = getMessageAdornment({
        message: messageDataMock,
        channelType: ChannelType.GROUP,
        resending: isResending,
        adornmentStyle,
        isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
      })

      expect(adornment).not.toBeNull()

      expect(adornment?.props.className).toContain(adornmentStyle)
      expect(adornment?.props.children).toContain('Sending message ...')
    })

    it('should return adornment with delievered message and adornment style as className when channel type is PERSONAL and last message', () => {
      const adornment: JSX.Element | null = getMessageAdornment({
        message: messageDataMock,
        channelType: ChannelType.PERSONAL,
        resending: !isResending,
        adornmentStyle,
        isLastMessage,
        seen: false,
        onRetry: onRetryClickMock,
      })

      expect(adornment).not.toBeNull()

      expect(adornment?.props.className).toContain(adornmentStyle)
      expect(adornment?.props.children).toContain('Delivered')
    })

    it('should return adornment with seen message and adornment style as className when channel type is PERSONAL and last seen message', () => {
      const adornment: JSX.Element | null = getMessageAdornment({
        message: messageDataMock,
        channelType: ChannelType.PERSONAL,
        resending: !isResending,
        adornmentStyle,
        isLastMessage,
        seen: true,
        onRetry: onRetryClickMock,
      })

      expect(adornment).not.toBeNull()

      expect(adornment?.props.className).toContain(adornmentStyle)
      expect(adornment?.props.children).toContain('Seen')
    })
  })

  describe('parseContentWithLinks', () => {
    it('should return text without links', () => {
      const text: string = 'Some text without links'

      const textComponent = parseContentWithLinks(text)

      expect(textComponent).toContain(text)
    })

    it('should return text with links', () => {
      const link: string = 'https://test.link'
      const text: string = 'Some text with links '
      const textWithLink: string = `${text}${link}`

      const textComponent = parseContentWithLinks(textWithLink)

      expect(textComponent[0]).toContain(text)
      expect(textComponent[1].props.href).toEqual(link)
      expect(textComponent[1].props.children).toContain(link)
    })
  })

  describe('toastHandler', () => {
    it('should call dispatcher and toastSetter accordingly with the provided parameters', () => {
      const title: string = 'title'
      const message: string = 'message'
      const dispatcher_input: string = 'dispatcher_input'

      toastSetterMock.mockReturnValue(dispatcher_input)

      toastHandler(dispatcherMock, toastSetterMock, title, message)

      expect(toastSetterMock).toHaveBeenCalledWith({ title, message })
      expect(dispatcherMock).toHaveBeenCalledWith(dispatcher_input)
    })
  })

  describe('getConversationTypeFromUrl', () => {
    it('should return the correct conversationType from the url', () => {
      const match = {
        params: { type: MessagesType.GROUPS },
        isExact: true,
        path: 'path',
        url: 'url',
      }

      expect(getConversationTypeFromUrl(match)).toEqual(ConversationType.GROUP)
    })
  })

  describe('getChatBeginningText', () => {
    it('should return the correct beginning text when encryption is disabled', () => {
      expect(getChannelBeginningText(ChannelType.GROUP, '')).toEqual('This is the beginning of the group channel history')
    })

    it('should return the correct beginning text when encryption is enabled in multi-person chat', () => {
      expect(getChannelBeginningText(ChannelType.MULTI, 'stage2, stage2, ...')).toEqual('This is the beginning of your chat history with stage2, stage2, ...')
    })

    it('should return the correct beginning text when encryption is enabled in single-person chat', () => {
      expect(getChannelBeginningText(ChannelType.PERSONAL, 'participant_1')).toEqual('This is the beginning of your chat history with participant_1')
    })
  })

  describe('checkMessageCardType', () => {
    it('should return true when provided messageCardType url rule passes', () => {
      expect(checkMessageCardType([cardViewMessageButton],MessageCardType.GROUP_INVITATION)).toEqual(true)
    })

    it('should return false when provided messageCardType url rule doesn\'t pass', () => {
      expect(checkMessageCardType([
        { ...cardViewMessageButton, cta_link: 'invalid-url' },
        { ...cardViewMessageButton}],
      MessageCardType.MEETING_INVITATION)).toEqual(false)
    })
  })

  describe('retrieveMessageCardTypeFromLink', () => {
    it('should return type INVITATION when link has groups/invitation in its string', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromLink('groups/invitation/approve/')

      expect(type).toEqual(MessageCardType.GROUP_INVITATION)
    })

    it('should return type MEETING when link has /call/ in its string', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromLink('/call/')

      expect(type).toEqual(MessageCardType.MEETING_INVITATION)
    })

    it('should return type UNKNOWN when link hasn\'t got any of the known card types', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromLink('/something_unknown/approve/')

      expect(type).toEqual(MessageCardType.UNKNOWN)
    })
  })

  describe('retrieveMessageCardTypeFromButtons', () => {
    it('should return type INVITATION when all buttons links have groups/invitation in its string', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromButtons([cardViewMessageButton,cardViewMessageButton])

      expect(type).toEqual(MessageCardType.GROUP_INVITATION)
    })

    it('should return type MEETING when all buttons links  have /call/ in its string', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromButtons([
        { ...cardViewMessageButton, cta_link: 'global.id/call/48' }])

      expect(type).toEqual(MessageCardType.MEETING_INVITATION)
    })

    it('should return type UNKNOWN when all buttons links  haven\'t got any of the known card types', () => {
      const type: MessageCardType = retrieveMessageCardTypeFromButtons([
        { ...cardViewMessageButton, cta_link: 'invalid-url' },
        { ...cardViewMessageButton}])

      expect(type).toEqual(MessageCardType.UNKNOWN)
    })
  })

  describe('rejectOrApproveAction', () => {
    it('should return action APPROVE when link has accept in its string', () => {
      const action: InvitationAction = rejectOrApproveAction('/accept/action/')

      expect(action).toEqual(InvitationAction.APPROVE)
    })

    it('should return action REJECT when link hasn\'t got accept in its string', () => {
      const action: InvitationAction = rejectOrApproveAction('/decline/action/')

      expect(action).toEqual(InvitationAction.REJECT)
    })
  })
})
