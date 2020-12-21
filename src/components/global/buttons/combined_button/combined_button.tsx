import React from 'react'
import { useStyles } from './styles'
import { CombinedButtonProps, MobileViewContent } from './interfaces'
import { useIsMobileOrTabletView } from '../../helpers'

export const CombinedButton: React.FC<CombinedButtonProps> = ({ handleClick, icon, title, mobileViewContent, active, className }: CombinedButtonProps) => {
  const isMobileOrTablet: boolean = useIsMobileOrTabletView()
  const { wrapper } = useStyles({ active })

  const buttonContent = (): JSX.Element => (<>
    {(mobileViewContent === MobileViewContent.ICON ||
      mobileViewContent === MobileViewContent.COMBINED || !isMobileOrTablet) &&
        <img src={icon}></img>
    }
    {(mobileViewContent === MobileViewContent.TEXT ||
      mobileViewContent === MobileViewContent.COMBINED || !isMobileOrTablet) &&
        <span>{title}</span>
    }
  </>
  )

  return (
    <div data-testid='combined_button' className={`${className ?? wrapper}`} onClick={handleClick}>
      {buttonContent()}
    </div>
  )
}
