import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles(() => ({
  getTheAppLinks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '20px',
    alignItems: 'center',
    '& > a': {
      padding: 5,
    },
  },
}))
