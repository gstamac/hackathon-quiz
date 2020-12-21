import React from 'react'
import { useStyles } from './styles'
import groupsBackgroundIcon from '../../assets/icons/page_not_found_background.svg'
import globaliDLogo from '../../assets/icons/globalid_new_logo.svg'
import { getString, redirectToSignUp } from '../../utils'
import { PrimaryButton, ButtonState } from 'globalid-react-ui'
import { useRouteMatch } from 'react-router-dom'
import { PageNotFoundProps } from './interfaces'

export const ProfileNotFound: React.FC<PageNotFoundProps> = ({ isLoggedIn }: PageNotFoundProps) => {
  const classes = useStyles()
  const {
    pageNotFoundWrapper,
    backgroundPic,
    comingSoon,
    description,
    returnToLogin,
    buttonText,
  } = classes

  const match = useRouteMatch<{ gid_name: string }>()
  const gidNameParam = match.params.gid_name

  return (
    <>
      <div className={pageNotFoundWrapper} role='profile-not-found'>
        <img
          src={globaliDLogo}
          alt='GlobaliD logo'
        />
        <img
          className={backgroundPic}
          src={groupsBackgroundIcon}
          alt='Profile not found background icon'
        />
        <span className={comingSoon}>
          {getString('profile-not-found-title')}
        </span>
        <span className={description}>
          {getString('profile-not-found-description-1')}
          {gidNameParam}
          {getString('profile-not-found-description-2')}
        </span>

        { !isLoggedIn && (<div className={returnToLogin}>
          <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={redirectToSignUp}><span className={buttonText}>{getString('profile-not-found-button')}</span></PrimaryButton>
        </div>)
        }
      </div>
    </>
  )
}
