import { makeStyles, Theme } from '@material-ui/core/styles'

export interface Props {
  isBrowserNotificationsPromptVisible?: boolean
}

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: 'hidden',
    background: theme.palette.customColors.white,
    '& > *': {
      display: 'flex',
      flexWrap: 'wrap',
    },
    '& > * > *': {
      [theme.breakpoints.down('sm')]: {
        margin: 0,
      },
    },
    '& > * > :last-child': {
      flexBasis: 0,
      flexGrow: 999,
      [theme.breakpoints.down('sm')]: {
        paddingBottom: 45,
      },
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRight: `1px solid ${theme.palette.customColors.transparentWhite}`,
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },

  content: {
    flexGrow: 1,
  },

  layoutMargin: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: '64px',
    },
  },

  fullWidthContainer: {
    width: '100%',
    zIndex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: 70,
    },
  },

  containerMargin: {
    [theme.breakpoints.up('md')]: {
      marginLeft: '220px',
    },
  },
}))
