import { GetAvatarsByChannelTypeHookProps } from './interfaces'
import {
  channelWithParticipantsTypePersonal,
  toChannelWithParsedMessage,
  channelWithParticipantsTypeGroup,
  channelWithParticipantsTypeMulti,
} from '../../../../tests/mocks/channels_mock'
import * as api from '../../../services/api/avatar_api'
import { avatarMock } from '../../../../tests/mocks/avatar_mocks'
import { getAvatarByChannelType } from './get_avatar_by_channel_type'
import { renderHook, RenderHookResult, cleanup } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'
import { identityMock } from '../../../../tests/mocks/identity_mock'
import { AvatarVariant } from '../../global/general_avatar'

jest.mock('../../../services/api/avatar_api')

describe('getAvatarByChannelType', () => {
  let renderResult: RenderHookResult<GetAvatarsByChannelTypeHookProps, JSX.Element>
  const getAvatarMock = jest.fn()

  beforeEach(() => {
    (api.getAvatar as jest.Mock) = getAvatarMock.mockResolvedValue(avatarMock)
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  const defaultProps: GetAvatarsByChannelTypeHookProps = {
    channel: toChannelWithParsedMessage(channelWithParticipantsTypePersonal),
    firstParticipant: identityMock,
    secondParticipant: identityMock,
  }

  const renderComponent = async (props: Partial<GetAvatarsByChannelTypeHookProps>): Promise<void> => {
    await act(async () => {
      renderResult = renderHook(getAvatarByChannelType, { initialProps: {
        ...defaultProps,
        ...props,
      }})
    })
  }

  it('should return personal avatar with participant image on PERSONAL channel', async () => {
    await renderComponent({
      channel: toChannelWithParsedMessage(channelWithParticipantsTypePersonal),
    })

    const result: JSX.Element = renderResult.result.current

    expect(result.props.title).toEqual(channelWithParticipantsTypePersonal.title)
    expect(result.props.uuid).toEqual(defaultProps.firstParticipant?.gid_uuid)
    expect(result.props.variant).toEqual(AvatarVariant.Circle)
    expect(result.props.image_url).toEqual(defaultProps.firstParticipant?.display_image_url)
  })

  it('should return personal avatar with participant image on MULTI channel with one participant', async () => {
    await renderComponent({
      channel: toChannelWithParsedMessage({
        ...channelWithParticipantsTypeMulti,
        participants: ['one participant'],
      }),
    })

    const result: JSX.Element = renderResult.result.current

    expect(result.props.title).toEqual(channelWithParticipantsTypePersonal.title)
    expect(result.props.uuid).toEqual(defaultProps.firstParticipant?.gid_uuid)
    expect(result.props.variant).toEqual(AvatarVariant.Circle)
    expect(result.props.image_url).toEqual(defaultProps.firstParticipant?.display_image_url)
  })

  it('should return group avatar with group channel logo on GROUP channel', async () => {
    await renderComponent({
      channel: toChannelWithParsedMessage(channelWithParticipantsTypeGroup),
    })

    const result: JSX.Element = renderResult.result.current

    expect(result.props.title).toEqual(channelWithParticipantsTypeGroup.title)
    expect(result.props.uuid).toEqual(channelWithParticipantsTypeGroup.group_uuid)
    expect(result.props.variant).toEqual(AvatarVariant.Rounded)
    expect(result.props.image_url).toEqual(channelWithParticipantsTypeGroup.image_url)
  })

  it('should return multi avatar with participant images on MULTI channel', async () => {
    await renderComponent({
      channel: toChannelWithParsedMessage(channelWithParticipantsTypeMulti),
    })

    const result: JSX.Element = renderResult.result.current

    expect(result.props.firstAvatar).toEqual({
      uuid: defaultProps.firstParticipant?.gid_uuid,
      image_url: defaultProps.firstParticipant?.display_image_url,
    })
    expect(result.props.secondAvatar).toEqual({
      uuid: defaultProps.secondParticipant?.gid_uuid,
      image_url: defaultProps.secondParticipant?.display_image_url,
    })
  })
})
