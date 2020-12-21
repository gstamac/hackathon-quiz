import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(() => ({
  checkbox: {
    '&.MuiCheckbox-root:hover': {
      backgroundColor: 'transparent',
    },
  },
}))
