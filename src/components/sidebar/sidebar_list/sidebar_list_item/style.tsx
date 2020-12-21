import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  listItemIcon: {
    fontSize: '12px',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
      fontSize: '16px',
    },
  },

  skeleton: {
    height: '48px',
    width: '178px',
    margin: 'auto',
    marginBottom: theme.spacing(1),
  },

  mobileSkeleton: {
    height: '48px',
    width: '100%',
    margin: 'auto',
    marginBottom: theme.spacing(1),
  },

  listItemWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
    },
  },

  postIcon: {
    alignSelf: 'flex-end',
  },

  notificationMarkWrapper: {
    width: '100%',
    position: 'relative',
  },

  notificationMark: {
    position: 'absolute',
    right: '4px',
    bottom: '-2px',
  },
}))
