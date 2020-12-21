import pRetry from 'p-retry'

import axios, { AxiosResponse } from 'axios'
import { getValidToken } from '../../components/auth'
import { ConsentStatus } from './interfaces'
import { API_BASE_URL, KEEP_POOLING_CONSENT_NOT_APPROVED_YET } from '../../constants'
import { delay, getConsentUuid } from '../../utils'
import { ConsentRequest } from '@globalid/consent-types'

export const getConsentStatus = async (): Promise<ConsentStatus> => {
  await getValidToken()
  const consent: string | null = getConsentUuid()

  if (consent === null) {
    throw new pRetry.AbortError('ERR_UNAUTHORIZED')
  }

  const response: AxiosResponse = await axios.get(
    `${API_BASE_URL}/v1/consent/${consent}/status`
  )

  if ([ConsentRequest.ConsentStatus.completed, ConsentRequest.ConsentStatus.declined, ConsentRequest.ConsentStatus.expired]
    .every((status: string) => status !== response.data.status)) {
    throw new Error(KEEP_POOLING_CONSENT_NOT_APPROVED_YET)
  }

  return response.data
}

export const consentPolling = async (): Promise<ConsentStatus> => pRetry(async () => getConsentStatus(), {
  retries: 100,
  factor: 1,
  onFailedAttempt: async () => {
    await delay(3000)
  },
})
