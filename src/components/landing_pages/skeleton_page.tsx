import React from 'react'
import { useStyles } from './styles'
import { GlobalidLoader } from '../global/loading/globalid_loader'

export const SkeletonPage: React.FC = () => {
  const classes = useStyles()
  const {
    contentWrapper,
  } = classes

  return (
    <div data-testid={'messages'} className={contentWrapper}>
      <GlobalidLoader />
    </div>
  )

}
