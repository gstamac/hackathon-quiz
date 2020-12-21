import { Theme, useTheme } from '@material-ui/core'
import React, { useEffect, useRef } from 'react'
import { BooleanState } from '../../../hooks/interfaces'
import { useBooleanState } from '../../../hooks/use_boolean_state'
import { settingsIcon } from '../icons/settings_icon'
import { QuickMenu } from '../quick_menu'
import { SettingsCardProps } from './interfaces'
import { useStyles } from './styles'

export const SettingsCard: React.FC<SettingsCardProps> = ({ title, menuItems, middleText, description, isDialogOpen }) => {
  const theme: Theme = useTheme()
  const { settingsCard, settingsCardInfo, settingsCardIcon, settingsCardName, settingsCardDescription } = useStyles()
  const settingsIconElement: React.MutableRefObject<HTMLImageElement | null> = useRef<HTMLImageElement>(null)
  const [isSettingsOpen, openSettings, closeSettings]: BooleanState = useBooleanState(false)
  const { electricBlue, midGray } = theme.palette.customColors

  useEffect(() => {
    if (isDialogOpen) {
      closeSettings()
    }
  }, [isDialogOpen])

  return (
    <div key={title}>
      <div className={settingsCard}>
        <div className={settingsCardInfo}>
          <span className={settingsCardName}>{title}</span>
          {middleText}
          {description && <span className={settingsCardDescription}>{description}</span>}
        </div>
        <div
          data-testid='settings-button'
          className={settingsCardIcon}
          ref={settingsIconElement}
          onClick={openSettings}
        >
          {settingsIcon({ color: isSettingsOpen ? electricBlue : midGray })}
        </div>
      </div>

      <QuickMenu
        compact={true}
        cursorAt={settingsIconElement}
        items={menuItems}
        onClose={closeSettings}
        open={isSettingsOpen}
      />
    </div>
  )
}
