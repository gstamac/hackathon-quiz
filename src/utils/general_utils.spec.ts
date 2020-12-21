import { originalImage } from './../../tests/mocks/profile_picture'
import * as gen_utils from './general_utils'
import { jpgFileMock, bufferArrayMock, bufferMock, resultFileMock } from '../../tests/mocks/utils_mock'
import Jimp from 'jimp'
import * as file_reader_utils from './file_reader_utils'
import axios from 'axios'
import { PaginationMetaParams } from '@globalid/messaging-service-sdk/interfaces'
import { MatchingStrings } from './interfaces'

const arrayBufferMock: jest.Mock = jest.fn().mockResolvedValue(bufferArrayMock)
const getBufferAsyncMock: jest.Mock = jest.fn().mockResolvedValue(bufferMock)
const scaleToFitMock: jest.Mock = jest.fn().mockReturnValue({
  getBufferAsync: getBufferAsyncMock,
})

const defineJimpRead = (
  width: number,
  height: number
): void => {
  Object.defineProperty(Jimp, 'read', {
    value () {
      return {
        getHeight: () => height,
        getWidth: () => width,
        scaleToFit: scaleToFitMock,
        getBufferAsync: getBufferAsyncMock,
      }
    },
  })
}

jest.mock('./file_reader_utils')
jest.mock('axios')

describe('General utils', () => {
  const getArrayBufferMock: jest.Mock = jest.fn()
  const isCancelMock: jest.Mock = jest.fn()
  const cancelTokenSourceMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock>file_reader_utils.getArrayBuffer) = getArrayBufferMock.mockResolvedValue(bufferMock);
    (<jest.Mock> axios.isCancel) = isCancelMock;
    (<object> axios.CancelToken) = {
      source: cancelTokenSourceMock,
    }

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('resizeImage', () => {
    it('should return a base64 string of resized image', async () => {
      const resizedImage: string = await gen_utils.resizeImage(originalImage, 100, 100)

      expect(resizedImage).toContain('base64')
      expect(resizedImage.length).toBeLessThan(originalImage.length)
    })
  })

  describe('hasExpired', () => {
    it('should return false when date has not expired yet', () => {
      const hasExpires: boolean = gen_utils.hasExpired('October 13, 2024 11:13:00')

      expect(hasExpires).toEqual(false)
    })

    it('should return true when date has expired', () => {
      const hasExpires: boolean = gen_utils.hasExpired('October 13, 2014 11:13:00')

      expect(hasExpires).toEqual(true)
    })

    it('should return false when date ist not provided', () => {
      const hasExpires: boolean = gen_utils.hasExpired()

      expect(hasExpires).toEqual(false)
    })
  })

  describe('getPrettyTimstamp', () => {
    it('should get pretty timestamp without a year', () => {
      const timestamp: string = gen_utils
        .getPrettyTimestamp(`${new Date().getFullYear().toString()}-06-14T19:42:33.905Z`)

      expect(timestamp).toMatch('June 14, ')
    })

    it('should get pretty timestamp with a year', () => {
      const timestamp: string = gen_utils
        .getPrettyTimestamp('2018-06-14T19:42:33.905Z')

      expect(timestamp).toMatch('June 14 2018')
    })
  })

  describe('scaleToFitImage', () => {
    const imageFile = jpgFileMock(arrayBufferMock)

    it('should return unchanged file when image size is not to big', async () => {
      defineJimpRead(1000, 1000)

      expect(await gen_utils.scaleToFitImage(imageFile, 4000, 4000)).toEqual(imageFile)
      expect(getArrayBufferMock).toHaveBeenCalled()
    })

    it('should return resized file when image width is to big', async () => {
      defineJimpRead(4001, 4000)

      expect(await gen_utils.scaleToFitImage(imageFile, 4000, 4000)).toEqual(resultFileMock)
      expect(getArrayBufferMock).toHaveBeenCalled()
      expect(scaleToFitMock).toHaveBeenCalledWith(4000, 4000)
      expect(getBufferAsyncMock).toHaveBeenCalledWith(imageFile.type)
    })

    it('should return resized file when image height is to big', async () => {
      defineJimpRead(4000, 4001)

      expect(await gen_utils.scaleToFitImage(imageFile, 4000, 4000)).toEqual(resultFileMock)
      expect(getArrayBufferMock).toHaveBeenCalled()
      expect(scaleToFitMock).toHaveBeenCalledWith(4000, 4000)
      expect(getBufferAsyncMock).toHaveBeenCalledWith(imageFile.type)
    })
  })

  describe('getAllCookies', () => {
    it('should return empty array when cookies of that name are not present', () => {
      global.document.cookie = ''
      expect(gen_utils.getAllCookies('test')).toEqual([])
    })

    it('should return array of different values when cookies of that name are present', () => {
      global.document.cookie = 'test=val1;'
      expect(gen_utils.getAllCookies('test')).toEqual(['val1'])
    })
  })

  describe('defaultOnAxiosError', () => {
    it('should throw if error is not axios.CancelError', () => {

      const error: Error = new Error()

      isCancelMock.mockReturnValue(false)

      expect(() => gen_utils.defaultOnAxiosError(error)).toThrow(error)
    })

    it('should now throw if error is axios.CancelError', () => {

      const error: Error = new Error()

      isCancelMock.mockReturnValue(true)

      expect(gen_utils.defaultOnAxiosError(error)).toBeUndefined()
    })
  })

  describe('getCancelTokenSource', () => {
    it('should return axios cancel token source', () => {

      const cancelTokenSource = 'test'

      cancelTokenSourceMock.mockReturnValue(cancelTokenSource)

      expect(gen_utils.getCancelTokenSource()).toEqual(cancelTokenSource)
    })
  })

  describe('executeCancellabeAxiosCallback', () => {
    const callback: jest.Mock = jest.fn()
    const onError: jest.Mock = jest.fn()

    it('should call callback method', async () => {

      expect(await gen_utils.executeCancellabeAxiosCallback(callback, onError)).toBeUndefined()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledTimes(0)
    })

    it('should call onError method when callback rejects', async () => {

      callback.mockRejectedValue('test')

      expect(await gen_utils.executeCancellabeAxiosCallback(callback, onError)).toBeUndefined()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleAddItemMetaUpdate', () => {

    const perPageDefault: number = 20

    it('should add total to meta', () => {
      const meta: PaginationMetaParams = {
        page: 1,
        per_page: 20,
        total: 1,
      }

      expect(gen_utils.handleAddItemMetaUpdate(meta, perPageDefault)).toEqual({
        ...meta,
        total: 2,
      })
    })

    it('should add total to meta and add next page', () => {
      const meta: PaginationMetaParams = {
        page: 1,
        per_page: 20,
        total: 20,
      }

      expect(gen_utils.handleAddItemMetaUpdate(meta, perPageDefault)).toEqual({
        ...meta,
        page: 2,
        total: 21,
      })
    })

    it('should add total to meta and default page to 1', () => {
      const meta: PaginationMetaParams = {
        page: undefined,
        per_page: 20,
        total: 0,
      }

      expect(gen_utils.handleAddItemMetaUpdate(meta, perPageDefault)).toEqual({
        ...meta,
        page: 1,
        total: 1,
      })
    })
  })

  describe('getStringWithText', () => {
    it('should match and replace one value in static string', () => {
      expect(gen_utils.getStringWithText('assigned-changes-saved-description', [{ match: 'user', replace: 'test name'}])).toBe(
        gen_utils.getString('assigned-changes-saved-description').replace('{user}', 'test name')
      )
    })

    it('should match and replace two values in static string', () => {
      const matchingStrings: MatchingStrings[] = [
        { match: 'gid-name', replace: 'test name'},
        { match: 'role-name', replace: 'test role'},
      ]

      expect(gen_utils.getStringWithText('successfully-unassigned-role-description', matchingStrings)).toBe(
        gen_utils.getString('successfully-unassigned-role-description').replace('{gid-name}', 'test name').replace('{role-name}', 'test role')
      )
    })
  })
})
