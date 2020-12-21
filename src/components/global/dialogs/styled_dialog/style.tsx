import { makeStyles, Theme, withStyles } from '@material-ui/core/styles'

export const titleStyles = withStyles((theme: Theme) => ({
  root: {
    paddingTop: '24px',
    paddingBottom: 0,
    [theme.breakpoints.down('sm')]: {
      flex: 0.8,
    },
  },
}))
export const contentStyles = withStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      // :TODO
    },
  },
}))
export const actionStyles = withStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(4),
    alignItems: 'start',
    justifyContent: 'center',
    paddingTop: 0,
    [theme.breakpoints.down('xs')]: {
      paddingBottom: '24px',
    },
  },
}))

export const dialogStyles = withStyles((theme: Theme) => ({
  paper: {
    [theme.breakpoints.up('sm')]: {
      width: '375px',
    },
  },
}))

export const useStyles = makeStyles({
  appStoreLinks: {
    marginBottom: '-20px',
  },
})
