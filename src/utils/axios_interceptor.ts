/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/no-promise-in-callback */
import { AxiosError, AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import { NetworkError } from '../constants'
/* eslint-disable max-lines-per-function */

const shouldIntercept = (error: AxiosError): boolean => {
  try {
    return error.response?.status === 401
  } catch {
    return false
  }
}

const attachTokenToRequest = (
  request: AxiosRequestConfig,
  token: string | undefined
): void => {
  if (token === undefined){
    throw NetworkError.ERR_UNAUTHORIZED
  }
  request.headers.Authorization = `Bearer ${token}`
}

export const applyInterceptor = (
  axiosInstance: AxiosInstance,
  handleTokenRefresh: () => Promise<string | undefined>
): void => {
  let isRefreshing: boolean = false
  let failedQueue: { resolve: Function, reject: Function }[] = []

  const options = {
    attachTokenToRequest,
    handleTokenRefresh,
    shouldIntercept,
  }
  const processQueue = (error: any, token: string | undefined | null): void => {
    failedQueue.forEach((prom: {
      resolve: Function
      reject: Function
  }) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  const interceptor = async (error: any): Promise<AxiosResponse<any>> => {
    if (!options.shouldIntercept(error)) {
      return Promise.reject(error)
    }

    if (error.config._retry || error.config._queued) {
      return Promise.reject(error)
    }

    const originalRequest = error.config

    if (isRefreshing) {
      return new Promise(function (resolve: (value?: unknown) => void, reject: (reason?: any) => void) {
        failedQueue.push({resolve, reject})
      }).then((token: unknown) => {
        originalRequest._queued = true
        options.attachTokenToRequest(originalRequest, <string> token)

        return axiosInstance.request(originalRequest)
      }).catch((_err: any) =>
        Promise.reject(error)
      )
    }

    originalRequest._retry = true
    isRefreshing = true
    try {
      const tokenData: string | undefined = await options.handleTokenRefresh.call(options.handleTokenRefresh)

      options.attachTokenToRequest(originalRequest, tokenData)
      processQueue(null, tokenData)

      return axiosInstance.request(originalRequest)
    }
    catch (err) {
      processQueue(err, null)
      throw err
    }
    finally {
      isRefreshing = false
    }
  }

  axiosInstance.interceptors.response.use(undefined, interceptor)
}
