import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  identitiesSearch: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '375px',
    [theme.breakpoints.between('xs', 'sm')]: {
      maxWidth: '100%',
    },
    paddingTop: '12px',
    height: 'calc(100vh - 80px)',
  },

  loaderWrapper: {
    paddingTop: 48,
    display: 'flex',
    justifyContent: 'center',
  },
}))
