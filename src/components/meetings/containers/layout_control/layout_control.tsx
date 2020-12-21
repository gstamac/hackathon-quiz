import React from 'react'
import { useAppState } from '../../providers/app_state_provider'
import StandardIcon from '../../../../assets/icons/spaces.svg'
import FeaturedIcon from '../../../../assets/icons/maximize.svg'
import { StyleLayoutControl } from './layout_control.styled'
import { Layout } from '../../enums'

export const LayoutControl: React.FC = () => {
  const { layout, theme, toggleLayout } = useAppState()

  return (
    <StyleLayoutControl theme={theme} onClick={toggleLayout}>
      <img alt='Layout' src={layout === Layout.Featured ? FeaturedIcon : StandardIcon} />
      <div>{layout}</div>
    </StyleLayoutControl>
  )
}
