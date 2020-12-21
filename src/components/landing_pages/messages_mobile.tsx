import { ButtonState, PrimaryButton } from 'globalid-react-ui'
import React from 'react'
import { APPLE_STORE_LINK, GOOGLE_STORE_LINK } from '../../constants'
import { useStyles } from './styles'
import messagesBackgroundIcon from '../../assets/icons/messages-background.svg'
import iosStoreIcon from '../../assets/icons/ios_store.svg'
import googlePlayStore from '../../assets/icons/google_play_store.svg'
import { getString } from '../../utils'

export const MessagesMobile: React.FC = () => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPic,
    comingSoon,
    description,
    upperMargin,
    buttonText,
    appsLinksContainer,
    googlePlayButton,
  } = classes

  const handleOnClick = (): void => {
    const isMacintosh: boolean = window.navigator.platform.includes('Mac')
    const link: string = isMacintosh ? APPLE_STORE_LINK : GOOGLE_STORE_LINK

    window.open(link, '_blank')
  }

  return (
    <div data-testid={'messages'} className={contentWrapper}>
      <img
        className={backgroundPic}
        src={messagesBackgroundIcon}
        alt='Messages background icon'
      />
      <div className={comingSoon}>
        {getString('messages-mobile-text')}
      </div>
      <div className={description}>
        {getString('continue-to-app-description')}
      </div>
      <div className={upperMargin}>
        <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={handleOnClick}><span
          className={buttonText}>{getString('messages-button')}</span></PrimaryButton>
      </div>
      <div className={appsLinksContainer}>
        <a href={APPLE_STORE_LINK} target='_blank' rel='noopener noreferrer'>
          <img src={iosStoreIcon} alt={'ios app store'}/>
        </a>
        <a href={GOOGLE_STORE_LINK} className={googlePlayButton} target='_blank' rel='noopener noreferrer'>
          <img src={googlePlayStore} alt={'google play store'}/>
        </a>
      </div>
    </div>
  )
}
