import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  peoplePage: {
    display: 'flex',
  },
  peopleContentWrapper: {
    flex: 1,
  },
  peopleContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(6.5),
    [theme.breakpoints.between('sm', 'md')]: {
      padding: theme.spacing(6.5, 2.5),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6.5, 1.25),
    },
    height: '100%',
    position: 'relative',
    paddingTop: theme.spacing(15.5),
  },
  contactsWrapper: {
    flex: 1,
    maxWidth: '375px',
    borderRadius: 0.5,
    [theme.breakpoints.between('xs', 'sm')]: {
      maxWidth: '100%',
    },
    borderRight: `1px solid ${theme.palette.customColors.brightGray}`,
  },
  contactsSize: {
    height: 366,
    width: 361,
    [theme.breakpoints.between('sm', 'md')]: {
      height: 283,
      width: 283,
    },
    [theme.breakpoints.down('sm')]: {
      height: 200,
      width: 200,
    },
  },
  header: {
    maxWidth: '278px',
    marginTop: theme.spacing(6.75),
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    lineHeight: '23px',
    textAlign: 'center',
  },
  description: {
    maxWidth: '300px',
    marginTop: theme.spacing(3),
    color: theme.palette.customColors.midGray,
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    textAlign: 'center',
  },
}))
