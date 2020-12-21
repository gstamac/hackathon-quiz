import React from 'react'
import { Checkbox as CheckboxMUI } from '@material-ui/core'
import { useStyles } from './styles'
import { CheckboxProps } from './interfaces'
import {
  CheckboxOffIcon,
  CheckboxOnIcon,
} from './../icons'

export const Checkbox: React.FC<CheckboxProps> = (props: CheckboxProps) => {
  const classes = useStyles()

  return <CheckboxMUI
    checked={props.checked}
    checkedIcon={<CheckboxOnIcon/>}
    className={classes.checkbox}
    color='default'
    disableRipple={true}
    icon={<CheckboxOffIcon/>}
  />
}
