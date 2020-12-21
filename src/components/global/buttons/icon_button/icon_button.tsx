import React from 'react'
import { useStyles } from './styles'
import { IconButtonProps } from './interfaces'
import { getPeopleIcons } from './helpers'
import { Skeleton } from '../../skeletons'
import { Tooltip, CircularProgress } from '@material-ui/core'
import { getString } from '../../../../utils'
import { useToggledState } from '../../../../hooks/use_toggled_state'
import { ToggledStateResult } from '../../../../hooks/interfaces'

export const IconButton: React.FC<IconButtonProps> = ({ disabled, handleClick, icon, loading, title, tooltipText }: IconButtonProps) => {
  const [ inProgress, triggerClickHandle ]: ToggledStateResult = useToggledState({
    initialState: false,
    condition: () => !disabled,
    command: handleClick,
  })

  const { buttonWrapper, iconButton, iconButtonSkeleton, iconSize, buttonTitle, spinner } = useStyles({ disabled: disabled ?? inProgress })

  const handleOnClick = async (): Promise<void> => {
    await triggerClickHandle()
  }

  const getTooltipText = (): string => {
    if (inProgress) {
      return getString('loading')
    }

    return disabled ? tooltipText ?? getString('coming-soon') : ''
  }

  return (
    <Tooltip data-testid={'button-tooltip'} title={getTooltipText()}>
      <div className={buttonWrapper}>
        {inProgress && <div className={spinner}><CircularProgress/></div>}
        <Skeleton loading={loading} className={iconButtonSkeleton}>
          <div className={iconButton} onClick={handleOnClick}>
            <img src={getPeopleIcons(icon)} className={iconSize} alt='icon-button'></img>
          </div>
        </Skeleton>
        <Skeleton loading={loading} className={buttonTitle}>
          <div data-testid={'button-title'} className={buttonTitle} onClick={handleOnClick}>
            <span>{title}</span>
          </div>
        </Skeleton>
      </div>
    </Tooltip>
  )
}
