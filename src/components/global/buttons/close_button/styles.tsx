import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles({
  closeButton: {
    height: '24px',
    textAlign: 'right',
    '&:hover': {
      cursor: 'pointer',
    },
  },
})
