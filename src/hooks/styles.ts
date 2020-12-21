import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles(() => ({
  viewProfileMenuItemAvatar: {
    '&.MuiAvatar-root, &.MuiAvatar-root img': {
      width: '90px',
      height: '90px',
    },
  },
}))
