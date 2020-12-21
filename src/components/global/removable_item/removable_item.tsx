import React from 'react'
import { useStyles } from './styles'
import { RemovableItemProps } from './interfaces'
import RemoveIcon from '../../../assets/icons/remove_icon_borderless.svg'

export const RemovableItem: React.FC<RemovableItemProps> = ({
  image,
  label,
  onRemove,
}: RemovableItemProps): JSX.Element => {
  const classes = useStyles()

  return (
    <div className={classes.itemWrapper}>
      {image}
      <img className={classes.removeIcon} src={RemoveIcon} alt='remove item' onClick={onRemove} />
      <div className={classes.labelText}>{label}</div>
    </div>
  )
}
