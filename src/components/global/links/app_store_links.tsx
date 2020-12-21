import React from 'react'
import { useStyles } from './styles'
import { APPLE_STORE_LINK, GOOGLE_STORE_LINK } from '../../../constants'
import iosStoreIcon from '../../../assets/icons/ios_store.svg'
import googlePlayStore from '../../../assets/icons/google_play_store.svg'
import { getString } from '../../../utils'

export const AppStoreLinks: React.FC = () => {
  const { getTheAppLinks } = useStyles()

  return <div className={getTheAppLinks}>
    <a href={APPLE_STORE_LINK} target='_blank' rel='noopener noreferrer'>
      <img src={iosStoreIcon} alt={getString('ios-app-store')} />
    </a>
    <a href={GOOGLE_STORE_LINK} target='_blank' rel='noopener noreferrer'>
      <img src={googlePlayStore} alt={getString('google-play-store')} />
    </a>
  </div>
}
