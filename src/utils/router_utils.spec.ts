import { CLIENT_ID, RESPONSE_TYPE_CODE, REDIRECT_URI } from './../constants'
import * as auth_helpers from '../components/auth/helpers'
import * as router_utils from './router_utils'

import { History, createBrowserHistory } from 'history'
import { WEB_CLIENT_LOGIN_URL, SCOPE, BASE_MESSAGES_URL } from '../constants'
import { MessagesType } from '../components/messages/interfaces'
import { deviceKeyManager } from '../init'
import { DeviceKeyPair } from '../services/device_key_manager/interfaces'
import { privateKeyUnextractableMock, publicKeyPEMMock } from '../../tests/mocks/device_key_manager_mocks'

jest.mock('../components/auth/helpers')
jest.mock('../init')

describe('Router utils tests', () => {
  const generateCodeChallengeMock: jest.Mock = jest.fn()
  const storeKeyMock: jest.Mock = jest.fn()
  const generateKeyPairMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock>auth_helpers.generateCodeChallenge) = generateCodeChallengeMock;
    (<jest.Mock>deviceKeyManager.storeKey) = storeKeyMock;
    (<jest.Mock>deviceKeyManager.generateKeyPair) = generateKeyPairMock
  })

  beforeEach(() => {
    const oldLocation = window.location

    delete window.location
    window.location = { ...oldLocation, href: '' }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('pushTo', () => {
    const history: History = createBrowserHistory()

    const historyPushSpy: jest.SpyInstance = jest.spyOn(history, 'push')

    it('should call history.push with passed path', () => {
      router_utils.pushTo(history, 'path')

      expect(historyPushSpy).toHaveBeenCalledTimes(1)
      expect(historyPushSpy).toHaveBeenCalledWith('path')
    })
  })

  describe('redirectTo', () => {
    it('should call history.push with passed path', () => {
      router_utils.redirectTo('path')

      expect(window.location.href).toBe('path')
    })
  })

  describe('redirectToLadningPage', () => {

    it('should assign location', () => {
      router_utils.redirectToLadningPage()

      expect(window.location.href).toBe('/')
    })

    it('should assign location with path', () => {
      router_utils.redirectToLadningPage()

      expect(window.location.href).toBe('/')
    })
  })

  describe('redirectToLogin', () => {
    it('should call history.push with passed path and public key', async () => {
      const codeChallengeMock: string = 'code_challenge'
      const keyPair: DeviceKeyPair = {
        privateKey: privateKeyUnextractableMock,
        publicKey: publicKeyPEMMock,
      }

      generateKeyPairMock.mockResolvedValue(keyPair)

      generateCodeChallengeMock.mockResolvedValue(codeChallengeMock)
      await router_utils.redirectToLogin()

      expect(SCOPE).toEqual('public offline_access add_messaging_device')
      expect(window.location.href).toBe(`${WEB_CLIENT_LOGIN_URL}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE_CODE}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}&code_challenge=${codeChallengeMock}&code_challenge_method=S256&device_public_key=${window.encodeURIComponent(keyPair.publicKey)}&login=true`)
    })
  })

  describe('redirectToSignUp', () => {
    it('should call history.push with passed path and public key', async () => {
      const codeChallengeMock: string = 'code_challenge'
      const keyPair: DeviceKeyPair = {
        privateKey: privateKeyUnextractableMock,
        publicKey: publicKeyPEMMock,
      }

      generateKeyPairMock.mockResolvedValue(keyPair)

      generateCodeChallengeMock.mockResolvedValue(codeChallengeMock)
      await router_utils.redirectToSignUp()

      expect(SCOPE).toEqual('public offline_access add_messaging_device')
      expect(window.location.href).toBe(`${WEB_CLIENT_LOGIN_URL}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE_CODE}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}&code_challenge=${codeChallengeMock}&code_challenge_method=S256&device_public_key=${window.encodeURIComponent(keyPair.publicKey)}&login=false`)
    })
  })

  describe('redirectToGroups', () => {
    it('should call window.open with groups url', () => {
      jest.spyOn(window, 'open').mockImplementation()

      router_utils.redirectToGroups()

      expect(window.open).toHaveBeenCalledWith('https://groups.global.id/', '_blank')
    })
  })

  describe('getUrlParts', () => {
    it('should divide the url into parts', () => {
      const url: string = 'https://developer.global.id/external/documentation/index.html'

      expect(router_utils.getUrlParts(url)).toEqual(['developer.global.id', 'external', 'documentation', 'index.html'])
    })
    it('should correct the format of the url and divide it into parts', () => {
      const url: string = '\\:?https//:?://developer.global.id/external//&documentation//index/#html'

      expect(router_utils.getUrlParts(url)).toEqual(['developer.global.id', 'external&documentation', 'index#html'])
    })
    it('should ignore the firs part of absolute url', () => {
      const url: string = 'http://'

      expect(router_utils.getUrlParts(url)).toEqual([])
    })
  })

  describe('getUuidFromURL', () => {
    it('should return array of uuids from url', () => {
      const url: string = 'https://global.id/app/messages/g/b20014da-a9f0-447d-bdb1-f2e1c2c998d6'
      const regexResult: string = <string>router_utils.getUuidFromURL(url)

      expect(regexResult).toEqual('b20014da-a9f0-447d-bdb1-f2e1c2c998d6')
    })
    it('should return null when provided url does not contains uuid string', () => {
      const url: string = 'https://global.id/app/messages/g'

      expect(router_utils.getUuidFromURL(url)).toBeNull()
    })
  })

  describe('getLastVisitedMessagesUrl', () => {
    it('should return URL with just folder type', () => {
      expect(router_utils.getLastVisitedMessagesUrl({
        folderType: MessagesType.PRIMARY,
        groupUuid: undefined,
        channelId: undefined,
      })).toBe(`${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}`)
    })

    it('should return URL with folder type and group uuid', () => {
      expect(router_utils.getLastVisitedMessagesUrl({
        folderType: MessagesType.GROUPS,
        groupUuid: 'group_uuid',
        channelId: undefined,
      })).toBe(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}/group_uuid`)
    })

    it('should return URL with folder type, group uuid and channel id', () => {
      expect(router_utils.getLastVisitedMessagesUrl({
        folderType: MessagesType.GROUPS,
        groupUuid: 'group_uuid',
        channelId: 'channel_id',
      })).toBe(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}/group_uuid/channel_id`)
    })

    it('should return URL with folder type and channel id', () => {
      expect(router_utils.getLastVisitedMessagesUrl({
        folderType: MessagesType.GROUPS,
        groupUuid: undefined,
        channelId: 'channel_id',
      })).toBe(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}/channel_id`)
    })
  })
})
