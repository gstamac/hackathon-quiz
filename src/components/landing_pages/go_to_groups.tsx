import React from 'react'
import { useStyles } from './styles'
import groupsBackgroundIcon from '../../assets/icons/groups_background.svg'
import { getString, pushTo } from '../../utils'
import { PrimaryButton, ButtonState } from 'globalid-react-ui'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

export const GoToGroups: React.FC = () => {
  const classes = useStyles()
  const history = useHistory()

  const {
    contentWrapper,
    backgroundPicExtra,
    comingSoon,
    description,
    upperMargin,
    buttonText,
    buttonWidth,
    paddingTopGoToGroups,
  } = classes

  return (
    <div data-testid={'go_to_groups'} className={clsx(contentWrapper, paddingTopGoToGroups)}>
      <img
        className={backgroundPicExtra}
        src={groupsBackgroundIcon}
        alt='Go to Groups background icon'
      />
      <span className={comingSoon}>
        {getString('messages-group-none')}
      </span>
      <span className={description}>
        {getString('groups-create')}
      </span>
      <div className={upperMargin}>
        <PrimaryButton className={buttonWidth} buttonState={ButtonState.DEFAULT} onClick={() => pushTo(history, '/app/groups')}><span className={buttonText}>{getString('go-to-groups')}</span></PrimaryButton>
      </div>
    </div>
  )
}
