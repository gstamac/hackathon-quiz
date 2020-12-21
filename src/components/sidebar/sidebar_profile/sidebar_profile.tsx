import React from 'react'

import {
  AvatarVariant,
  GeneralAvatar,
} from '../../global/general_avatar'
import { useStyles } from './style'
import { SidebarProfileProps } from '.'
import { Skeleton } from '../../global/skeletons'
import { pushTo } from '../../../utils'
import { useHistory, useLocation } from 'react-router-dom'
import { QRWidget } from 'globalid-react-ui'
import {
  getAuthenticationRequestStatus,
  createAuthenticationRequestWithArgs,
  redirectWithAuthCredentials,
} from '../../../services/api/authentication_api'
import {
  qrCodeTexts,
  qrCodeUrls,
  qrOptions,
} from '../../../utils/qr_utils'
import { useIsMobileOrTabletView } from '../../global/helpers'
import clsx from 'clsx'
import { AppStoreLinks } from '../../global/links/app_store_links'

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  handleDrawerClose,
  user: identity,
  isLoading,
  handleOpenState,
}: SidebarProfileProps) => {
  const isMobileOrTablet: boolean = useIsMobileOrTabletView()
  const history = useHistory()
  const location = useLocation()

  const {
    webProfile,
    profilePic,
    ringIcon,
    mobileProfile,
    mobileProfilePic,
    mobileUserInfo,
    gidName,
    name,
    viewProfile,
    mobileProfileIcon,
    skeletonRect,
    profileIconContainer,
    profileAvatar,
    qrContainer,
    activeProfilePage,
  } = useStyles()

  const isMyProfilePageSelected: boolean = `/${identity?.gid_name}` === location.pathname

  const showProfile = (): void => {
    if (identity !== undefined) {
      pushTo(history, `/${identity.gid_name}`)

      if (isMobileOrTablet) {
        handleDrawerClose?.()
      }
    }
  }

  const getAvatar = (): JSX.Element =>
    <GeneralAvatar
      className={profileAvatar}
      key={identity?.gid_uuid}
      image_url={identity?.display_image_url}
      uuid={identity?.gid_uuid} variant={AvatarVariant.Circle}
    />

  const getQrCodeWidget = (): JSX.Element =>
    <div className={qrContainer}>
      <QRWidget
        qrCodeTexts={qrCodeTexts}
        qrCodeUrls={{
          ...qrCodeUrls,
          globalIdAppUrl: () => handleOpenState?.('getApp'),
        }}
        qrOptions={qrOptions}
        onApproveCallback={redirectWithAuthCredentials}
        getAuthRequestStatusCallback={getAuthenticationRequestStatus}
        createAuthRequestCallback={createAuthenticationRequestWithArgs}
      />
    </div>

  return (
    <>
      {isMobileOrTablet ? (
        <div data-testid='mobile-profile' className={mobileProfile}>
          <Skeleton
            variant='circle'
            wrapperClassName={mobileProfilePic}
            className={mobileProfileIcon}
            radius={50}
            ignoreSkeleton={!isLoading}
          >
            {getAvatar()}
          </Skeleton>
          {(identity || isLoading) && (
            <Skeleton className={skeletonRect}>
              <div className={mobileUserInfo}>
                <div className={gidName}>{identity?.gid_name}</div>
                <div className={name}>
                  {identity?.display_name} - {identity?.country_name}
                </div>
                <div className={viewProfile} onClick={showProfile}>
                  View Profile
                </div>
              </div>
            </Skeleton>
          )}
        </div>
      ) : (
        <div>
          {(identity || isLoading) ? (
            <div data-testid='profile' className={webProfile} onClick={showProfile}>
              <div className={clsx(profilePic, { [activeProfilePage]: isMyProfilePageSelected })}>
                <Skeleton
                  variant='circle'
                  wrapperClassName={ringIcon}
                  radius={50}
                  ignoreSkeleton={!isLoading}
                >
                  <div className={profileIconContainer}>
                    {getAvatar()}
                  </div>
                </Skeleton>
              </div>
            </div>
          ) : <div>{getQrCodeWidget()}</div>}

          {!identity && <AppStoreLinks />}
        </div>
      )}
    </>
  )
}

