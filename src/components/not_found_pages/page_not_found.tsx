import React from 'react'
import { useStyles } from './styles'
import groupsBackgroundIcon from '../../assets/icons/page_not_found_background.svg'
import globaliDLogo from '../../assets/icons/globalid_new_logo.svg'
import { pushTo, getString } from '../../utils'
import { useHistory } from 'react-router-dom'
import { PrimaryButton, ButtonState } from 'globalid-react-ui'

export const PageNotFound: React.FC = () => {
  const history = useHistory()
  const classes = useStyles()
  const {
    pageNotFoundWrapper,
    backgroundPic,
    comingSoon,
    description,
    returnToLogin,
    buttonText,
  } = classes

  return (
    <>
      <div className={pageNotFoundWrapper}>
        <img
          src={globaliDLogo}
          alt='GlobaliD logo'
        />
        <img
          className={backgroundPic}
          src={groupsBackgroundIcon}
          alt='Page not found background icon'
        />
        <span className={comingSoon}>
          {getString('page-not-found-title')}
        </span>
        <span className={description}>
          {getString('page-not-found-description')}
        </span>

        <div className={returnToLogin}>
          <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={() => pushTo(history, '/app/login')}><span className={buttonText}>{getString('page-not-found-button')}</span></PrimaryButton>
        </div>
      </div>
    </>
  )
}
