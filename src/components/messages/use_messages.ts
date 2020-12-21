import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import useAsyncEffect from 'use-async-effect'
import { deviceKeyManager } from '../../init'
import { fetchFileToken, fetchFolders, setLastVisitedFolder } from '../../store/channels_slice/channels_slice'
import { ThunkDispatch } from './../../store'
import {
  checkEncryptionAllowedDevices, handleConsentFromCookie, initializeDeviceKeyManager,
  statusMatcher,
} from './helpers'
import { EncryptionStatus, UseMessagesResponse } from './interfaces'

// eslint-disable-next-line max-lines-per-function
export const useMessages = (): UseMessagesResponse => {
  const dispatch: ThunkDispatch = useDispatch()

  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>(EncryptionStatus.PENDING)

  const match = useRouteMatch<{
    type: string
    channelId?: string
    groupUuid?: string
  }>()

  const {
    type,
    channelId,
    groupUuid,
  } = match.params

  useAsyncEffect(async (isMounted: () => boolean) => {
    await dispatch(fetchFolders({}))
    if (!deviceKeyManager.getInitialized()) {
      await initializeDeviceKeyManager()
    }

    if (isMounted()) {
      setEncryptionStatus(EncryptionStatus.KEY_MANAGER_INITIALIZED)
    }
  }, [])

  useEffect(() => {
    dispatch(setLastVisitedFolder(
      {
        folderType: type,
        channelId,
        groupUuid,
      }
    ))
  }, [type, channelId, groupUuid])

  useAsyncEffect(async () => {
    if (channelId === undefined) {
      return
    }

    await dispatch(fetchFileToken({ channel_id: channelId }))
  }, [channelId])

  useAsyncEffect(async (isMounted: () => boolean) => {
    if (statusMatcher(encryptionStatus, [EncryptionStatus.PENDING, EncryptionStatus.DISABLED, EncryptionStatus.ENABLED])) {

      return
    }

    if (statusMatcher(encryptionStatus, [EncryptionStatus.POLLING])) {
      const consentStatus: EncryptionStatus = await handleConsentFromCookie(dispatch)

      if (isMounted()) {
        setEncryptionStatus(consentStatus)
      }

      return
    }
    if (statusMatcher(encryptionStatus, [EncryptionStatus.KEY_MANAGER_INITIALIZED])) {
      const devicesStatus: EncryptionStatus | null = await checkEncryptionAllowedDevices()

      if (devicesStatus !== null && isMounted()) {
        setEncryptionStatus(devicesStatus)

        return
      }
    }

    setEncryptionStatus(EncryptionStatus.DISABLED)
  }, [encryptionStatus])

  return {
    encryptionStatus,
    type,
    groupUuid,
    channelId,
    setEncryptionStatus,
  }
}
