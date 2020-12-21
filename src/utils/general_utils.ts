import { NetworkErrorType, MatchingStrings } from './interfaces'
import { differenceInMilliseconds, isAfter, addSeconds, isThisYear, format } from 'date-fns'
import { API_BASE_URL, NetworkError } from '../constants'

import data from '../assets/json/static_strings.json'
import { Dispatch, SetStateAction } from 'react'
import Jimp from 'jimp'
import _, { isEmpty, isNil } from 'lodash'
import { FileToken, PaginationMetaParams } from '@globalid/messaging-service-sdk'
import { ToastContent } from 'globalid-react-ui'
import { getArrayBuffer } from './file_reader_utils'
import axios, { CancelTokenSource, CancelTokenStatic, AxiosError } from 'axios'

export type StaticStringKey = keyof typeof data

export const asStringKey = (staticStringKey: string): StaticStringKey => <StaticStringKey> staticStringKey

export const getString = (key: StaticStringKey): string => {
  if (key in data) {
    return data[key]
  }

  return key
}

export const getStringWithText = (key: StaticStringKey, matchingStrings: MatchingStrings[]): string => {
  const re = new RegExp(
    `{${matchingStrings.map((matchingString: MatchingStrings) => matchingString.match).join('}|{')}}`,
    'gi',
  )

  return getString(key).replace(re, (matched: string) => (
    matchingStrings.find((matchingString: MatchingStrings) => `{${matchingString.match}}` === matched)?.replace ?? ''
  ))
}

export const loadFile = async (file: File): Promise<string> => new Promise((resolve: Function, reject: Function) => {

  const reader = new FileReader()

  reader.readAsDataURL(file)

  reader.onloadend = () => {
    const base64data: string = <string>reader.result

    resolve(base64data)
  }

  reader.onerror = () => {
    reject()
  }
})

export const handleChangeState = <T> (
  newState: Partial<T>,
  setState: Dispatch<SetStateAction<T>>
): void => {
  setState((prev: T) => ({
    ...prev,
    ...newState,
  }))
}

export const getAvatarUrl = (uuid: string): string => `${API_BASE_URL}/v1/avatar/${uuid}`

enum Compare {
  GreaterThan = -1,
  SmallerThan = 1,
  None = 1
}

export const sortByDateDesc
  = (firstDateString?: string, secondDateString?: string): Compare => firstDateString && secondDateString ?
    (differenceInMilliseconds(new Date(secondDateString), new Date(firstDateString)) < 0 ?
      Compare.GreaterThan : Compare.SmallerThan)
    : Compare.None

export const resizeImage = async (imageBase64: string, width: number, height: number): Promise<string> => {
  const containsMime: boolean = imageBase64.includes('base64')

  const dataString: string | undefined = containsMime ?
    imageBase64.split(',').length > 1 ?
      imageBase64.split(',')[1] : undefined
    : imageBase64

  if (!dataString) {
    throw new Error(getString('image-data-format-error'))
  }

  const image = await Jimp.read(Buffer.from(dataString, 'base64'))

  image.resize(width, height)

  return image.getBase64Async('image/jpeg')
}

const scaleToFitJimp = (jimpImage: Jimp, maxWidth: number, maxHeight: number): Jimp | undefined => {
  const height: number = jimpImage.getHeight()
  const width: number = jimpImage.getWidth()

  if (height > maxHeight || width > maxWidth) {

    return jimpImage.scaleToFit(
      width > maxWidth ? maxWidth : width,
      height > maxHeight ? maxHeight : height,
    )
  }
}

export const scaleToFitImage = async (image: File, maxWidth: number, maxHeight: number): Promise<File> => {
  const jimpImage: Jimp = await FileToJimp(image)

  const scaledJimp: Jimp | undefined = scaleToFitJimp(jimpImage, maxWidth, maxHeight)

  return scaledJimp ? JimpToFile(scaledJimp, image) : image
}

export const cropAndScaleImage = async (image: File, imageSize: number): Promise<File> => {
  let jimpImage: Jimp = await FileToJimp(image)

  const height: number = jimpImage.getHeight()
  const width: number = jimpImage.getWidth()

  if (height !== width) {
    const shorterSideLength: number = height > width ? width : height

    jimpImage = jimpImage.crop(0, 0, shorterSideLength, shorterSideLength)
  }

  const processedJimp: Jimp = scaleToFitJimp(jimpImage, imageSize, imageSize) ?? jimpImage

  return JimpToFile(processedJimp, image)
}

export const setConsentUuid = (consent: string): void => {
  localStorage.setItem('consent', consent)
}

export const getConsentUuid = (): string | null => (
  localStorage.getItem('consent')
)

export const removeConsentUuid = (): void => {
  localStorage.removeItem('consent')
}

export const hasExpired = (date?: string): boolean => {
  if (date === undefined) {
    return false
  }

  return isAfter(addSeconds(Date.now(), 30), new Date(date))
}

export const getImageFromAws = (url: string, fileToken: FileToken): string => {
  const keyPairId: string = fileToken.token['CloudFront-Key-Pair-Id']
  const policy: string = fileToken.token['CloudFront-Policy']
  const signature: string = fileToken.token['CloudFront-Signature']

  return `${url}?Key-Pair-Id=${keyPairId}&Policy=${policy}&Signature=${signature}`
}

export const areArraysEqual
  = <T> (arr1: Array<T>, arr2: Array<T>): boolean => (arr1.length === arr2.length) && _.xor(arr1, arr2).length === 0

export const addToCurrentTime = (secondsToAdd: number): number => {
  const expiresAtDate: Date = addToCurrentDate(secondsToAdd)

  return expiresAtDate.getTime()
}

export const getPrettyTimestamp = (timestamp: string): string => {
  const timestampFormat: string = isThisYear(new Date(timestamp)) ?
    'MMMM d, h:mm aaaaa'
    :
    'MMMM d y, h:mm aaaaa'

  return `${format(new Date(timestamp), timestampFormat)}m`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNetworkErrorType = (value: NetworkErrorType | undefined | any): value is NetworkErrorType => !isNil(value) && Object.getOwnPropertyNames(value).includes('error_id')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAxiosError = (value: AxiosError | Error | undefined | any): value is AxiosError => !isNil(value) && Object.getOwnPropertyNames(value).includes('isAxiosError') && value.isAxiosError === true

const networkErrorExceptionMap = new Map<NetworkError, ToastContent>([
  [NetworkError.ERR_CHANNEL_BLOCKED, {
    title: getString('sending-failed'),
    message: getString('blocked-user-send-error'),
  }],
  [NetworkError.DEFAULT, { title: getString('sending-failed'), message: getString('something-went-wrong') }],
])

export const getToastContentForNetworkException
  = (networkError: NetworkError): ToastContent =>
    networkErrorExceptionMap.get(networkError) ?? <ToastContent> networkErrorExceptionMap.get(NetworkError.DEFAULT)

const JimpToFile = async (jimpImage: Jimp, image: File): Promise<File> => {
  const imageBuffer: Buffer = await jimpImage.getBufferAsync(image.type)

  return new File([imageBuffer], image.name, { type: image.type })
}

const FileToJimp = async (image: File): Promise<Jimp> => {
  const buffer: ArrayBuffer = await getArrayBuffer(image)
  const jimpImage: Jimp = await Jimp.read(Buffer.from(buffer))

  return jimpImage
}

export const toDataURL = async (
  url: string
): Promise<string | ArrayBuffer | null> =>
  new Promise<string | ArrayBuffer | null>((resolve: Function, reject: Function): void => {
    const xhr = new XMLHttpRequest()

    xhr.open('get', url)
    xhr.responseType = 'blob'
    xhr.onload = function (): void {
      const fr = new FileReader()

      fr.onload = function (): void {
        resolve(this.result)
      }
      fr.onerror = (ev: ProgressEvent<FileReader>): void => {
        reject(ev)
      }
      fr.readAsDataURL(xhr.response)
    }
    xhr.onerror = (ev: ProgressEvent<EventTarget>): void => {
      reject(ev)
    }

    xhr.send()
  })

export const addToCurrentDate = (secondsToAdd: number): Date => {
  const currentTime: Date = new Date()

  const expiresAtDate: Date = new Date(currentTime.getTime() + (secondsToAdd * 1000))

  return expiresAtDate
}

export const getAllCookies = (cname: string): string[] => {
  const name: string = `${cname}=`
  const cookieStrings: string[] = document.cookie.split(';')
  const cookieValues: string []
    = cookieStrings.reduce<string[]>((array: string[], cookieString: string) => {
      const trimmed: string = cookieString.trimStart()

      if (trimmed.startsWith(name)) {
        return [...array, trimmed.slice(name.length, trimmed.length)]
      }

      return array
    }, [])

  return cookieValues
}

export const getCancelTokenSource = (): CancelTokenSource => {
  const cancelToken: CancelTokenStatic = axios.CancelToken

  return cancelToken.source()
}

export const defaultOnAxiosError = (error: Error): void => {
  if (!axios.isCancel(error)) {
    throw error
  }
}

export const executeCancellabeAxiosCallback = async <T = void> (
  callback: () => Promise<T>,
  onError: (error: Error) => void = defaultOnAxiosError
): Promise<void> => {
  try {
    await callback()
  } catch (error) {
    onError(error)
  }
}

export const validateObjectKeys = <T> (value: T, whitelistedKeys: string[]): void => {
  Object.keys(value).forEach((key: string) => {
    if (!whitelistedKeys.includes(key)) {
      throw new Error('ERR_WRONG_PARSED_CONTENT')
    }
  })
}

export const handleAddItemMetaUpdate = (
  meta: PaginationMetaParams,
  perPageDefault: number
): PaginationMetaParams => {
  const pageLimit: number | undefined = meta.page !== undefined
    ? meta.page * (meta.per_page ?? perPageDefault)
    : undefined

  const newTotal: number = meta.total + 1

  const isOnNewPage: boolean = pageLimit !== undefined
    ? pageLimit < newTotal
    : false

  const newPage: number | undefined = isOnNewPage && meta.page !== undefined
    ? meta.page + 1
    : meta.page

  return {
    page: newPage ?? 1,
    per_page: meta.per_page,
    total: newTotal,
  }
}

export const hasParsedText = (text?: string | null): text is string => !isNil(text) && !isEmpty(text.trim())
