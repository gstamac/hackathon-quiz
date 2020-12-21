import { actHook, testCustomHook, TestCustomHookType } from '../../../tests/test_utils'
import { setDocumentTitle, useFolderCounters } from './use_folder_counters'
import { getFolders } from '../../services/api/channels_api'
import { fetchCounters } from '../../services/api/messaging_api'
import { mocked } from 'ts-jest/utils'
import { foldersResponseMock } from '../../../tests/mocks/channels_mock'
import { getString } from '../../utils'
import { GeneralObject } from '../../utils/interfaces'

jest.mock('../../services/api/channels_api')
jest.mock('../../services/api/messaging_api')

describe('useFolderCounters', () => {
  const getFoldersMock: jest.Mock = mocked(getFolders).mockResolvedValue(foldersResponseMock)
  const fetchCountersMock: jest.Mock = mocked(fetchCounters)

  const getHookResult: TestCustomHookType<{}, void> = testCustomHook(useFolderCounters, { isLoggedIn: true })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should call getFolder and fetchCounters functions if user is logged in when initialized', async () => {
    await actHook(async () => {
      await getHookResult({})
    })

    expect(getFoldersMock).toHaveBeenCalled()
    expect(fetchCountersMock).toHaveBeenCalled()
  })

  it('should not call getFolder and fetchCounters functions if user is not logged in when initialized', async () => {
    await actHook(async () => {
      await getHookResult({ isLoggedIn: false })
    })

    expect(getFoldersMock).not.toHaveBeenCalled()
    expect(fetchCountersMock).not.toHaveBeenCalled()
  })
})

describe('set document title', () => {

  const isLoggedIn: boolean = true

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set correct title when 0 unread messages', async () => {
    const counters: GeneralObject<number> = {'t': 0, 'g': 0, 'm': 0}

    setDocumentTitle({ counters, isLoggedIn })

    expect(document.title).toBe(getString('meta-title').replace('{number}', ''))
  })

  it('should set correct title when 1 unread messages', async () => {
    const counters: GeneralObject<number> = {'t': 1, 'g': 0, 'm': 0}

    setDocumentTitle({ counters, isLoggedIn })

    expect(document.title).toBe(getString('meta-title').replace('{number}', '(1) '))
  })

  it('should set correct title when 15 unread messages', async () => {
    const counters: GeneralObject<number> = {'t': 1, 'g': 5, 'm': 5}

    setDocumentTitle({ counters, isLoggedIn })

    expect(document.title).toBe(getString('meta-title').replace('{number}', '(9+) '))
  })
})
